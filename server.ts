import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { z } from 'zod';
import { requireAuth, requireSuperAdmin, AuthRequest, VALID_ROLES } from './src/middleware/auth.ts';
import { createRateLimiter } from './src/middleware/rateLimit.ts';
import { adminAuth } from './src/services/firebase-admin.ts';
import { db } from './src/db/index.ts';
import { users } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';

dotenv.config();

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

const syncUserSchema = z.object({
  name: z.string().max(150).optional(),
});

const grantRoleSchema = z.object({
  targetUid: z.string().max(128).optional(),
  targetEmail: z.string().email().optional(),
  role: z.enum(VALID_ROLES),
  companyId: z.string().max(128).optional(),
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy for Cloud Run ingress / reverse proxies
  app.set('trust proxy', 1);

  // Helmet Security Headers (CSP, HSTS, X-Content-Type-Options, Frame-Ancestors)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com", "https://maps.googleapis.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          connectSrc: ["'self'", "https://*.googleapis.com", "https://*.firebaseio.com", "https://*.cloudfunctions.net"],
          frameSrc: ["'self'", "https://*.firebaseapp.com", "https://accounts.google.com"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // Force HTTPS in production (Cloud Run Forwarded Proto check)
  app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host || req.hostname}${req.url}`);
    }
    next();
  });

  app.use(express.json({ limit: '5mb' }));

  // Rate Limiting (Note: Memory store rate limiter applies per container instance in horizontal Cloud Run deployments)
  const globalApiLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 120,
    message: 'Límite de peticiones de API excedido. Por favor, espere 1 minuto.',
  });
  app.use('/api', globalApiLimiter);

  const aiRateLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10,
    message: 'Límite de solicitudes de IA alcanzado (máx. 10 por minuto).',
  });

  const adminRateLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 30,
    message: 'Límite de operaciones administrativas alcanzado.',
  });

  // --- API Routes ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'ObraService Pro Backend', timestamp: new Date().toISOString() });
  });

  // Server-side AI Analysis
  app.post('/api/ai/analyze-report', requireAuth, aiRateLimiter, async (req: AuthRequest, res) => {
    try {
      const { report, project } = req.body;
      if (!report) {
        return res.status(400).json({ error: 'Datos del parte diario requeridos.' });
      }

      const ai = getGeminiClient();
      if (!ai) {
        const fallbackItems = [];
        if ((report.totalExtraHours || 0) > 4) {
          fallbackItems.push({
            id: `heur_${Date.now()}_1`,
            type: 'EXTRA_HOURS_RISK',
            severity: 'MEDIA',
            title: 'Volumen elevado de horas extraordinarias',
            explanation: `Se han registrado ${report.totalExtraHours}h extras en total.`,
            recommendation: 'Revisar con los encargados antes de validar.',
            resolved: false,
          });
        }
        return res.json({ items: fallbackItems, source: 'heuristics' });
      }

      const prompt = `Actúa como perito de construcción analizando un parte diario.
Proyecto: ${project?.name || report.projectNameSnapshot}
Fecha: ${report.date}
Total horas normales: ${report.totalNormalHours}h
Total horas extra: ${report.totalExtraHours}h
Comentarios: "${report.comments || 'Ninguno'}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING },
                severity: { type: Type.STRING },
                title: { type: Type.STRING },
                explanation: { type: Type.STRING },
                recommendation: { type: Type.STRING },
                resolved: { type: Type.BOOLEAN },
              },
              required: ['id', 'type', 'severity', 'title', 'explanation', 'recommendation', 'resolved'],
            },
          },
        },
      });

      const parsed = JSON.parse(response.text || '[]');
      return res.json({ items: parsed, source: 'gemini' });
    } catch (err: any) {
      console.error('Error in /api/ai/analyze-report:', err?.message || err);
      return res.json({ items: [], source: 'safe_fallback' });
    }
  });

  // Secure User Sync: Role and company are derived strictly from token claims, client role is ignored
  app.post('/api/auth/sync-user', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const parseResult = syncUserSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: 'Datos de sincronización inválidos', details: parseResult.error.format() });
      }

      const { name } = parseResult.data;

      // Derive role and companyId strictly from server claims
      const derivedRole = user.role || 'SITE_MANAGER';
      const derivedCompanyId = user.company_id || user.companyId || '';

      const result = await db.insert(users)
        .values({
          id: user.uid,
          email: user.email || '',
          name: name || user.name || 'Usuario ObraService',
          role: derivedRole,
          active: true,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            email: user.email || '',
            name: name || user.name || 'Usuario ObraService',
            role: derivedRole,
          },
        })
        .returning();

      console.log(`[Security Audit] User synced: UID=${user.uid}, Email=${user.email}, Role=${derivedRole}, Company=${derivedCompanyId}`);
      return res.json({ success: true, user: result[0] });
    } catch (err: any) {
      console.error('Error syncing user to SQL:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // --- Admin RBAC Management Endpoints ---

  app.get('/api/admin/verify-super-admin', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ isSuperAdmin: false, error: 'No autenticado.' });
      }

      const isSuper = user.role === 'SUPER_ADMIN';
      if (!isSuper) {
        return res.status(403).json({
          isSuperAdmin: false,
          error: 'Acceso denegado: Se requiere custom claim SUPER_ADMIN.',
        });
      }

      return res.json({
        isSuperAdmin: true,
        uid: user.uid,
        email: user.email,
        claims: {
          role: user.role,
          companyId: user.company_id || user.companyId,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ isSuperAdmin: false, error: err?.message || 'Error al verificar token' });
    }
  });

  app.post('/api/admin/grant-role', adminRateLimiter, requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const parseResult = grantRoleSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: 'Parámetros inválidos', details: parseResult.error.format() });
      }

      const { targetUid, targetEmail, role, companyId } = parseResult.data;

      let uid = targetUid;
      let userRecord;

      try {
        if (uid) {
          userRecord = await adminAuth.getUser(uid);
        } else if (targetEmail) {
          userRecord = await adminAuth.getUserByEmail(targetEmail.trim().toLowerCase());
          uid = userRecord.uid;
        } else {
          return res.status(400).json({ error: 'Se requiere targetUid o targetEmail.' });
        }
      } catch (err: any) {
        return res.status(404).json({ error: 'Usuario no encontrado en Firebase Auth.' });
      }

      if (!userRecord || !uid) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      const currentClaims = userRecord.customClaims || {};
      const newClaims: Record<string, any> = {
        ...currentClaims,
        role,
        company_id: companyId !== undefined ? companyId : (currentClaims.company_id || currentClaims.companyId || ''),
        companyId: companyId !== undefined ? companyId : (currentClaims.companyId || currentClaims.company_id || ''),
      };

      await adminAuth.setCustomUserClaims(uid, newClaims);

      console.log(`[Security Audit] Role granted by Admin ${req.user?.uid}: UID=${uid}, Role=${role}, Company=${companyId || 'N/A'}`);

      return res.json({
        success: true,
        message: `Rol '${role}' asignado exitosamente.`,
        uid,
        email: userRecord.email,
        claims: newClaims,
      });
    } catch (err: any) {
      console.error('Error in /api/admin/grant-role:', err);
      return res.status(500).json({ error: 'Error interno del servidor al asignar rol.' });
    }
  });

  app.get('/api/admin/list-claims', adminRateLimiter, requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const { email, uid } = req.query;
      if (email) {
        const u = await adminAuth.getUserByEmail(String(email).trim().toLowerCase());
        return res.json({ uid: u.uid, email: u.email, customClaims: u.customClaims || {} });
      }
      if (uid) {
        const u = await adminAuth.getUser(String(uid));
        return res.json({ uid: u.uid, email: u.email, customClaims: u.customClaims || {} });
      }

      const list = await adminAuth.listUsers(50);
      const usersList = list.users.map(u => ({
        uid: u.uid,
        email: u.email,
        displayName: u.displayName,
        customClaims: u.customClaims || {},
      }));

      return res.json({ users: usersList });
    } catch (err: any) {
      return res.status(500).json({ error: 'Error al listar claims' });
    }
  });

  // Secure Bootstrap: Requires ephemeral setup secret OR verifies zero super admins exist
  app.post('/api/admin/bootstrap-first-super-admin', adminRateLimiter, async (req, res) => {
    try {
      const { email, setupSecret } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'El email del usuario es obligatorio.' });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      let isAuthorized = false;

      if (process.env.INITIAL_SETUP_SECRET && setupSecret === process.env.INITIAL_SETUP_SECRET) {
        isAuthorized = true;
      } else {
        const list = await adminAuth.listUsers(100);
        const hasExistingSuperAdmin = list.users.some(u => u.customClaims?.role === 'SUPER_ADMIN');
        if (!hasExistingSuperAdmin) {
          isAuthorized = true;
        }
      }

      if (!isAuthorized) {
        console.warn(`[Security Alert] Unauthorized bootstrap attempt for email: ${cleanEmail}`);
        return res.status(403).json({
          error: 'Operación denegada. El sistema ya cuenta con administradores o el secreto es inválido.',
        });
      }

      const userRecord = await adminAuth.getUserByEmail(cleanEmail);
      const newClaims = {
        role: 'SUPER_ADMIN',
      };

      await adminAuth.setCustomUserClaims(userRecord.uid, newClaims);

      console.log(`[Security Audit] First Super Admin bootstrapped successfully: ${userRecord.email} (${userRecord.uid})`);

      return res.json({
        success: true,
        message: `Privilegio SUPER_ADMIN asignado con éxito a ${userRecord.email}`,
        uid: userRecord.uid,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Error en proceso de bootstrap' });
    }
  });

  // API 404 Handler
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: 'Endpoint de API no encontrado', code: 'NOT_FOUND' });
  });

  // Global Error Handler Middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Unhandled Server Error]', err);
    res.status(500).json({ error: 'Error interno del servidor', code: 'INTERNAL_ERROR' });
  });

  // --- Vite Middleware or Static Production Serving ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ObraService Pro server running securely on http://0.0.0.0:${PORT}`);
  });
}

startServer();

