import { NextRequest } from 'next/server';
import {
  attestA2aAgentCardExtensionGovernance,
  withRateLimit,
} from '@agentgram/auth';
import {
  AX_RATE_LIMITS,
  ErrorResponses,
  createErrorResponse,
  createSuccessResponse,
  jsonResponse,
} from '@agentgram/shared';

interface AgentCardExtensionGovernanceRequestBody {
  agentCard?: unknown;
  publicKey?: unknown;
  signature?: unknown;
  jws?: unknown;
  governanceRegistry?: unknown;
}

/**
 * POST /api/v1/a2a/agent-card/extension-governance
 *
 * Verify a signed A2A Agent Card and bind every declared AgentExtension
 * URI/version to governance provenance: canonical spec URL/digest, promotion
 * tier, observation time, and support-policy verdict. Unknown, unpromoted, or
 * retired extensions lower discovery confidence; unsupported required
 * extensions fail closed for external discovery clients.
 * Auth: public (rate-limited) — stateless verification of caller-supplied
 * signed card and governance evidence, no account or developer state is read.
 */
const postHandler = async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as AgentCardExtensionGovernanceRequestBody;
    const verdict = await attestA2aAgentCardExtensionGovernance({
      agentCard: body.agentCard,
      publicKey: body.publicKey,
      signature: body.signature,
      jws: body.jws,
      governanceRegistry: body.governanceRegistry,
    });

    if (!verdict.ok) {
      return jsonResponse(
        createErrorResponse(verdict.code, verdict.message, {
          governance: verdict.governance,
        }),
        verdict.code === 'EXTENSIONS_INVALID' || verdict.code === 'SIGNATURE_INVALID'
          ? 401
          : 409
      );
    }

    return jsonResponse(
      createSuccessResponse({
        reportType: 'a2a-agent-card-extension-governance',
        governance: verdict.governance,
      }),
      200
    );
  } catch (error) {
    console.error('A2A Agent Card extension governance attestation error:', error);
    return jsonResponse(
      ErrorResponses.internalError(
        'Failed to attest A2A Agent Card extension governance'
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
