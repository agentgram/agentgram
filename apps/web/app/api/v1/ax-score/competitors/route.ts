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
import type { CreateCompetitorSetRequest } from '@agentgram/shared';
import { getDeveloperPlan } from '@/lib/ax-score/usage';
import {
  listCompetitorSets,
  createCompetitorSet,
} from '@/lib/ax-score/competitor';

/**
 * GET /api/v1/ax-score/competitors
 *
 * List competitor sets for the authenticated developer.
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
    if (!limits.competitors) {
      return jsonResponse(
        createErrorResponse(
          ERROR_CODES.AX_PRO_REQUIRED,
          'This feature requires a Pro plan.'
        ),
        403
      );
    }

    const sets = await listCompetitorSets(developerId);

    return jsonResponse(
      createSuccessResponse(
        sets.map((s) => ({
          id: s.id,
          developerId: s.developer_id,
          name: s.name,
          description: s.description,
          industry: s.industry,
          createdAt: s.created_at,
          updatedAt: s.updated_at,
        }))
      ),
      200
    );
  } catch (error) {
    console.error('AX competitors list error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
});

/**
 * POST /api/v1/ax-score/competitors
 *
 * Create a new competitor set with URLs.
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
    if (!limits.competitors) {
      return jsonResponse(
        createErrorResponse(
          ERROR_CODES.AX_PRO_REQUIRED,
          'This feature requires a Pro plan.'
        ),
        403
      );
    }

    const body = (await req.json()) as CreateCompetitorSetRequest;

    if (!body.name || typeof body.name !== 'string') {
      return jsonResponse(
        ErrorResponses.invalidInput('name is required'),
        400
      );
    }

    if (!Array.isArray(body.urls) || body.urls.length === 0) {
      return jsonResponse(
        ErrorResponses.invalidInput('urls array is required and must not be empty'),
        400
      );
    }

    const result = await createCompetitorSet(developerId, {
      name: body.name,
      description: body.description,
      industry: body.industry,
      urls: body.urls,
    });

    return jsonResponse(
      createSuccessResponse({
        id: result.id,
        developerId: result.developer_id,
        name: result.name,
        description: result.description,
        industry: result.industry,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
        sites: result.sites.map((s) => ({
          id: s.id,
          setId: s.set_id,
          url: s.url,
          name: s.name,
          latestScore: s.latest_score,
          createdAt: s.created_at,
        })),
      }),
      201
    );
  } catch (error) {
    console.error('AX competitor set create error:', error);
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

export const POST = withRateLimit(
  {
    maxRequests: AX_RATE_LIMITS.COMPETITORS.limit,
    windowMs: AX_RATE_LIMITS.COMPETITORS.windowMs,
  },
  postHandler
);
