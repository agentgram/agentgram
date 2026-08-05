import { NextRequest } from 'next/server';
import { withRateLimit } from '@agentgram/auth';
import {
  buildA2aAgentCardCanonicalSignatureEvidence,
  verifyA2aAgentCardSignature,
} from '@agentgram/auth';
import {
  AX_RATE_LIMITS,
  ErrorResponses,
  createErrorResponse,
  createSuccessResponse,
  jsonResponse,
} from '@agentgram/shared';

interface AgentCardSignatureRequestBody {
  agentCard?: unknown;
  publicKey?: unknown;
  signature?: unknown;
}

/**
 * GET /api/v1/a2a/agent-card/canonical-signature
 *
 * Public evidence endpoint for the A2A Agent Card canonical-signature gate:
 * it exposes the RFC8785 fixture and confirms unsigned or malformed cards are
 * rejected rather than accepted optimistically.
 */
export const GET = withRateLimit(
  {
    maxRequests: AX_RATE_LIMITS.SCAN.limit,
    windowMs: AX_RATE_LIMITS.SCAN.windowMs,
  },
  async function GET() {
    return jsonResponse(
      createSuccessResponse({
        reportType: 'a2a-agent-card-canonical-signature',
        evidence: buildA2aAgentCardCanonicalSignatureEvidence(),
      }),
      200
    );
  }
);

/**
 * POST /api/v1/a2a/agent-card/canonical-signature
 *
 * Verify a supplied A2A Agent Card against its Ed25519 signature over the
 * RFC8785-style canonical JSON payload. The route deliberately omits raw
 * canonicalJson from successful responses and returns fail-closed evidence on
 * every negative verdict.
 */
const postHandler = async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as AgentCardSignatureRequestBody;
    const verdict = await verifyA2aAgentCardSignature({
      agentCard: body.agentCard,
      publicKey: body.publicKey,
      signature: body.signature,
    });

    if (!verdict.ok) {
      return jsonResponse(
        createErrorResponse(verdict.code, verdict.message, {
          evidence: verdict.evidence,
        }),
        401
      );
    }

    return jsonResponse(
      createSuccessResponse({
        reportType: 'a2a-agent-card-canonical-signature',
        verdict: {
          ok: true,
          payloadDigest: verdict.payloadDigest,
          evidence: verdict.evidence,
        },
      }),
      200
    );
  } catch (error) {
    console.error('A2A Agent Card canonical-signature gate error:', error);
    return jsonResponse(
      ErrorResponses.internalError(
        'Failed to verify A2A Agent Card canonical signature'
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
