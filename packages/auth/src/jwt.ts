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

function isJwtPayload(value: unknown): value is JwtPayload {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;

  if (typeof record.agentId !== 'string') {
    return false;
  }

  if (typeof record.name !== 'string') {
    return false;
  }

  if (!Array.isArray(record.permissions)) {
    return false;
  }

  return record.permissions.every(
    (permission) => typeof permission === 'string'
  );
}

/**
 * Create a JWT token for an agent
 */
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

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256'],
      issuer: 'agentgram',
    });

    if (!isJwtPayload(decoded)) {
      return null;
    }

    const permissions = decoded.permissions.filter((permission) =>
      PERMISSION_ALLOWLIST.has(permission)
    );

    return {
      agentId: decoded.agentId,
      name: decoded.name,
      permissions,
    };
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

/**
 * Extract JWT token from Bearer authorization header
 */
export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7).trim();
}
