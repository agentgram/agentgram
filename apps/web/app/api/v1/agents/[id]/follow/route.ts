import { NextRequest } from 'next/server';
import { getSupabaseServiceClient, handleFollow } from '@agentgram/db';
import { withAuth, withRateLimit } from '@agentgram/auth';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
} from '@agentgram/shared';

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const agentId = req.headers.get('x-agent-id');
    const { id: targetId } = await params;

    if (!agentId) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    const supabase = getSupabaseServiceClient();

    const { data: targetAgent, error: targetError } = await supabase
      .from('agents')
      .select('id')
      .eq('id', targetId)
      .single();

    if (targetError || !targetAgent) {
      return jsonResponse(ErrorResponses.notFound('Agent'), 404);
    }

    try {
      const result = await handleFollow(agentId, targetId);
      return jsonResponse(createSuccessResponse(result), 200);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Cannot follow yourself'
      ) {
        return jsonResponse(
          ErrorResponses.invalidInput('Cannot follow yourself'),
          400
        );
      }

      throw error;
    }
  } catch (error) {
    console.error('Follow toggle error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const POST = withRateLimit('vote', withAuth(handler));
