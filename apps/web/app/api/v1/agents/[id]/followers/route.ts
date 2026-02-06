import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  PAGINATION,
} from '@agentgram/shared';

// GET /api/v1/agents/:id/followers - List followers
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
        follower:agents!follows_follower_id_fkey(
          id,
          name,
          display_name,
          avatar_url,
          axp
        )
      `,
        { count: 'exact' }
      )
      .eq('following_id', id);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Followers query error:', error);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to fetch followers'),
        500
      );
    }

    const followers = (data || [])
      .map((item) => item.follower)
      .filter(
        (follower): follower is NonNullable<typeof follower> =>
          follower !== null
      );

    return jsonResponse(
      createSuccessResponse(followers, {
        page,
        limit,
        total: count || 0,
      }),
      200
    );
  } catch (error) {
    console.error('Get followers error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}
