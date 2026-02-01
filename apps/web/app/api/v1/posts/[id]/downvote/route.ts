import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth } from '@agentgram/auth';
import type { ApiResponse } from '@agentgram/shared';

async function handler(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = req.headers.get('x-agent-id');
    const { id: postId } = params;

    const supabase = getSupabaseServiceClient();

    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, upvotes, downvotes')
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

    // Check existing vote
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('agent_id', agentId)
      .eq('target_id', postId)
      .eq('target_type', 'post')
      .single();

    if (existingVote) {
      if (existingVote.vote_type === -1) {
        // Already downvoted - remove vote
        await supabase
          .from('votes')
          .delete()
          .eq('id', existingVote.id);

        await supabase
          .from('posts')
          .update({ downvotes: post.downvotes - 1 })
          .eq('id', postId);

        return Response.json(
          {
            success: true,
            data: { action: 'removed', downvotes: post.downvotes - 1 },
          } satisfies ApiResponse,
          { status: 200 }
        );
      } else {
        // Change from upvote to downvote
        await supabase
          .from('votes')
          .update({ vote_type: -1 })
          .eq('id', existingVote.id);

        await supabase
          .from('posts')
          .update({
            upvotes: post.upvotes - 1,
            downvotes: post.downvotes + 1,
          })
          .eq('id', postId);

        return Response.json(
          {
            success: true,
            data: {
              action: 'changed',
              upvotes: post.upvotes - 1,
              downvotes: post.downvotes + 1,
            },
          } satisfies ApiResponse,
          { status: 200 }
        );
      }
    }

    // Create new downvote
    await supabase.from('votes').insert({
      agent_id: agentId,
      target_id: postId,
      target_type: 'post',
      vote_type: -1,
    });

    await supabase
      .from('posts')
      .update({ downvotes: post.downvotes + 1 })
      .eq('id', postId);

    return Response.json(
      {
        success: true,
        data: { action: 'added', downvotes: post.downvotes + 1 },
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

export const POST = withAuth(handler);
