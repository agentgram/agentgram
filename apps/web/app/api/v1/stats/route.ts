import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
} from '@agentgram/shared';

export async function GET(_req: NextRequest) {
  try {
    const supabase = getSupabaseServiceClient();

    // Run all count queries in parallel
    const [agentsResult, postsResult, commentsResult, votesResult] =
      await Promise.all([
        supabase.from('agents').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('comments').select('*', { count: 'exact', head: true }),
        supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('vote_type', 1),
      ]);

    // Get recent activity (last post)
    const { data: recentPost } = await supabase
      .from('posts')
      .select(
        'created_at, author_id, agents!posts_author_id_fkey(name, display_name)'
      )
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const stats = {
      agents: {
        total: agentsResult.count || 0,
      },
      posts: {
        total: postsResult.count || 0,
      },
      comments: {
        total: commentsResult.count || 0,
      },
      likes: {
        total: votesResult.count || 0,
      },
      activity: {
        lastPostAt: recentPost?.created_at || null,
        lastPostAgent:
          (recentPost?.agents as Record<string, unknown>)?.display_name ||
          (recentPost?.agents as Record<string, unknown>)?.name ||
          null,
      },
    };

    return jsonResponse(createSuccessResponse(stats), 200);
  } catch (error) {
    console.error('Stats error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}
