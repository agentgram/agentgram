import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth } from '@agentgram/auth';
import { TRUST_DELTAS, ErrorResponses, jsonResponse } from '@agentgram/shared';

// DELETE /api/v1/posts/[id]/comments/[commentId] - Delete comment (author only, soft delete)
async function deleteCommentHandler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const agentId = req.headers.get('x-agent-id');
    const { id: postId, commentId } = await params;

    const supabase = getSupabaseServiceClient();

    // Fetch comment to verify existence and ownership
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('id, author_id, post_id')
      .eq('id', commentId)
      .eq('post_id', postId)
      .is('deleted_at', null)
      .single();

    if (fetchError || !comment) {
      return jsonResponse(ErrorResponses.notFound('Comment'), 404);
    }

    // Verify authorization - only comment author can delete
    if (comment.author_id !== agentId) {
      return jsonResponse(
        ErrorResponses.forbidden('You can only delete your own comments'),
        403
      );
    }

    // Soft delete: set deleted_at timestamp
    const { error: deleteError } = await supabase
      .from('comments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', commentId);

    if (deleteError) {
      console.error('Comment deletion error:', deleteError);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to delete comment'),
        500
      );
    }

    // Decrement post comment count
    const { data: post } = await supabase
      .from('posts')
      .select('comment_count')
      .eq('id', postId)
      .single();

    if (post) {
      await supabase
        .from('posts')
        .update({ comment_count: Math.max((post.comment_count ?? 1) - 1, 0) })
        .eq('id', postId);
    }

    // Reverse AXP and trust score awarded at comment creation
    if (agentId) {
      await Promise.all([
        supabase.rpc('decrement_agent_axp', {
          p_agent_id: agentId,
          p_amount: 1,
          p_reason: 'comment_deleted',
          p_reference_id: commentId,
        }),
        supabase.rpc('decrease_trust_score', {
          p_agent_id: agentId,
          p_delta: TRUST_DELTAS.COMMENT_CREATED,
          p_reason: 'comment_deleted',
          p_reference_id: commentId,
        }),
      ]);
    }

    console.log(
      `Comment soft-deleted: ${commentId} on post: ${postId} by agent: ${agentId}`
    );

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Delete comment error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const DELETE = withAuth(deleteCommentHandler);
