import { NextFunction, Request, Response } from 'express';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';

const issuer = process.env.AUTH0_ISSUER_URL?.replace(/\/$/, '');
const audience = process.env.AUTH0_AUDIENCE;
const rolesClaim = process.env.AUTH0_ROLES_CLAIM || 'https://agrohero.app/roles';
const jwks = issuer ? createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`)) : null;

export type AppRole = 'consumer' | 'farmer' | 'admin';

export interface AuthenticatedRequest extends Request {
  auth?: JWTPayload & { roles?: unknown };
}

export const authConfigured = Boolean(issuer && audience && jwks);

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!authConfigured || !jwks || !issuer || !audience) {
    return res.status(503).json({ error: 'Autenticação de produção não está configurada.' });
  }

  const authorization = req.header('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de acesso obrigatório.' });
  }

  try {
    const { payload } = await jwtVerify(authorization.slice(7), jwks, {
      issuer: `${issuer}/`,
      audience,
    });
    req.auth = payload as AuthenticatedRequest['auth'];
    return next();
  } catch {
    return res.status(401).json({ error: 'Token de acesso inválido ou expirado.' });
  }
}

export function requireRole(...allowedRoles: AppRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const roles = req.auth?.[rolesClaim];
    const normalizedRoles = Array.isArray(roles) ? roles.filter((role): role is string => typeof role === 'string') : [];
    if (!allowedRoles.some((role) => normalizedRoles.includes(role))) {
      return res.status(403).json({ error: 'Você não tem permissão para esta operação.' });
    }
    return next();
  };
}
