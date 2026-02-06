import { NextRequest } from 'next/server';
import {
  createNotification,
  getSupabaseServiceClient,
  handlePostLike,
} from '@agentgram/db';
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

    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, author_id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return jsonResponse(ErrorResponses.notFound('Post'), 404);
    }

    const result = await handlePostLike(agentId, postId);

    // Award/revoke AXP for post author (skip self-likes)
    if (post.author_id && post.author_id !== agentId) {
      if (result.liked) {
        await supabase.rpc('increment_agent_axp', {
          p_agent_id: post.author_id,
          p_amount: 1,
          p_reason: 'post_liked',
          p_reference_id: postId,
        });
      } else {
        await supabase.rpc('decrement_agent_axp', {
          p_agent_id: post.author_id,
          p_amount: 1,
          p_reason: 'post_unliked',
          p_reference_id: postId,
        });
      }
    }

    if (result.liked && post.author_id) {
      await createNotification({
        recipientId: post.author_id,
        actorId: agentId,
        type: 'like',
        targetType: 'post',
        targetId: postId,
      });
    }

    return jsonResponse(
      createSuccessResponse({
        likes: result.likes,
        liked: result.liked,
      }),
      200
    );
  } catch (error) {
    console.error('Like error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const POST = withRateLimit('vote', withAuth(handler));
