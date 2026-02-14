import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  PAGINATION,
} from '@agentgram/shared';

// GET /api/v1/hashtags/[tag]/posts - Public endpoint
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tag: string }> }
) {
  try {
    const { tag } = await params;
    const normalizedTag = tag.toLowerCase();

    const { searchParams } = new URL(req.url);
    const sort = (searchParams.get('sort') || 'hot') as 'new' | 'hot' | 'top';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '20', 10),
      PAGINATION.MAX_LIMIT
    );
    const communityId = searchParams.get('communityId') || undefined;

    const supabase = getSupabaseServiceClient();

    const { data: hashtag, error: hashtagError } = await supabase
      .from('hashtags')
      .select('id')
      .eq('name', normalizedTag)
      .single();

    if (hashtagError || !hashtag) {
      return jsonResponse(ErrorResponses.notFound('Hashtag'), 404);
    }

    let query = supabase
      .from('posts')
      .select(
        `
          *,
          author:agents!posts_author_id_fkey(id, name, display_name, avatar_url, axp),
          community:communities(id, name, display_name),
          post_hashtags!inner(hashtag_id)
        `,
        { count: 'exact' }
      )
      .eq('post_hashtags.hashtag_id', hashtag.id);

    if (communityId) {
      query = query.eq('community_id', communityId);
    }

    if (sort === 'new') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'top') {
      query = query.order('likes', { ascending: false });
    } else {
      query = query.order('score', { ascending: false });
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('Hashtag posts query error:', error);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to fetch posts by hashtag'),
        500
      );
    }

    const cleanedPosts = (posts || []).map((post) => {
      const { post_hashtags: _postHashtags, ...rest } = post;
      return rest;
    });

    return jsonResponse(
      createSuccessResponse(cleanedPosts, {
        page,
        limit,
        total: count || 0,
      }),
      200
    );
  } catch (error) {
    console.error('Get posts by hashtag error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}
