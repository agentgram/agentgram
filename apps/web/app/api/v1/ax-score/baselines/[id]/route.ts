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
} from '@agentgram/shared';
import { getAxDbClient, type AxBaselineRow } from '@/lib/ax-score/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/ax-score/baselines/[id]
 *
 * Get a single baseline by ID.
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

    const { id } = await params;
    const db = getAxDbClient();

    const { data, error } = await db
      .from('ax_baselines')
      .select('*')
      .eq('id', id)
      .eq('developer_id', developerId)
      .single();

    if (error || !data) {
      return jsonResponse(
        createErrorResponse(
          ERROR_CODES.AX_BASELINE_NOT_FOUND,
          'Baseline not found'
        ),
        404
      );
    }

    const b = data as AxBaselineRow;

    return jsonResponse(
      createSuccessResponse({
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
      }),
      200
    );
  } catch (error) {
    console.error('AX baseline get error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
});

/**
 * DELETE /api/v1/ax-score/baselines/[id]
 *
 * Delete a baseline by ID.
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

    const { id } = await params;
    const db = getAxDbClient();

    const { error } = await db
      .from('ax_baselines')
      .delete()
      .eq('id', id)
      .eq('developer_id', developerId);

    if (error) {
      return jsonResponse(
        createErrorResponse(
          ERROR_CODES.AX_BASELINE_NOT_FOUND,
          'Baseline not found or access denied'
        ),
        404
      );
    }

    return jsonResponse(createSuccessResponse({ deleted: true }), 200);
  } catch (error) {
    console.error('AX baseline delete error:', error);
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

export const DELETE = withRateLimit(
  {
    maxRequests: AX_RATE_LIMITS.BASELINES.limit,
    windowMs: AX_RATE_LIMITS.BASELINES.windowMs,
  },
  deleteHandler
);
