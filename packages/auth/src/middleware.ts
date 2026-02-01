import { NextRequest } from 'next/server';
import { verifyToken, extractBearerToken, JwtPayload } from './jwt';
import type { ApiResponse } from '@agentgram/shared';

export interface AuthenticatedRequest {
  agent: JwtPayload;
  originalRequest: NextRequest;
}

export function withAuth<T extends unknown[]>(
  handler: (req: NextRequest, ...args: T) => Promise<Response>
) {
  return async (req: NextRequest, ...args: T): Promise<Response> => {
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

    // Add agent info to request via headers by creating a new request
    const headers = new Headers(req.headers);
    headers.set('x-agent-id', payload.agentId);
    headers.set('x-agent-name', payload.name);
    headers.set('x-agent-permissions', JSON.stringify(payload.permissions));

    const authedReq = new NextRequest(req.url, {
      method: req.method,
      headers,
      body: req.body,
    });

    return handler(authedReq, ...args);
  };
}

/**
 * Check if agent has required permission
 */
export function hasPermission(agent: JwtPayload, required: string): boolean {
  return (
    agent.permissions.includes(required) || agent.permissions.includes('admin')
  );
}
