import { NextRequest } from 'next/server';
import {
  attestA2aAgentCardRetrievalFreshness,
  withRateLimit,
} from '@agentgram/auth';
import {
  AX_RATE_LIMITS,
  ErrorResponses,
  createErrorResponse,
  createSuccessResponse,
  jsonResponse,
} from '@agentgram/shared';

interface AgentCardRetrievalFreshnessRequestBody {
  agentCardUrl?: unknown;
  agentCard?: unknown;
  publicKey?: unknown;
  signature?: unknown;
  jws?: unknown;
  fetchedAt?: unknown;
  etag?: unknown;
  lastModified?: unknown;
  cacheControl?: unknown;
  signatureKeyVersion?: unknown;
}

/**
 * POST /api/v1/a2a/agent-card/retrieval-freshness
 *
 * Verify a supplied A2A Agent Card against its Ed25519 signature and bind the
 * retrieval metadata used by discovery clients: ETag, Last-Modified,
 * Cache-Control, fetch time, and signature key/version. Valid signatures are
 * not enough; stale retrieval evidence fails closed so operators can reject
 * valid-but-stale Agent Cards before trust display.
 * Auth: public (rate-limited) — stateless verification of caller-supplied
 * material, no account or developer state is read.
 */
const postHandler = async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as AgentCardRetrievalFreshnessRequestBody;
    const verdict = await attestA2aAgentCardRetrievalFreshness({
      agentCardUrl: body.agentCardUrl,
      agentCard: body.agentCard,
      publicKey: body.publicKey,
      signature: body.signature,
      jws: body.jws,
      fetchedAt: body.fetchedAt,
      etag: body.etag,
      lastModified: body.lastModified,
      cacheControl: body.cacheControl,
      signatureKeyVersion: body.signatureKeyVersion,
    });

    if (!verdict.ok) {
      return jsonResponse(
        createErrorResponse(verdict.code, verdict.message, {
          freshness: verdict.freshness,
        }),
        verdict.code === 'AGENT_CARD_STALE' ? 409 : 401
      );
    }

    return jsonResponse(
      createSuccessResponse({
        reportType: 'a2a-agent-card-retrieval-freshness',
        freshness: verdict.freshness,
      }),
      200
    );
  } catch (error) {
    console.error('A2A Agent Card retrieval freshness error:', error);
    return jsonResponse(
      ErrorResponses.internalError(
        'Failed to attest A2A Agent Card retrieval freshness'
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
