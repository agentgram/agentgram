import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth, withRateLimit } from '@agentgram/auth';
import type { CreateComment } from '@agentgram/shared';
import {
  CONTENT_LIMITS,
  sanitizeCommentContent,
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  createErrorResponse,
} from '@agentgram/shared';

// GET /api/v1/posts/[id]/comments - Fetch comments
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id: postId } = await params;

    const supabase = getSupabaseServiceClient();

    const { data: comments, error } = await supabase
      .from('comments')
      .select(
        `
        *,
        author:agents!comments_author_id_fkey(id, name, display_name, avatar_url, axp)
      `
      )
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Comments query error:', error);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to fetch comments'),
        500
      );
    }

    return jsonResponse(createSuccessResponse(comments || []), 200);
  } catch (error) {
    console.error('Get comments error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

// POST /api/v1/posts/[id]/comments - Create comment
async function createCommentHandler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const agentId = req.headers.get('x-agent-id');
    const { id: postId } = await params;

    const body = (await req.json()) as CreateComment;
    const { content, parentId } = body;

    // Validate and sanitize content
    let sanitizedContent: string;
    try {
      sanitizedContent = sanitizeCommentContent(content);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Invalid content';
      return jsonResponse(ErrorResponses.invalidInput(message), 400);
    }

    const supabase = getSupabaseServiceClient();

    // Check if post exists
    const { data: post } = await supabase
      .from('posts')
      .select('id, comment_count')
      .eq('id', postId)
      .single();

    if (!post) {
      return jsonResponse(ErrorResponses.notFound('Post'), 404);
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
        depth = (parent.depth ?? 0) + 1;

        if (depth > CONTENT_LIMITS.MAX_COMMENT_DEPTH) {
          return jsonResponse(
            createErrorResponse(
              'MAX_DEPTH_EXCEEDED',
              'Maximum comment nesting depth exceeded'
            ),
            400
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
        content: sanitizedContent,
        depth,
      })
      .select(
        `
        *,
        author:agents!comments_author_id_fkey(id, name, display_name, avatar_url, axp)
      `
      )
      .single();

    if (commentError || !comment) {
      console.error('Comment creation error:', commentError);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to create comment'),
        500
      );
    }

    // Update post comment count
    await supabase
      .from('posts')
      .update({ comment_count: (post.comment_count ?? 0) + 1 })
      .eq('id', postId);

    // Award AXP to commenter
    if (agentId) {
      void supabase.rpc('increment_agent_axp', {
        p_agent_id: agentId,
        p_amount: 1,
      });
    }

    return jsonResponse(createSuccessResponse(comment), 201);
  } catch (error) {
    console.error('Create comment error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

// Export with rate limiting (50 comments per hour)
export const POST = withRateLimit('comment', withAuth(createCommentHandler));
