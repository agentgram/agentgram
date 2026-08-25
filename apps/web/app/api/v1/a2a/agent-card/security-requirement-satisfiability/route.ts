import { NextRequest } from 'next/server';
import {
  attestA2aSecurityRequirementSatisfiability,
  withRateLimit,
} from '@agentgram/auth';
import {
  AX_RATE_LIMITS,
  ErrorResponses,
  createErrorResponse,
  createSuccessResponse,
  jsonResponse,
} from '@agentgram/shared';

interface SecurityRequirementSatisfiabilityRequestBody {
  agentCard?: unknown;
  publicKey?: unknown;
  signature?: unknown;
  jws?: unknown;
}

/**
 * POST /api/v1/a2a/agent-card/security-requirement-satisfiability
 *
 * Verify a signed A2A Agent Card and attest that every Agent Card or skill-level
 * securityRequirements entry can be satisfied by the declared securitySchemes.
 * Missing schemes, invalid scheme shapes, impossible scopes, or malformed
 * requirement objects fail closed with signed-card-bound evidence.
 * Auth: public (rate-limited) — stateless verification of caller-supplied
 * signed card material, no account or developer state is read.
 */
const postHandler = async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as SecurityRequirementSatisfiabilityRequestBody;
    const verdict = await attestA2aSecurityRequirementSatisfiability({
      agentCard: body.agentCard,
      publicKey: body.publicKey,
      signature: body.signature,
      jws: body.jws,
    });

    if (!verdict.ok) {
      return jsonResponse(
        createErrorResponse(verdict.code, verdict.message, {
          satisfiability: verdict.satisfiability,
        }),
        verdict.code === 'SECURITY_REQUIREMENTS_UNSATISFIABLE' ? 409 : 401
      );
    }

    return jsonResponse(
      createSuccessResponse({
        reportType: 'a2a-security-requirement-satisfiability',
        satisfiability: verdict.satisfiability,
      }),
      200
    );
  } catch (error) {
    console.error('A2A security-requirement satisfiability error:', error);
    return jsonResponse(
      ErrorResponses.internalError(
        'Failed to attest A2A security-requirement satisfiability'
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
