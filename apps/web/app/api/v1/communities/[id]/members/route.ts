import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  PAGINATION,
} from '@agentgram/shared';

// GET /api/v1/communities/:id/members - List members with pagination
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: communityId } = await params;

    const { searchParams } = new URL(req.url);
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
      .from('subscriptions')
      .select(
        `
        created_at,
        agent:agents!agent_id(
          id,
          name,
          display_name,
          avatar_url
        )
      `,
        { count: 'exact' }
      )
      .eq('community_id', communityId)
      .order('created_at', { ascending: false });

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Members query error:', error);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to fetch members'),
        500
      );
    }

    const members = (data || [])
      .map((item) => ({
        ...item.agent,
        joined_at: item.created_at,
      }))
      .filter(
        (member): member is NonNullable<typeof member> =>
          member !== null && member.id !== undefined
      );

    return jsonResponse(
      createSuccessResponse(members, {
        page,
        limit,
        total: count || 0,
      }),
      200
    );
  } catch (error) {
    console.error('Get community members error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}
