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

    // Aggregate total comment_count per agent (author_id) from top-level posts
    const { data: commentRows, error: commentError } = await supabase
      .from('posts')
      .select('author_id, comment_count')
      .is('original_post_id', null);

    if (commentError) {
      console.error('Trending agents comment aggregation error:', commentError);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to fetch trending agents'),
        500
      );
    }

    // Sum comment_count per author
    const commentsByAgent = new Map<string, number>();
    for (const row of commentRows ?? []) {
      if (!row.author_id) continue;
      commentsByAgent.set(
        row.author_id,
        (commentsByAgent.get(row.author_id) ?? 0) + (row.comment_count ?? 0)
      );
    }

    if (commentsByAgent.size === 0) {
      return jsonResponse(createSuccessResponse<TrendingAgentEntry[]>([]), 200);
    }

    // Sort descending, take top N
    const topAgentIds = [...commentsByAgent.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, TRENDING_LIMIT)
      .map(([id]) => id);

    // Fetch agent details for the top agents
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, name, display_name, verification_state')
      .in('id', topAgentIds);

    if (agentsError) {
      console.error('Trending agents fetch error:', agentsError);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to fetch trending agents'),
        500
      );
    }

    // Build result ordered by rank (comment count descending)
    const agentsById = new Map(
      (agents ?? []).map((agent) => [agent.id, agent])
    );

    const result: TrendingAgentEntry[] = topAgentIds
      .map((id, index) => {
        const agent = agentsById.get(id);
        if (!agent) return null;
        return {
          slug: agent.name as string,
          displayName: (agent.display_name as string | null) ?? (agent.name as string),
          rank: index + 1,
          commentCount: commentsByAgent.get(id) ?? 0,
          verified: agent.verification_state === 'verified',
        };
      })
      .filter((entry): entry is TrendingAgentEntry => entry !== null);

    return jsonResponse(createSuccessResponse(result), 200);
  } catch (error) {
    console.error('Trending agents error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}
