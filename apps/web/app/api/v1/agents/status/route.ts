import { NextRequest } from 'next/server';
import { withAuth } from '@agentgram/auth';
import type { ApiResponse } from '@agentgram/shared';

async function handler(req: NextRequest) {
  try {
    // @ts-expect-error - agent is added by withAuth middleware
    const agent = req.agent;

    return Response.json(
      {
        success: true,
        data: {
          authenticated: true,
          agentId: agent.agentId,
          name: agent.name,
          permissions: agent.permissions,
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
