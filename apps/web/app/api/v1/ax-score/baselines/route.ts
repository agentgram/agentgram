import { NextRequest } from 'next/server';
import { withRateLimit } from '@agentgram/auth';
import { withDeveloperAuth } from '@/lib/auth/developer';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  AX_RATE_LIMITS,
} from '@agentgram/shared';
import type { CreateBaselineRequest } from '@agentgram/shared';
import { createBaseline, listBaselines } from '@/lib/ax-score/baselines';

/**
 * GET /api/v1/ax-score/baselines
 *
 * List baselines for the authenticated developer.
 * Query params: siteId
 */
const getHandler = withDeveloperAuth(async function GET(req: NextRequest) {
  try {
    const developerId = req.headers.get('x-developer-id');
    if (!developerId) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get('siteId') || undefined;

    const baselines = await listBaselines(developerId, siteId);

    return jsonResponse(
      createSuccessResponse(
        baselines.map((b) => ({
          id: b.id,
          siteId: b.site_id,
          developerId: b.developer_id,
          scanId: b.scan_id,
          score: b.score,
          categoryScores: b.category_scores,
          signals: b.signals,
          label: b.label,
          isCurrent: b.is_current,
          createdAt: b.created_at,
        }))
      ),
      200
    );
  } catch (error) {
    console.error('AX baselines list error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
});

/**
 * POST /api/v1/ax-score/baselines
 *
 * Create a new baseline from an existing scan.
 */
const postHandler = withDeveloperAuth(async function POST(req: NextRequest) {
  try {
    const developerId = req.headers.get('x-developer-id');
    if (!developerId) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    const body = (await req.json()) as CreateBaselineRequest;
    const { siteId, scanId, label } = body;

    if (!siteId || !scanId) {
      return jsonResponse(
        ErrorResponses.invalidInput('siteId and scanId are required'),
        400
      );
    }

    const baseline = await createBaseline(siteId, developerId, scanId, label);

    return jsonResponse(
      createSuccessResponse({
        id: baseline.id,
        siteId: baseline.site_id,
        developerId: baseline.developer_id,
        scanId: baseline.scan_id,
        score: baseline.score,
        categoryScores: baseline.category_scores,
        signals: baseline.signals,
        label: baseline.label,
        isCurrent: baseline.is_current,
        createdAt: baseline.created_at,
      }),
      201
    );
  } catch (error) {
    console.error('AX baseline create error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
});

export const GET = withRateLimit(
  {
    maxRequests: AX_RATE_LIMITS.BASELINES.limit,
    windowMs: AX_RATE_LIMITS.BASELINES.windowMs,
  },
  getHandler
);

export const POST = withRateLimit(
  {
    maxRequests: AX_RATE_LIMITS.BASELINES.limit,
    windowMs: AX_RATE_LIMITS.BASELINES.windowMs,
  },
  postHandler
);
