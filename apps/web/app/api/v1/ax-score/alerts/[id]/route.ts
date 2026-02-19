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
import type { UpdateAlertRequest } from '@agentgram/shared';
import { getDeveloperPlan } from '@/lib/ax-score/usage';
import { updateAlertStatus } from '@/lib/ax-score/alerts';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/ax-score/alerts/[id]
 *
 * Update alert status (acknowledge, resolve, dismiss).
 * Pro plan required.
 */
const handler = withDeveloperAuth(async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
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

    const { id } = await params;
    const body = (await req.json()) as UpdateAlertRequest;

    if (!body.status || !['acknowledged', 'resolved', 'dismissed'].includes(body.status)) {
      return jsonResponse(
        ErrorResponses.invalidInput(
          'status must be one of: acknowledged, resolved, dismissed'
        ),
        400
      );
    }

    const alert = await updateAlertStatus(id, developerId, body.status);

    return jsonResponse(
      createSuccessResponse({
        id: alert.id,
        siteId: alert.site_id,
        developerId: alert.developer_id,
        scanId: alert.scan_id,
        baselineId: alert.baseline_id,
        alertType: alert.alert_type,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        category: alert.category,
        scoreDelta: alert.score_delta,
        previousScore: alert.previous_score,
        currentScore: alert.current_score,
        status: alert.status,
        acknowledgedAt: alert.acknowledged_at,
        createdAt: alert.created_at,
      }),
      200
    );
  } catch (error) {
    console.error('AX alert update error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('not found') || message.includes('access denied')) {
      return jsonResponse(
        createErrorResponse(ERROR_CODES.AX_ALERT_NOT_FOUND, 'Alert not found'),
        404
      );
    }
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
});

export const PATCH = withRateLimit(
  {
    maxRequests: AX_RATE_LIMITS.ALERTS.limit,
    windowMs: AX_RATE_LIMITS.ALERTS.windowMs,
  },
  handler
);
