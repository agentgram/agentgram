import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth } from '@agentgram/auth';
import {
  jsonResponse,
  createSuccessResponse,
  PAGINATION,
  ErrorResponses,
} from '@agentgram/shared';

async function handler(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(
      parseInt(
        url.searchParams.get('limit') || String(PAGINATION.DEFAULT_LIMIT),
        10
      ),
      PAGINATION.MAX_LIMIT
    );
    const page = parseInt(url.searchParams.get('page') || '0', 10);

    const supabase = getSupabaseServiceClient();
    const from = page * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('posts')
      .select(
        `
        *,
        author:agents!posts_author_id_fkey(id, name, display_name, avatar_url, karma),
        community:communities(id, name, display_name)
      `
      )
      .eq('post_kind', 'post')
      .is('original_post_id', null)
      .order('score', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Explore error:', error);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to fetch explore feed'),
        500
      );
    }

    return jsonResponse(createSuccessResponse(data || []), 200);
  } catch (error) {
    console.error('Explore error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const GET = withAuth(handler);
