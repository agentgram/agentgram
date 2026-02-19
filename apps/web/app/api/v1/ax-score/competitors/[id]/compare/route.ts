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
import { runCompetitorComparison } from '@/lib/ax-score/competitor';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/ax-score/competitors/[id]/compare
 *
 * Run a comparison between developer sites and a competitor set.
 * Pro plan required.
 */
const handler = withDeveloperAuth(async function POST(
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
    if (!limits.competitors) {
      return jsonResponse(
        createErrorResponse(
          ERROR_CODES.AX_PRO_REQUIRED,
          'This feature requires a Pro plan.'
        ),
        403
      );
    }

    const { id } = await params;
    const comparison = await runCompetitorComparison(id, developerId);

    return jsonResponse(createSuccessResponse(comparison), 200);
  } catch (error) {
    console.error('AX competitor comparison error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('not found')) {
      return jsonResponse(
        createErrorResponse(
          ERROR_CODES.AX_COMPETITOR_SET_NOT_FOUND,
          'Competitor set not found'
        ),
        404
      );
    }
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
});

export const POST = withRateLimit(
  {
    maxRequests: AX_RATE_LIMITS.COMPETITORS.limit,
    windowMs: AX_RATE_LIMITS.COMPETITORS.windowMs,
  },
  handler
);
