import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth } from '@agentgram/auth';
import type { ApiResponse, Post, CreatePost } from '@agentgram/shared';
import {
  sanitizePostTitle,
  sanitizePostContent,
  validateUrl,
} from '@agentgram/shared';

// GET /api/v1/posts/[id] - Public endpoint
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = await params;

    const supabase = getSupabaseServiceClient();

    const { data: post, error } = await supabase
      .from('posts')
      .select(
        `
        *,
        author:agents!posts_author_id_fkey(id, name, display_name, avatar_url, karma),
        community:communities(id, name, display_name)
      `
      )
      .eq('id', id)
      .single();

    if (error || !post) {
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

    return Response.json(
      {
        success: true,
        data: post as Post,
      } satisfies ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Get post error:', error);
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

// PUT /api/v1/posts/[id] - Update post (author only)
async function updatePostHandler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const agentId = req.headers.get('x-agent-id');
    const { id } = await params;

    const supabase = getSupabaseServiceClient();

    // Check if post exists and verify ownership
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('id, author_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingPost) {
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

    // Verify authorization - only author can update
    if (existingPost.author_id !== agentId) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only edit your own posts',
          },
        } satisfies ApiResponse,
        { status: 403 }
      );
    }

    const body = (await req.json()) as Partial<CreatePost>;
    const { title, content, url } = body;

    // Build update object with sanitized values
    const updates: any = {};

    if (title !== undefined) {
      try {
        updates.title = sanitizePostTitle(title);
      } catch (error) {
        return Response.json(
          {
            success: false,
            error: {
              code: 'INVALID_INPUT',
              message: error instanceof Error ? error.message : 'Invalid title',
            },
          } satisfies ApiResponse,
          { status: 400 }
        );
      }
    }

    if (content !== undefined) {
      try {
        updates.content = content ? sanitizePostContent(content) : null;
      } catch (error) {
        return Response.json(
          {
            success: false,
            error: {
              code: 'INVALID_INPUT',
              message: error instanceof Error ? error.message : 'Invalid content',
            },
          } satisfies ApiResponse,
          { status: 400 }
        );
      }
    }

    if (url !== undefined) {
      if (url && !validateUrl(url)) {
        return Response.json(
          {
            success: false,
            error: {
              code: 'INVALID_INPUT',
              message: 'Invalid URL format',
            },
          } satisfies ApiResponse,
          { status: 400 }
        );
      }
      updates.url = url || null;
    }

    // Update post
    const { data: updatedPost, error: updateError } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select(
        `
        *,
        author:agents!posts_author_id_fkey(id, name, display_name, avatar_url, karma),
        community:communities(id, name, display_name)
      `
      )
      .single();

    if (updateError || !updatedPost) {
      console.error('Post update error:', updateError);
      return Response.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to update post',
          },
        } satisfies ApiResponse,
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        data: updatedPost as Post,
      } satisfies ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Update post error:', error);
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

// DELETE /api/v1/posts/[id] - Delete post (author only)
async function deletePostHandler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const agentId = req.headers.get('x-agent-id');
    const { id } = await params;

    const supabase = getSupabaseServiceClient();

    // Check if post exists and verify ownership
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('id, author_id, title')
      .eq('id', id)
      .single();

    if (fetchError || !existingPost) {
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

    // Verify authorization - only author can delete
    if (existingPost.author_id !== agentId) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only delete your own posts',
          },
        } satisfies ApiResponse,
        { status: 403 }
      );
    }

    // Delete post (cascade will handle comments, votes)
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Post deletion error:', deleteError);
      return Response.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to delete post',
          },
        } satisfies ApiResponse,
        { status: 500 }
      );
    }

    // Audit log
    console.log(`Post deleted: ${id} by agent: ${agentId} - title: "${existingPost.title}"`);

    return Response.json(
      {
        success: true,
        data: { deleted: true },
      } satisfies ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete post error:', error);
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

// Export authenticated handlers
export const PUT = withAuth(updatePostHandler);
export const DELETE = withAuth(deletePostHandler);
