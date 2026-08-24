import { NextRequest } from 'next/server';
import {
  attestA2aTaskHistoryRetention,
  buildA2aTaskHistoryRetentionVerifierFixture,
  withRateLimit,
} from '@agentgram/auth';
import {
  AX_RATE_LIMITS,
  ErrorResponses,
  createErrorResponse,
  createSuccessResponse,
  jsonResponse,
} from '@agentgram/shared';

interface TaskHistoryRetentionRequestBody {
  agentCard?: unknown;
  publicKey?: unknown;
  signature?: unknown;
  jws?: unknown;
  taskId?: unknown;
  taskVersion?: unknown;
  cardVersion?: unknown;
  requestedHistoryLength?: unknown;
  returnedHistory?: unknown;
  truncationReason?: unknown;
  retentionSignature?: unknown;
}

/**
 * GET /api/v1/a2a/agent-card/task-history-retention
 *
 * Public verifier fixture for A2A task-history retention attestations. External
 * clients can hash the canonical fixture before trusting retention reports that
 * bind requested versus returned task-history length, task/card version, and
 * truncation reason.
 * Auth: public (rate-limited) — publishes conformance evidence only, no account
 * or developer state is read.
 */
export const GET = withRateLimit(
  {
    maxRequests: AX_RATE_LIMITS.SCAN.limit,
    windowMs: AX_RATE_LIMITS.SCAN.windowMs,
  },
  async function GET() {
    return jsonResponse(
      createSuccessResponse({
        reportType: 'a2a-task-history-retention-attestation-fixture',
        verifierFixture: await buildA2aTaskHistoryRetentionVerifierFixture(),
      }),
      200
    );
  }
);

/**
 * POST /api/v1/a2a/agent-card/task-history-retention
 *
 * Verify a signed A2A Agent Card and an Ed25519 retention transcript signature
 * over requested history length, returned history digest/length, task version,
 * Agent Card version, and truncation reason. Missing reasons for shortened
 * history or over-returned histories fail closed as non-reproducible audit
 * trails.
 * Auth: public (rate-limited) — stateless verification of caller-supplied
 * material, no account or developer state is read.
 */
const postHandler = async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as TaskHistoryRetentionRequestBody;
    const verdict = await attestA2aTaskHistoryRetention({
      agentCard: body.agentCard,
      publicKey: body.publicKey,
      signature: body.signature,
      jws: body.jws,
      taskId: body.taskId,
      taskVersion: body.taskVersion,
      cardVersion: body.cardVersion,
      requestedHistoryLength: body.requestedHistoryLength,
      returnedHistory: body.returnedHistory,
      truncationReason: body.truncationReason,
      retentionSignature: body.retentionSignature,
    });

    if (!verdict.ok) {
      return jsonResponse(
        createErrorResponse(verdict.code, verdict.message, {
          retention: verdict.retention,
        }),
        verdict.code === 'TASK_HISTORY_RETENTION_NON_REPRODUCIBLE' ? 409 : 401
      );
    }

    return jsonResponse(
      createSuccessResponse({
        reportType: 'a2a-task-history-retention-attestation',
        retention: verdict.retention,
      }),
      200
    );
  } catch (error) {
    console.error('A2A task-history retention attestation error:', error);
    return jsonResponse(
      ErrorResponses.internalError(
        'Failed to attest A2A task-history retention reproducibility'
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
