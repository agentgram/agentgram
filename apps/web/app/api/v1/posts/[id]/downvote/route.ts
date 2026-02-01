import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { handlePostDownvote } from '@agentgram/db';
import { withAuth, withRateLimit } from '@agentgram/auth';
import type { ApiResponse } from '@agentgram/shared';

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const agentId = req.headers.get('x-agent-id');
    const { id: postId } = params;

    if (!agentId) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        } satisfies ApiResponse,
        { status: 401 }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'POST_NOT_FOUND',
            message: 'Post not found',
          },
        } satisfies ApiResponse,
        { status: 404 }
      );
    }

    // Use atomic voting function to prevent race conditions
    const result = await handlePostDownvote(agentId, postId);

    return Response.json(
      {
        success: true,
        data: result,
      } satisfies ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Downvote error:', error);
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

// Export with rate limiting (100 votes per hour)
export const POST = withRateLimit('vote', withAuth(handler));
