import { NextRequest } from 'next/server';
import {
  attestA2aExtendedAgentCardAuthorizationDowngrade,
  withRateLimit,
} from '@agentgram/auth';
import {
  AX_RATE_LIMITS,
  ErrorResponses,
  createErrorResponse,
  createSuccessResponse,
  jsonResponse,
} from '@agentgram/shared';

interface AuthorizationDowngradeCacheClearanceRequestBody {
  agentCard?: unknown;
  publicKey?: unknown;
  signature?: unknown;
  jws?: unknown;
  sessionId?: unknown;
  cardVersion?: unknown;
  disclosureDigest?: unknown;
  transitions?: unknown;
}

/**
 * POST /api/v1/a2a/agent-card/authorization-downgrade-cache-clearance
 *
 * Verify a signed base A2A Agent Card and prove authenticated Extended Agent
 * Card material is cleared when a discovery session downgrades back to public
 * or expires. The verifier binds session id, card version, disclosure digest,
 * and per-transition extended capability digests so cached authenticated
 * capabilities cannot leak into public retrievals.
 * Auth: public (rate-limited) — stateless verification of caller-supplied
 * retrieval evidence, no account or developer state is read.
 */
const postHandler = async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as AuthorizationDowngradeCacheClearanceRequestBody;
    const verdict = await attestA2aExtendedAgentCardAuthorizationDowngrade({
      agentCard: body.agentCard,
      publicKey: body.publicKey,
      signature: body.signature,
      jws: body.jws,
      sessionId: body.sessionId,
      cardVersion: body.cardVersion,
      disclosureDigest: body.disclosureDigest,
      transitions: body.transitions,
    });

    if (!verdict.ok) {
      return jsonResponse(
        createErrorResponse(verdict.code, verdict.message, {
          clearance: verdict.clearance,
        }),
        verdict.code === 'EXTENDED_CAPABILITIES_CACHE_LEAK' ? 409 : 401
      );
    }

    return jsonResponse(
      createSuccessResponse({
        reportType: 'a2a-extended-agent-card-authorization-downgrade-cache-clearance',
        clearance: verdict.clearance,
      }),
      200
    );
  } catch (error) {
    console.error('A2A Extended Agent Card authorization downgrade error:', error);
    return jsonResponse(
      ErrorResponses.internalError(
        'Failed to attest A2A Extended Agent Card authorization downgrade cache clearance'
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
