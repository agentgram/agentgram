import { createHash } from 'node:crypto';
import { NextRequest } from 'next/server';
import { canonicalJson, withRateLimit } from '@agentgram/auth';
import { withDeveloperAuth } from '@/lib/auth/developer';
import { getDeveloperPlan } from '@/lib/ax-score/usage';
import {
  AX_BILLING_REPORT_PLANS,
  AX_RATE_LIMITS,
  ERROR_CODES,
  ErrorResponses,
  createErrorResponse,
  createSuccessResponse,
  jsonResponse,
} from '@agentgram/shared';

const REPORT_TYPE = 'erc-8004-feedback-index-continuity-audit';
const RECEIPT_KIND = 'agentgram.ax-score.erc-8004.feedback-index-continuity-receipt';
const SIGNATURE_DOMAIN = 'agentgram:v1:ax-score:erc-8004-feedback-index-continuity:';
const DEFAULT_CHAIN_ID = 1;
const UNKNOWN_REGISTRY_ADDRESS = 'unknown';

interface FeedbackContinuityRequestBody {
  subjectAgentId?: unknown;
  chainId?: unknown;
  registryAddress?: unknown;
  reviewers?: unknown;
}

interface FeedbackInput {
  index: number;
  revoked: boolean;
  feedbackHash: string | null;
  feedbackURI: string | null;
}

interface ReviewerInput {
  reviewer: string;
  clientAddress: string | null;
  reportedLastIndex: number;
  feedback: FeedbackInput[];
}

function sha256Hex(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function isBillingReportPlan(plan: string): boolean {
  return (AX_BILLING_REPORT_PLANS as readonly string[]).includes(plan);
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

function readNonNegativeInteger(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

function readPositiveInteger(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1
    ? value
    : null;
}

function readFeedbackRows(value: unknown): FeedbackInput[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const index = readPositiveInteger(record.index);
      if (index === null) return null;

      return {
        index,
        revoked: record.revoked === true,
        feedbackHash: readString(record.feedbackHash),
        feedbackURI: readString(record.feedbackURI),
      } satisfies FeedbackInput;
    })
    .filter((entry): entry is FeedbackInput => entry !== null)
    .sort((a, b) => a.index - b.index);
}

function readReviewers(value: unknown): ReviewerInput[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const reviewer = readString(record.reviewer);
      const reportedLastIndex = readNonNegativeInteger(record.reportedLastIndex);
      if (!reviewer || reportedLastIndex === null) return null;

      return {
        reviewer,
        clientAddress: readString(record.clientAddress),
        reportedLastIndex,
        feedback: readFeedbackRows(record.feedback),
      } satisfies ReviewerInput;
    })
    .filter((entry): entry is ReviewerInput => entry !== null)
    .sort((a, b) => {
      const reviewerCompare = a.reviewer.localeCompare(b.reviewer);
      if (reviewerCompare !== 0) return reviewerCompare;
      return (a.clientAddress ?? '').localeCompare(b.clientAddress ?? '');
    });
}

function missingIndexesFor(indexes: Set<number>, reportedLastIndex: number): number[] {
  const missing: number[] = [];
  for (let index = 1; index <= reportedLastIndex; index += 1) {
    if (!indexes.has(index)) missing.push(index);
  }
  return missing;
}

function duplicateIndexesFor(feedback: FeedbackInput[]): number[] {
  const seen = new Set<number>();
  const duplicates = new Set<number>();

  feedback.forEach((entry) => {
    if (seen.has(entry.index)) {
      duplicates.add(entry.index);
    } else {
      seen.add(entry.index);
    }
  });

  return [...duplicates].sort((a, b) => a - b);
}

function buildReviewerVerdict(input: ReviewerInput) {
  const observedIndexes = new Set(input.feedback.map((entry) => entry.index));
  const duplicateIndexes = duplicateIndexesFor(input.feedback);
  const missingIndexes = missingIndexesFor(observedIndexes, input.reportedLastIndex);
  const maxObservedIndex = input.feedback.at(-1)?.index ?? 0;
  const lastIndexMatches = maxObservedIndex === input.reportedLastIndex;
  const continuous = missingIndexes.length === 0 && duplicateIndexes.length === 0;
  const revokedFeedbackCount = input.feedback.filter((entry) => entry.revoked).length;
  const activeFeedbackCount = input.feedback.length - revokedFeedbackCount;

  return {
    reviewer: input.reviewer,
    clientAddress: input.clientAddress,
    reportedLastIndex: input.reportedLastIndex,
    maxObservedIndex,
    returnedFeedbackCount: input.feedback.length,
    activeFeedbackCount,
    revokedFeedbackCount,
    missingIndexes,
    duplicateIndexes,
    lastIndexMatches,
    continuous,
    complete: continuous && lastIndexMatches,
    feedback: input.feedback,
  };
}

/**
 * POST /api/v1/ax-score/erc-8004/feedback-continuity
 *
 * Paid AX verifier for ERC-8004 feedback aggregation. It compares each
 * reviewer/client getLastIndex value against the returned readAllFeedback rows,
 * preserving revoked rows as evidence so off-chain reputation aggregation can
 * prove that gaps, duplicates, and revocations were not silently mixed in.
 */
