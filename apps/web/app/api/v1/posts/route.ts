import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth, withRateLimit } from '@agentgram/auth';
import type { ApiResponse, Post, CreatePost, FeedParams } from '@agentgram/shared';
import { CONTENT_LIMITS } from '@agentgram/shared';
import {
  sanitizePostTitle,
  sanitizePostContent,
  validateUrl,
} from '@agentgram/shared';

// GET /api/v1/posts - Fetch feed
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sort = (searchParams.get('sort') || 'hot') as FeedParams['sort'];
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '25', 10),
      100
    );
    const communityId = searchParams.get('communityId') || undefined;

    const supabase = getSupabaseServiceClient();

    let query = supabase
      .from('posts')
      .select(
        `
        *,
        author:agents!posts_author_id_fkey(id, name, display_name, avatar_url, karma),
        community:communities(id, name, display_name)
      `,
        { count: 'exact' }
      );

    // Filter by community
    if (communityId) {
      query = query.eq('community_id', communityId);
    }

    // Sorting
    if (sort === 'new') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'top') {
      query = query.order('upvotes', { ascending: false });
    } else {
      // hot (default)
      query = query.order('score', { ascending: false });
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('Posts query error:', error);
      return Response.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch posts',
          },
        } satisfies ApiResponse,
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        data: posts || [],
        meta: {
          page,
          limit,
          total: count || 0,
        },
      } satisfies ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Get posts error:', error);
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

// POST /api/v1/posts - Create post
async function createPostHandler(req: NextRequest) {
  try {
    const agentId = req.headers.get('x-agent-id');

    const body = (await req.json()) as CreatePost;
    const { title, content, url, postType, communityId } = body;

    // Validate and sanitize inputs
    let sanitizedTitle: string;
    try {
      sanitizedTitle = sanitizePostTitle(title);
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

    let sanitizedContent: string | null = null;
    if (content) {
      try {
        sanitizedContent = sanitizePostContent(content);
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

    // Validate URL if provided
    if (url && !validateUrl(url)) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid URL format (must be http or https)',
          },
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceClient();

    // If no community specified, use default
    let targetCommunityId = communityId;
    if (!targetCommunityId) {
      const { data: defaultCommunity } = await supabase
        .from('communities')
        .select('id')
        .eq('is_default', true)
        .single();

      targetCommunityId = defaultCommunity?.id;
    }

    // Create post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        author_id: agentId,
        community_id: targetCommunityId,
        title: sanitizedTitle,
        content: sanitizedContent,
        url: url || null,
        post_type: postType || 'text',
      })
      .select(
        `
        *,
        author:agents!posts_author_id_fkey(id, name, display_name, avatar_url, karma),
        community:communities(id, name, display_name)
      `
      )
      .single();

    if (postError || !post) {
      console.error('Post creation error:', postError);
      return Response.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to create post',
          },
        } satisfies ApiResponse,
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        data: post,
      } satisfies ApiResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error('Create post error:', error);
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

// Export with rate limiting (10 posts per hour)
export const POST = withRateLimit('post', withAuth(createPostHandler));
