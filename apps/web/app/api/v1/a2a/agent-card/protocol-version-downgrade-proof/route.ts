import { NextRequest } from 'next/server';
import {
  attestA2aProtocolVersionDowngradeProof,
  withRateLimit,
} from '@agentgram/auth';
import {
  AX_RATE_LIMITS,
  ErrorResponses,
  createErrorResponse,
  createSuccessResponse,
  jsonResponse,
} from '@agentgram/shared';

interface ProtocolVersionDowngradeProofRequestBody {
  agentCard?: unknown;
  publicKey?: unknown;
  signature?: unknown;
  jws?: unknown;
  transcript?: unknown;
  transcriptSignature?: unknown;
}

/**
 * POST /api/v1/a2a/agent-card/protocol-version-downgrade-proof
 *
 * Verify a signed A2A Agent Card and an Ed25519-signed protocol negotiation
 * transcript. The proof binds the requested protocol version to the negotiated
 * interface version so discovery clients can reject silent version fallback.
 * Auth: public (rate-limited) — stateless verification of caller-supplied
 * signed discovery evidence, no account or developer state is read.
 */
const postHandler = async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as ProtocolVersionDowngradeProofRequestBody;
    const verdict = await attestA2aProtocolVersionDowngradeProof({
      agentCard: body.agentCard,
      publicKey: body.publicKey,
      signature: body.signature,
      jws: body.jws,
      transcript: body.transcript,
      transcriptSignature: body.transcriptSignature,
    });

    if (!verdict.ok) {
      return jsonResponse(
        createErrorResponse(verdict.code, verdict.message, {
          downgradeProof: verdict.downgradeProof,
        }),
        verdict.code === 'PROTOCOL_VERSION_DOWNGRADE' ? 409 : 401
      );
    }

    return jsonResponse(
      createSuccessResponse({
        reportType: 'a2a-protocol-version-downgrade-proof',
        downgradeProof: verdict.downgradeProof,
      }),
      200
    );
  } catch (error) {
    console.error('A2A protocol-version downgrade proof error:', error);
    return jsonResponse(
      ErrorResponses.internalError(
        'Failed to attest A2A protocol-version downgrade proof'
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
