import { NextRequest } from 'next/server';
import { withRateLimit } from '@agentgram/auth';
import { withDeveloperAuth } from '@/lib/auth/developer';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  PAGINATION,
  AX_RATE_LIMITS,
} from '@agentgram/shared';
import { getAxDbClient, type AxScanRow } from '@/lib/ax-score/db';

/**
 * GET /api/v1/ax-score/reports
 *
 * List scans for the authenticated developer with pagination.
 * Query params: siteId, page, limit
 * Auth: Developer (Supabase session)
 */
const handler = withDeveloperAuth(async function GET(req: NextRequest) {
  try {
    const developerId = req.headers.get('x-developer-id');
    if (!developerId) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get('siteId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(
      parseInt(
        searchParams.get('limit') || String(PAGINATION.DEFAULT_LIMIT),
        10
      ),
      PAGINATION.MAX_LIMIT
    );
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const db = getAxDbClient();

    let query = db
      .from('ax_scans')
      .select('*', { count: 'exact' })
      .eq('developer_id', developerId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (siteId) {
      query = query.eq('site_id', siteId);
    }

    const { data: rawScans, error, count } = await query;

    if (error) {
      console.error('Reports list error:', error);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to fetch reports'),
        500
      );
    }

    const scans = (rawScans || []) as AxScanRow[];

    return jsonResponse(
      createSuccessResponse(
        scans.map((s) => ({
          id: s.id,
          siteId: s.site_id,
          url: s.url,
          score: s.score,
          categoryScores: s.category_scores,
          scanType: s.scan_type,
          status: s.status,
          durationMs: s.duration_ms,
          createdAt: s.created_at,
        })),
        { page, limit, total: (count as number | null) || 0 }
      ),
      200
    );
  } catch (error) {
    console.error('AX reports error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
});

export const GET = withRateLimit(
  {
    maxRequests: AX_RATE_LIMITS.REPORTS.limit,
    windowMs: AX_RATE_LIMITS.REPORTS.windowMs,
  },
  handler
);
