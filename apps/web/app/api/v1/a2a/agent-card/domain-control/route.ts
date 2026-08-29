import { NextRequest } from 'next/server';
import {
  attestA2aAgentCardDomainControl,
  withRateLimit,
} from '@agentgram/auth';
import {
  AX_RATE_LIMITS,
  ErrorResponses,
  createErrorResponse,
  createSuccessResponse,
  jsonResponse,
} from '@agentgram/shared';

interface AgentCardDomainControlRequestBody {
  agentCardUrl?: unknown;
  agentCard?: unknown;
  publicKey?: unknown;
  signature?: unknown;
  jws?: unknown;
  originObservations?: unknown;
}

/**
 * POST /api/v1/a2a/agent-card/domain-control
 *
 * Verify a signed A2A Agent Card and attest provider.url/documentationUrl
 * redirect, TLS, and domain-control observations. Canonical provider and docs
 * origins are bound to the signed Card digest; external-discovery origin drift
 * fails closed with a mismatch verdict.
 * Auth: public (rate-limited) — stateless verification of caller-supplied
 * signed card and origin observations, no account or developer state is read.
 */
const postHandler = async function POST(req: NextRequest) {
  try {
    const body = (await req
      .json()
      .catch(() => ({}))) as AgentCardDomainControlRequestBody;
    const verdict = await attestA2aAgentCardDomainControl({
      agentCardUrl: body.agentCardUrl,
      agentCard: body.agentCard,
      publicKey: body.publicKey,
      signature: body.signature,
      jws: body.jws,
      originObservations: body.originObservations,
    });

    if (!verdict.ok) {
      return jsonResponse(
        createErrorResponse(verdict.code, verdict.message, {
          domainControl: verdict.domainControl,
        }),
        verdict.code === 'EXTERNAL_DISCOVERY_MISMATCH' ? 409 : 401
      );
    }

    return jsonResponse(
      createSuccessResponse({
        reportType: 'a2a-agent-card-domain-control',
        domainControl: verdict.domainControl,
      }),
      200
    );
  } catch (error) {
    console.error('A2A Agent Card domain-control attestation error:', error);
    return jsonResponse(
      ErrorResponses.internalError(
        'Failed to attest A2A Agent Card provider/documentation domain control'
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
