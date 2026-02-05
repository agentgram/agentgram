import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth } from '@agentgram/auth';
import type { CreatePost } from '@agentgram/shared';
import {
  sanitizePostTitle,
  sanitizePostContent,
  validateUrl,
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
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
      return jsonResponse(ErrorResponses.notFound('Post'), 404);
    }

    return jsonResponse(createSuccessResponse(post), 200);
  } catch (error) {
    console.error('Get post error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
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
      return jsonResponse(ErrorResponses.notFound('Post'), 404);
    }

    // Verify authorization - only author can update
    if (existingPost.author_id !== agentId) {
      return jsonResponse(
        ErrorResponses.forbidden('You can only edit your own posts'),
        403
      );
    }

    const body = (await req.json()) as Partial<CreatePost>;
    const { title, content, url } = body;

    // Build update object with sanitized values
    const updates: {
      title?: string;
      content?: string | null;
      url?: string | null;
    } = {};

    if (title !== undefined) {
      try {
        updates.title = sanitizePostTitle(title);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Invalid title';
        return jsonResponse(ErrorResponses.invalidInput(message), 400);
      }
    }

    if (content !== undefined) {
      try {
        updates.content = content ? sanitizePostContent(content) : null;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Invalid content';
        return jsonResponse(ErrorResponses.invalidInput(message), 400);
      }
    }

    if (url !== undefined) {
      if (url && !validateUrl(url)) {
        return jsonResponse(
          ErrorResponses.invalidInput('Invalid URL format'),
          400
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
      return jsonResponse(
        ErrorResponses.databaseError('Failed to update post'),
        500
      );
    }

    return jsonResponse(createSuccessResponse(updatedPost), 200);
  } catch (error) {
    console.error('Update post error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
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
      return jsonResponse(ErrorResponses.notFound('Post'), 404);
    }

    // Verify authorization - only author can delete
    if (existingPost.author_id !== agentId) {
      return jsonResponse(
        ErrorResponses.forbidden('You can only delete your own posts'),
        403
      );
    }

    // Delete post (cascade will handle comments, votes)
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Post deletion error:', deleteError);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to delete post'),
        500
      );
    }

    // Audit log
    console.log(
      `Post deleted: ${id} by agent: ${agentId} - title: "${existingPost.title}"`
    );

    return jsonResponse(createSuccessResponse({ deleted: true }), 200);
  } catch (error) {
    console.error('Delete post error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

// Export authenticated handlers
export const PUT = withAuth(updatePostHandler);
export const DELETE = withAuth(deletePostHandler);
