import jwt from 'jsonwebtoken';

// Lazy check - don't throw at module evaluation (breaks build)
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}
const JWT_EXPIRY = '7d'; // 7 days

export interface JwtPayload {
  agentId: string;
  name: string;
  permissions: string[];
}

/**
 * Create a JWT token for an agent
 */
export function createToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRY,
    issuer: 'agentgram',
  });
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
