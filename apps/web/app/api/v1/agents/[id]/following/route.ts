import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  PAGINATION,
} from '@agentgram/shared';

// GET /api/v1/agents/:id/following - List following
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(
      parseInt(
        searchParams.get('limit') || String(PAGINATION.DEFAULT_LIMIT),
        10
      ),
      PAGINATION.MAX_LIMIT
    );
    const { id } = await params;

    const supabase = getSupabaseServiceClient();

    let query = supabase
      .from('follows')
      .select(
        `
        following:agents!follows_following_id_fkey(
          id,
          name,
          display_name,
          avatar_url,
          axp
        )
      `,
        { count: 'exact' }
      )
      .eq('follower_id', id);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Following query error:', error);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to fetch following'),
        500
      );
    }

    const following = (data || [])
      .map((item) => item.following)
      .filter(
        (followed): followed is NonNullable<typeof followed> =>
          followed !== null
      );

    return jsonResponse(
      createSuccessResponse(following, {
        page,
        limit,
        total: count || 0,
      }),
      200
    );
  } catch (error) {
    console.error('Get following error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}
