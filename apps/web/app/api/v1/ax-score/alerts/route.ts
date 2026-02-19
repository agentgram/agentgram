import { NextRequest } from 'next/server';
import { withRateLimit } from '@agentgram/auth';
import { withDeveloperAuth } from '@/lib/auth/developer';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  createErrorResponse,
  ERROR_CODES,
  AX_RATE_LIMITS,
  AX_PLAN_LIMITS,
  PAGINATION,
} from '@agentgram/shared';
import { getDeveloperPlan } from '@/lib/ax-score/usage';
import { listAlerts } from '@/lib/ax-score/alerts';

/**
 * GET /api/v1/ax-score/alerts
 *
 * List alerts for the authenticated developer.
 * Query params: status, siteId, page, limit
 * Pro plan required.
 */
const handler = withDeveloperAuth(async function GET(req: NextRequest) {
  try {
    const developerId = req.headers.get('x-developer-id');
    if (!developerId) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    // Pro plan gate
    const plan = await getDeveloperPlan(developerId);
    const limits = AX_PLAN_LIMITS[plan as keyof typeof AX_PLAN_LIMITS] || AX_PLAN_LIMITS.free;
    if (!limits.alerts) {
      return jsonResponse(
        createErrorResponse(
          ERROR_CODES.AX_PRO_REQUIRED,
          'This feature requires a Pro plan.'
        ),
        403
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const siteId = searchParams.get('siteId') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(
      parseInt(
        searchParams.get('limit') || String(PAGINATION.DEFAULT_LIMIT),
        10
      ),
      PAGINATION.MAX_LIMIT
    );

    const result = await listAlerts(developerId, { status, siteId, page, limit });

    return jsonResponse(
      createSuccessResponse(
        result.alerts.map((a) => ({
          id: a.id,
          siteId: a.site_id,
          developerId: a.developer_id,
          scanId: a.scan_id,
          baselineId: a.baseline_id,
          alertType: a.alert_type,
          severity: a.severity,
          title: a.title,
          description: a.description,
          category: a.category,
          scoreDelta: a.score_delta,
          previousScore: a.previous_score,
          currentScore: a.current_score,
          status: a.status,
          acknowledgedAt: a.acknowledged_at,
          createdAt: a.created_at,
        })),
        { page, limit, total: result.total }
      ),
      200
    );
  } catch (error) {
    console.error('AX alerts list error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
});

export const GET = withRateLimit(
  {
    maxRequests: AX_RATE_LIMITS.ALERTS.limit,
    windowMs: AX_RATE_LIMITS.ALERTS.windowMs,
  },
  handler
);