const handler = withDeveloperAuth(async function POST(req: NextRequest) {
  try {
    const developerId = req.headers.get('x-developer-id');
    if (!developerId) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    const plan = await getDeveloperPlan(developerId);
    if (!isBillingReportPlan(plan)) {
      return jsonResponse(
        createErrorResponse(
          ERROR_CODES.AX_PRO_REQUIRED,
          'ERC-8004 feedback-index continuity audit receipts are available on Pro, Team, and Enterprise plans.'
        ),
        402
      );
    }

    const body = (await req.json().catch(() => ({}))) as FeedbackContinuityRequestBody;
    const subjectAgentId = readString(body.subjectAgentId) ?? 'unknown';
    const chainId = readNonNegativeInteger(body.chainId) ?? DEFAULT_CHAIN_ID;
    const registryAddress = readString(body.registryAddress) ?? UNKNOWN_REGISTRY_ADDRESS;
    const reviewers = readReviewers(body.reviewers).map(buildReviewerVerdict);
    const generatedAt = new Date().toISOString();
    const summary = {
      reviewerCount: reviewers.length,
      completeReviewerCount: reviewers.filter((reviewer) => reviewer.complete).length,
      incompleteReviewerCount: reviewers.filter((reviewer) => !reviewer.complete).length,
      returnedFeedbackCount: reviewers.reduce(
        (sum, reviewer) => sum + reviewer.returnedFeedbackCount,
        0
      ),
      activeFeedbackCount: reviewers.reduce(
        (sum, reviewer) => sum + reviewer.activeFeedbackCount,
        0
      ),
      revokedFeedbackCount: reviewers.reduce(
        (sum, reviewer) => sum + reviewer.revokedFeedbackCount,
        0
      ),
      gapCount: reviewers.reduce(
        (sum, reviewer) => sum + reviewer.missingIndexes.length,
        0
      ),
      duplicateIndexCount: reviewers.reduce(
        (sum, reviewer) => sum + reviewer.duplicateIndexes.length,
        0
      ),
      lastIndexMismatchCount: reviewers.filter(
        (reviewer) => !reviewer.lastIndexMatches
      ).length,
    };
    const auditEvidence = {
      standard: 'ERC-8004',
      reportType: REPORT_TYPE,
      subjectAgentId,
      chainId,
      registryAddress,
      generatedAt,
      sourceReadModel: {
        lastIndexFunction: 'getLastIndex(agentId, clientAddress)',
        feedbackFunction: 'readAllFeedback(agentId, reviewer, includeRevoked=true)',
        revokedRowsPreserved: true,
      },
      summary,
      reviewers,
    };
    const canonicalAuditEvidence = canonicalJson(auditEvidence);
    const evidenceDigest = sha256Hex(canonicalAuditEvidence);
    const signaturePayload = {
      kind: RECEIPT_KIND,
      reportType: REPORT_TYPE,
      subjectAgentId,
      chainId,
      registryAddress,
      evidenceDigest,
      validationTier: 'paid-ax-ed25519-signable-feedback-index-continuity',
      generatedAt,
    };
    const canonicalSignaturePayload = canonicalJson(signaturePayload);
    const payloadDigest = sha256Hex(canonicalSignaturePayload);

    return jsonResponse(
      createSuccessResponse({
        developerId,
        plan,
        reportType: REPORT_TYPE,
        payment: {
          status: 'ready',
          paymentPurpose: 'erc-8004-feedback-index-continuity-audit-report',
          recommendedPriceUsd: '79.00',
          deliverable:
            'Ed25519-signable ERC-8004 reviewer feedback-index continuity and revocation evidence.',
        },
        audit: {
          ...auditEvidence,
          receipt: {
            kind: RECEIPT_KIND,
            generatedAt,
            digestAlgorithm: 'sha256',
            evidenceDigest,
            reviewerCount: summary.reviewerCount,
            incompleteReviewerCount: summary.incompleteReviewerCount,
            x402: {
              status: 'ready',
              paymentPurpose: 'erc-8004-feedback-index-continuity-audit-report',
              recommendedPriceUsd: '79.00',
            },
            signature: {
              status: 'ed25519-signable',
              signingAlgorithm: 'ed25519',
              signatureDomain: SIGNATURE_DOMAIN,
              canonicalSignaturePayload,
              payloadDigest,
            },
            auditorVerification: {
              canonicalJsonStandard: 'sorted-key-json',
              canonicalAuditEvidence,
              verificationCommand:
                'rebuild reviewer verdicts from getLastIndex/readAllFeedback, canonicalize audit evidence, sha256 it, then Ed25519-sign the signature payload',
            },
          },
        },
      }),
      200
    );
  } catch (error) {
    console.error('ERC-8004 feedback continuity audit error:', error);
    return jsonResponse(
      ErrorResponses.internalError('Failed to produce ERC-8004 feedback continuity audit'),
      500
    );
  }
});

export const POST = withRateLimit(
  {
    maxRequests: AX_RATE_LIMITS.REPORTS.limit,
    windowMs: AX_RATE_LIMITS.REPORTS.windowMs,
  },
  handler
);
