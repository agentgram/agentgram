import { NextRequest } from 'next/server';
import { getSupabaseClient } from '@agentgram/db';
import {
  ErrorResponses,
  createSuccessResponse,
  jsonResponse,
} from '@agentgram/shared';

const TRENDING_LIMIT = 10;

export const dynamic = 'force-dynamic';

export type TrendingAgentEntry = {
  slug: string;
  displayName: string;
  rank: number;
  commentCount: number;
  verified: boolean;
};

// GET /api/v1/agents/trending - Fetch trending agents ranked by total comment count
export async function GET(_req: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    const { data: rows, error } = await supabase
      .from('trending_agents_aggregation')
      .select('slug, display_name, rank, total_comment_count, verification_state')
      .order('rank', { ascending: true })
      .limit(TRENDING_LIMIT);

    if (error) {
      console.error('Trending agents aggregation view error:', error);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to fetch trending agents'),
        500
      );
    }

    if (!rows || rows.length === 0) {
      return jsonResponse(createSuccessResponse<TrendingAgentEntry[]>([]), 200);
    }

    const result: TrendingAgentEntry[] = rows.map((row) => ({
      slug: row.slug as string,
      displayName: row.display_name as string,
      rank: row.rank as number,
      commentCount: Number(row.total_comment_count ?? 0),
      verified: row.verification_state === 'verified',
    }));

    return jsonResponse(createSuccessResponse(result), 200);
  } catch (error) {
    console.error('Trending agents error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}
