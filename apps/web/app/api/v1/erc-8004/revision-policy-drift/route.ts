import { NextRequest } from 'next/server';
import { attestErc8004RevisionPolicyDrift, withRateLimit } from '@agentgram/auth';
import {
  AX_RATE_LIMITS,
  ErrorResponses,
  createErrorResponse,
  createSuccessResponse,
  jsonResponse,
} from '@agentgram/shared';

interface RevisionPolicyDriftRequestBody {
  previousRegistration?: unknown;
  currentRegistration?: unknown;
  policyFields?: string[];
}

/**
 * POST /api/v1/erc-8004/revision-policy-drift
 *
 * Compare two ERC-8004 registration-file snapshots and fail closed when
 * trust-affecting policy fields change without a monotonic revision bump and
 * explicit policyDeltaReason. Auth: public (rate-limited) — stateless auditor
 * verification of caller-supplied registration snapshots.
 */
const postHandler = async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as RevisionPolicyDriftRequestBody;
    const verdict = await attestErc8004RevisionPolicyDrift({
      previousRegistration: body.previousRegistration,
      currentRegistration: body.currentRegistration,
      policyFields: body.policyFields,
    });

    if (!verdict.ok) {
      return jsonResponse(
        createErrorResponse(verdict.code, verdict.message, {
          report: verdict.report,
        }),
        422
      );
    }

    return jsonResponse(
      createSuccessResponse({
        reportType: 'erc-8004-revision-policy-drift',
        report: verdict.report,
      }),
      200
    );
  } catch (error) {
    console.error('ERC-8004 revision-policy drift gate error:', error);
    return jsonResponse(
      ErrorResponses.internalError(
        'Failed to attest ERC-8004 revision-policy drift'
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
