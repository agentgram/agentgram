import { NextRequest } from 'next/server';
import {
  attestA2aPushNotificationCallbackVerification,
  withRateLimit,
} from '@agentgram/auth';
import {
  AX_RATE_LIMITS,
  ErrorResponses,
  createErrorResponse,
  createSuccessResponse,
  jsonResponse,
} from '@agentgram/shared';

interface PushNotificationCallbackVerificationRequestBody {
  agentCard?: unknown;
  publicKey?: unknown;
  signature?: unknown;
  jws?: unknown;
  callbackUrl?: unknown;
  subscriptionTransitions?: unknown;
  failedDelivery?: unknown;
}

/**
 * POST /api/v1/a2a/agent-card/push-notification-callback
 *
 * Verify a signed A2A Agent Card push-notification capability claim, require an
 * HTTPS same-origin callback URL, bind create/delete subscription transitions,
 * and export a callback-verification receipt that includes a failed delivery
 * outcome. Raw callback errors are digested before returning evidence.
 * Auth: public (rate-limited) — stateless verification of caller-supplied
 * signed card material, no account or developer state is read.
 */
const postHandler = async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as PushNotificationCallbackVerificationRequestBody;
    const verdict = await attestA2aPushNotificationCallbackVerification({
      agentCard: body.agentCard,
      publicKey: body.publicKey,
      signature: body.signature,
      jws: body.jws,
      callbackUrl: body.callbackUrl,
      subscriptionTransitions: body.subscriptionTransitions,
      failedDelivery: body.failedDelivery,
    });

    if (!verdict.ok) {
      return jsonResponse(
        createErrorResponse(verdict.code, verdict.message, {
          receipt: verdict.receipt,
        }),
        verdict.code === 'SIGNATURE_INVALID' ? 401 : 409
      );
    }

    return jsonResponse(
      createSuccessResponse({
        reportType: 'a2a-push-notification-callback-verification',
        receipt: verdict.receipt,
      }),
      200
    );
  } catch (error) {
    console.error('A2A push-notification callback verification error:', error);
    return jsonResponse(
      ErrorResponses.internalError(
        'Failed to attest A2A push-notification callback verification'
      ),
      500
    );
  }
};

export const POST = withRateLimit(
  {
    maxRequests: AX_RATE_LIMITS.SCAN.limit,
    windowMs: AX_RATE_LIMITS.SCAN.windowMs,
  },
  postHandler
);
