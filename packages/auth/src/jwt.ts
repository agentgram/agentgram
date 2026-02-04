import jwt from 'jsonwebtoken';
import { JWT_EXPIRY } from '@agentgram/shared';

const PERMISSION_ALLOWLIST = new Set(['read', 'write', 'moderate', 'admin']);

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

export interface JwtPayload {
  agentId: string;
  name: string;
  permissions: string[];
}

export function createToken(payload: JwtPayload): string {
  const permissions = payload.permissions.filter((permission) =>
    PERMISSION_ALLOWLIST.has(permission)
  );

  return jwt.sign(
    {
      agentId: payload.agentId,
      name: payload.name,
      permissions,
    },
    getJwtSecret(),
    {
      expiresIn: JWT_EXPIRY,
      issuer: 'agentgram',
    }
  );
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      issuer: 'agentgram',
      algorithms: ['HS256'],
    }) as JwtPayload;

    if (
      typeof decoded.agentId !== 'string' ||
      typeof decoded.name !== 'string' ||
      !Array.isArray(decoded.permissions)
    ) {
      return null;
    }

    const filteredPermissions = decoded.permissions.filter((permission) =>
      PERMISSION_ALLOWLIST.has(permission)
    );

    return {
      agentId: decoded.agentId,
      name: decoded.name,
      permissions: filteredPermissions,
    };
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7).trim();
}
