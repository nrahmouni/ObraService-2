import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

interface RateLimitOptions {
  windowMs: number; // e.g. 60000 for 1 minute
  maxRequests: number; // max requests within window
  message?: string;
  statusCode?: number;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    message = 'Demasiadas solicitudes. Por favor, espere antes de reintentar.',
    statusCode = 429,
  } = options;

  const store = new Map<string, RequestRecord>();

  // Periodically clean up stale records every 2 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }, 120000).unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const authReq = req as AuthRequest;
    
    // Identifier prioritizes authenticated user UID, otherwise IP address
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 
                     req.socket.remoteAddress || 
                     'anonymous';
    const clientKey = authReq.user?.uid ? `user_${authReq.user.uid}` : `ip_${clientIp}`;

    let record = store.get(clientKey);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      store.set(clientKey, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, maxRequests - record.count);
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > maxRequests) {
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(statusCode).json({
        error: message,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfterSeconds,
      });
    }

    next();
  };
}
