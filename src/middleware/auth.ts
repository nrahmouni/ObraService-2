import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../services/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

export const isSuperAdminToken = (token: DecodedIdToken): boolean => {
  return (
    token.role === 'SUPER_ADMIN' ||
    token.SUPER_ADMIN === true ||
    token.superAdmin === true
  );
};

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireSuperAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const handleCheck = () => {
    if (!req.user || !isSuperAdminToken(req.user)) {
      return res.status(403).json({
        error: 'Forbidden: Se requiere el custom claim SUPER_ADMIN gestionado por backend para acceder a este recurso.',
        code: 'SUPER_ADMIN_CLAIM_REQUIRED',
      });
    }
    next();
  };

  if (!req.user) {
    return requireAuth(req, res, () => {
      handleCheck();
    });
  }

  handleCheck();
};

