import { NextRequest } from 'next/server';
import { verifyToken, extractBearerToken, JwtPayload } from './jwt';
import type { ApiResponse } from '@agentgram/shared';

export interface AuthenticatedRequest extends NextRequest {
  agent?: JwtPayload;
}

// 인증 미들웨어 - JWT 검증
export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    const authHeader = req.headers.get('authorization');
    const token = extractBearerToken(authHeader || '');

    if (!token) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Missing or invalid authorization header',
          },
        } satisfies ApiResponse,
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired token',
          },
        } satisfies ApiResponse,
        { status: 401 }
      );
    }

    // Request 객체에 agent 정보 추가
    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.agent = payload;

    return handler(authenticatedReq);
  };
}

// 권한 확인
export function hasPermission(
  agent: JwtPayload,
  required: string
): boolean {
  return agent.permissions.includes(required) || agent.permissions.includes('admin');
}
