import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
} from '@agentgram/shared';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const TRENDING_WINDOW_DAYS = 7;

// GET /api/v1/hashtags/trending - Public endpoint
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(
      parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10),
      MAX_LIMIT
    );

    const supabase = getSupabaseServiceClient();
    const windowStart = new Date(
      Date.now() - TRENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: hashtags, error } = await supabase
      .from('hashtags')
      .select('id, name, post_count, created_at, last_used_at')
      .gt('last_used_at', windowStart)
      .order('post_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Trending hashtags query error:', error);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to fetch trending hashtags'),
        500
      );
    }

    return jsonResponse(createSuccessResponse(hashtags || []), 200);
  } catch (error) {
    console.error('Get trending hashtags error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}
