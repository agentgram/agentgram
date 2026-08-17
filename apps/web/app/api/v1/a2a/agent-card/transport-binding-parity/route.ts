import { NextRequest } from 'next/server';
import {
  attestA2aAgentCardTransportBindingParity,
  withRateLimit,
} from '@agentgram/auth';
import {
  AX_RATE_LIMITS,
  ErrorResponses,
  createErrorResponse,
  createSuccessResponse,
  jsonResponse,
} from '@agentgram/shared';

interface AgentCardTransportBindingParityRequestBody {
  agentCard?: unknown;
  publicKey?: unknown;
  signature?: unknown;
  jws?: unknown;
}

/**
 * POST /api/v1/a2a/agent-card/transport-binding-parity
 *
 * Verify a signed A2A Agent Card, execute the same deterministic capability
 * probe across each declared transport binding, and return a parity verdict.
 * Any task-semantics or auth-behavior mismatch fails closed so operators can
 * detect transport-specific downgrade paths before trusting the card.
 * Auth: public (rate-limited) — stateless verification of caller-supplied
 * signed card material, no account or developer state is read.
 */
const postHandler = async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as AgentCardTransportBindingParityRequestBody;
    const verdict = await attestA2aAgentCardTransportBindingParity({
      agentCard: body.agentCard,
      publicKey: body.publicKey,
      signature: body.signature,
      jws: body.jws,
    });

    if (!verdict.ok) {
      return jsonResponse(
        createErrorResponse(verdict.code, verdict.message, {
          parity: verdict.parity,
        }),
        401
      );
    }

    return jsonResponse(
      createSuccessResponse({
        reportType: 'a2a-agent-card-transport-binding-parity',
        parity: verdict.parity,
      }),
      200
    );
  } catch (error) {
    console.error('A2A Agent Card transport-binding parity error:', error);
    return jsonResponse(
      ErrorResponses.internalError(
        'Failed to attest A2A Agent Card transport-binding parity'
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
