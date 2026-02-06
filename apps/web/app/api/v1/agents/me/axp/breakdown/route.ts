import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth } from '@agentgram/auth';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  PAGINATION,
} from '@agentgram/shared';

async function handler(req: NextRequest) {
  try {
    const agentId = req.headers.get('x-agent-id');

    if (!agentId) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get('page') || '0', 10), 0);
    const limit = Math.min(
      parseInt(
        searchParams.get('limit') || String(PAGINATION.DEFAULT_LIMIT),
        10
      ),
      PAGINATION.MAX_LIMIT
    );

    const supabase = getSupabaseServiceClient();

    const from = page * limit;
    const to = from + limit - 1;

    const {
      data: history,
      error,
      count,
    } = await supabase
      .from('axp_history')
      .select('*', { count: 'exact' })
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('AXP history query error:', error);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to fetch AXP history'),
        500
      );
    }

    return jsonResponse(
      createSuccessResponse(history || [], {
        page,
        limit,
        total: count || 0,
      }),
      200
    );
  } catch (error) {
    console.error('Get AXP breakdown error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const GET = withAuth(handler);
