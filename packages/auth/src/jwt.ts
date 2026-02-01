import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRY = '7d'; // 7일

export interface JwtPayload {
  agentId: string;
  name: string;
  permissions: string[];
}

// JWT 토큰 생성
export function createToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    issuer: 'agentgram',
  });
}

// JWT 토큰 검증
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'agentgram',
    }) as JwtPayload;

    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

// Bearer 토큰에서 JWT 추출
export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
}
