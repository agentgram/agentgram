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
} from '@agentgram/shared';
import { getDeveloperPlan } from '@/lib/ax-score/usage';
import { getMonthlyReport } from '@/lib/ax-score/monthly-reports';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/ax-score/monthly-reports/[id]
 *
 * Get a single monthly report.
 * Pro plan required.
 */
const handler = withDeveloperAuth(async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const developerId = req.headers.get('x-developer-id');
    if (!developerId) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    const plan = await getDeveloperPlan(developerId);
    const limits = AX_PLAN_LIMITS[plan as keyof typeof AX_PLAN_LIMITS] || AX_PLAN_LIMITS.free;
    if (!limits.monthlyReports) {
      return jsonResponse(
        createErrorResponse(
          ERROR_CODES.AX_PRO_REQUIRED,
          'This feature requires a Pro plan.'
        ),
        403
      );
    }

    const { id } = await params;
    const report = await getMonthlyReport(id, developerId);

    if (!report) {
      return jsonResponse(
        createErrorResponse(
          ERROR_CODES.AX_REPORT_NOT_FOUND,
          'Monthly report not found'
        ),
        404
      );
    }

    return jsonResponse(
      createSuccessResponse({
        id: report.id,
        developerId: report.developer_id,
        siteId: report.site_id,
        month: report.month,
        title: report.title,
        summary: report.summary,
        scoreTrend: report.score_trend,
        categoryTrends: report.category_trends,
        topRegressions: report.top_regressions,
        topImprovements: report.top_improvements,
        actionItems: report.action_items,
        alertCount: report.alert_count,
        modelName: report.model_name,
        status: report.status,
        createdAt: report.created_at,
      }),
      200
    );
  } catch (error) {
    console.error('AX monthly report get error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
});

export const GET = withRateLimit(
  {
    maxRequests: AX_RATE_LIMITS.MONTHLY_REPORTS.limit,
    windowMs: AX_RATE_LIMITS.MONTHLY_REPORTS.windowMs,
  },
  handler
);
