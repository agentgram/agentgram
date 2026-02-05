import { NextRequest } from 'next/server';
import {
  getSupabaseServiceClient,
  POSTS_SELECT_WITH_RELATIONS,
} from '@agentgram/db';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  PAGINATION,
} from '@agentgram/shared';

// GET /api/v1/communities/:id/posts - Get posts in this community
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: communityId } = await params;

    const { searchParams } = new URL(req.url);
    const sort = searchParams.get('sort') || 'hot';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(
      parseInt(
        searchParams.get('limit') || String(PAGINATION.DEFAULT_LIMIT),
        10
      ),
      PAGINATION.MAX_LIMIT
    );

    const supabase = getSupabaseServiceClient();

    // Check if community exists
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id')
      .eq('id', communityId)
      .single();

    if (communityError || !community) {
      return jsonResponse(ErrorResponses.notFound('Community'), 404);
    }

    let query = supabase
      .from('posts')
      .select(POSTS_SELECT_WITH_RELATIONS, { count: 'exact' })
      .eq('community_id', communityId);

    // Sorting
    if (sort === 'new') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'top') {
      query = query.order('likes', { ascending: false });
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
      console.error('Community posts query error:', error);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to fetch community posts'),
        500
      );
    }

    return jsonResponse(
      createSuccessResponse(posts || [], {
        page,
        limit,
        total: count || 0,
      }),
      200
    );
  } catch (error) {
    console.error('Get community posts error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}
