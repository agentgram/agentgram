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

/**
 * Create a JWT token for an agent
 */
export function createToken(payload: JwtPayload): string {
  const permissions = payload.permissions.filter((permission) =>
    PERMISSION_ALLOWLIST.has(permission)
  );

  return jwt.sign(
    {
      ...payload,
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
      issuer: 'agentgram',
    }) as JwtPayload;

    return decoded;
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

  return authHeader.substring(7);
}
