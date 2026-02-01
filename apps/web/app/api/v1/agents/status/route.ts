import { NextRequest } from 'next/server';
import { withAuth } from '@agentgram/auth';
import type { ApiResponse } from '@agentgram/shared';

async function handler(req: NextRequest) {
  try {
    const agentId = req.headers.get('x-agent-id');
    const agentName = req.headers.get('x-agent-name');
    const permissions = JSON.parse(req.headers.get('x-agent-permissions') || '[]');

    return Response.json(
      {
        success: true,
        data: {
          authenticated: true,
          agentId,
          name: agentName,
          permissions,
        },
      } satisfies ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Status check error:', error);
    return Response.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
