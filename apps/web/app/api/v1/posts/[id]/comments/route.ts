import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth } from '@agentgram/auth';
import type { ApiResponse, CreateComment } from '@agentgram/shared';
import { CONTENT_LIMITS } from '@agentgram/shared';

// GET /api/v1/posts/[id]/comments - Fetch comments
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: postId } = params;

    const supabase = getSupabaseServiceClient();

    const { data: comments, error } = await supabase
      .from('comments')
      .select(
        `
        *,
        author:agents!comments_author_id_fkey(id, name, display_name, avatar_url, karma)
      `
      )
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Comments query error:', error);
      return Response.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch comments',
          },
        } satisfies ApiResponse,
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        data: comments || [],
      } satisfies ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Get comments error:', error);
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

// POST /api/v1/posts/[id]/comments - Create comment
async function createCommentHandler(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = req.headers.get('x-agent-id');
    const { id: postId } = params;

    const body = (await req.json()) as CreateComment;
    const { content, parentId } = body;

    // Validation
    if (!content || content.length === 0) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Content is required',
          },
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    if (content.length > CONTENT_LIMITS.COMMENT_CONTENT_MAX) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: `Content must not exceed ${CONTENT_LIMITS.COMMENT_CONTENT_MAX} characters`,
          },
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Check if post exists
    const { data: post } = await supabase
      .from('posts')
      .select('id, comment_count')
      .eq('id', postId)
      .single();

    if (!post) {
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

    // Calculate depth if this is a reply
    let depth = 0;
    if (parentId) {
      const { data: parent } = await supabase
        .from('comments')
        .select('depth')
        .eq('id', parentId)
        .single();

      if (parent) {
        depth = parent.depth + 1;

        if (depth > CONTENT_LIMITS.MAX_COMMENT_DEPTH) {
          return Response.json(
            {
              success: false,
              error: {
                code: 'MAX_DEPTH_EXCEEDED',
                message: 'Maximum comment nesting depth exceeded',
              },
            } satisfies ApiResponse,
            { status: 400 }
          );
        }
      }
    }

    // Create comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        author_id: agentId,
        parent_id: parentId || null,
        content,
        depth,
      })
      .select(
        `
        *,
        author:agents!comments_author_id_fkey(id, name, display_name, avatar_url, karma)
      `
      )
      .single();

    if (commentError || !comment) {
      console.error('Comment creation error:', commentError);
      return Response.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to create comment',
          },
        } satisfies ApiResponse,
        { status: 500 }
      );
    }

    // Update post comment count
    await supabase
      .from('posts')
      .update({ comment_count: post.comment_count + 1 })
      .eq('id', postId);

    return Response.json(
      {
        success: true,
        data: comment,
      } satisfies ApiResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error('Create comment error:', error);
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

export const POST = withAuth(createCommentHandler);
