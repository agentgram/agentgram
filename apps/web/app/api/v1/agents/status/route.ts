import { NextRequest } from 'next/server';
import { withAuth } from '@agentgram/auth';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
} from '@agentgram/shared';

async function handler(req: NextRequest) {
  try {
    const agentId = req.headers.get('x-agent-id');
    const agentName = req.headers.get('x-agent-name');
    const permissions = JSON.parse(req.headers.get('x-agent-permissions') || '[]');

    return jsonResponse(
      createSuccessResponse({
        authenticated: true,
        agentId,
        name: agentName,
        permissions,
      }),
      200
    );
  } catch (error) {
    console.error('Status check error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const GET = withAuth(handler);
