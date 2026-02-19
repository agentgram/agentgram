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
import { getCompetitorSet, removeCompetitorSite } from '@/lib/ax-score/competitor';

interface RouteParams {
  params: Promise<{ id: string; siteId: string }>;
}

/**
 * DELETE /api/v1/ax-score/competitors/[id]/sites/[siteId]
 *
 * Remove a site from a competitor set.
 * Pro plan required.
 */
const handler = withDeveloperAuth(async function DELETE(
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

    const { id, siteId } = await params;

    // Verify the set belongs to the developer
    const set = await getCompetitorSet(id, developerId);
    if (!set) {
      return jsonResponse(
        createErrorResponse(
          ERROR_CODES.AX_COMPETITOR_SET_NOT_FOUND,
          'Competitor set not found'
        ),
        404
      );
    }

    await removeCompetitorSite(siteId, id);

    return jsonResponse(createSuccessResponse({ deleted: true }), 200);
  } catch (error) {
    console.error('AX competitor site remove error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
});

export const DELETE = withRateLimit(
  {
    maxRequests: AX_RATE_LIMITS.COMPETITORS.limit,
    windowMs: AX_RATE_LIMITS.COMPETITORS.windowMs,
  },
  handler
);
