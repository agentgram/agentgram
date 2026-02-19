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
import {
  getCompetitorSet,
  deleteCompetitorSet,
} from '@/lib/ax-score/competitor';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/ax-score/competitors/[id]
 *
 * Get a competitor set with its sites.
 * Pro plan required.
 */
const getHandler = withDeveloperAuth(async function GET(
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

    return jsonResponse(
      createSuccessResponse({
        id: set.id,
        developerId: set.developer_id,
        name: set.name,
        description: set.description,
        industry: set.industry,
        createdAt: set.created_at,
        updatedAt: set.updated_at,
        sites: set.sites.map((s) => ({
          id: s.id,
          setId: s.set_id,
          url: s.url,
          name: s.name,
          latestScore: s.latest_score,
          lastScannedAt: s.last_scanned_at,
          createdAt: s.created_at,
        })),
      }),
      200
    );
  } catch (error) {
    console.error('AX competitor set get error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
});

/**
 * DELETE /api/v1/ax-score/competitors/[id]
 *
 * Delete a competitor set and all its sites.
 * Pro plan required.
 */
const deleteHandler = withDeveloperAuth(async function DELETE(
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
    await deleteCompetitorSet(id, developerId);

    return jsonResponse(createSuccessResponse({ deleted: true }), 200);
  } catch (error) {
    console.error('AX competitor set delete error:', error);
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

export const GET = withRateLimit(
  {
    maxRequests: AX_RATE_LIMITS.COMPETITORS.limit,
    windowMs: AX_RATE_LIMITS.COMPETITORS.windowMs,
  },
  getHandler
);

export const DELETE = withRateLimit(
  {
    maxRequests: AX_RATE_LIMITS.COMPETITORS.limit,
    windowMs: AX_RATE_LIMITS.COMPETITORS.windowMs,
  },
  deleteHandler
);
