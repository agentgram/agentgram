import { NextRequest } from 'next/server';
import { withRateLimit } from '@agentgram/auth';
import { verifyA2aAgentCardSignature } from '@agentgram/auth';
import {
  AX_RATE_LIMITS,
  ErrorResponses,
  createErrorResponse,
  createSuccessResponse,
  jsonResponse,
} from '@agentgram/shared';
import { buildA2aInterfaceBindingAttestation } from '@/lib/a2a/interface-binding-attestation';

interface InterfaceBindingAttestationRequestBody {
  agentCard?: unknown;
  previousAgentCard?: unknown;
  publicKey?: unknown;
  signature?: unknown;
}

/**
 * POST /api/v1/a2a/agent-card/interface-binding-attestation
 *
 * Verify the submitted Agent Card signature, probe each declared interface at
 * URL/transport/version/security-scheme granularity, and return an
 * Ed25519-signable attestation receipt that AX Score/discovery clients can
 * penalize when interfaces are unreachable or security bindings drift.
 * Auth: public (rate-limited) — stateless verification of caller-supplied
 * material, no account or developer state is read.
 */
const postHandler = async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as InterfaceBindingAttestationRequestBody;
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

    const attestation = await buildA2aInterfaceBindingAttestation({
      agentCard: body.agentCard,
      previousAgentCard: body.previousAgentCard,
      signatureVerified: true,
      signaturePayloadDigest: verdict.payloadDigest,
    });

    return jsonResponse(
      createSuccessResponse({
        reportType: 'a2a-interface-binding-attestation',
        verdict: {
          ok: true,
          payloadDigest: verdict.payloadDigest,
          evidence: verdict.evidence,
        },
        attestation,
      }),
      200
    );
  } catch (error) {
    console.error('A2A Agent Card interface-binding attestation error:', error);
    return jsonResponse(
      ErrorResponses.internalError(
        'Failed to produce A2A Agent Card interface-binding attestation'
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
