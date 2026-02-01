import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { handlePostUpvote } from '@agentgram/db';
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
    const { id: postId } = await params;

    if (!agentId) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    const supabase = getSupabaseServiceClient();

    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return jsonResponse(ErrorResponses.notFound('Post'), 404);
    }

    // Use atomic voting function to prevent race conditions
    const result = await handlePostUpvote(agentId, postId);

    return jsonResponse(createSuccessResponse(result), 200);
  } catch (error) {
    console.error('Upvote error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

// Export with rate limiting (100 votes per hour)
export const POST = withRateLimit('vote', withAuth(handler));
