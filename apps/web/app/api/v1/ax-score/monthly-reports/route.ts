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
import type { GenerateMonthlyReportRequest } from '@agentgram/shared';
import { getDeveloperPlan } from '@/lib/ax-score/usage';
import {
  listMonthlyReports,
  generateMonthlyReport,
} from '@/lib/ax-score/monthly-reports';

/**
 * GET /api/v1/ax-score/monthly-reports
 *
 * List monthly reports for the authenticated developer.
 * Query params: siteId, page, limit
 * Pro plan required.
 */
const getHandler = withDeveloperAuth(async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get('siteId') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(
      parseInt(
        searchParams.get('limit') || String(PAGINATION.DEFAULT_LIMIT),
        10
      ),
      PAGINATION.MAX_LIMIT
    );

    const result = await listMonthlyReports(developerId, { siteId, page, limit });

    return jsonResponse(
      createSuccessResponse(
        result.reports.map((r) => ({
          id: r.id,
          developerId: r.developer_id,
          siteId: r.site_id,
          month: r.month,
          title: r.title,
          summary: r.summary,
          scoreTrend: r.score_trend,
          categoryTrends: r.category_trends,
          topRegressions: r.top_regressions,
          topImprovements: r.top_improvements,
          actionItems: r.action_items,
          alertCount: r.alert_count,
          modelName: r.model_name,
          status: r.status,
          createdAt: r.created_at,
        })),
        { page, limit, total: result.total }
      ),
      200
    );
  } catch (error) {
    console.error('AX monthly reports list error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
});

/**
 * POST /api/v1/ax-score/monthly-reports
 *
 * Generate a new monthly report for a site.
 * Pro plan required.
 */
const postHandler = withDeveloperAuth(async function POST(req: NextRequest) {
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

    const body = (await req.json()) as GenerateMonthlyReportRequest;

    if (!body.siteId || !body.month) {
      return jsonResponse(
        ErrorResponses.invalidInput('siteId and month are required'),
        400
      );
    }

    // Validate month format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(body.month)) {
      return jsonResponse(
        ErrorResponses.invalidInput('month must be in YYYY-MM format'),
        400
      );
    }

    const report = await generateMonthlyReport(developerId, body.siteId, body.month);

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
      201
    );
  } catch (error) {
    console.error('AX monthly report generate error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
});

export const GET = withRateLimit(
  {
    maxRequests: AX_RATE_LIMITS.MONTHLY_REPORTS.limit,
    windowMs: AX_RATE_LIMITS.MONTHLY_REPORTS.windowMs,
  },
  getHandler
);

export const POST = withRateLimit(
  {
    maxRequests: AX_RATE_LIMITS.MONTHLY_REPORTS.limit,
    windowMs: AX_RATE_LIMITS.MONTHLY_REPORTS.windowMs,
  },
  postHandler
);
