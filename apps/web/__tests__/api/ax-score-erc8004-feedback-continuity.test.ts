import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetDeveloperPlan = vi.fn();

vi.mock('@agentgram/auth', async () => {
  const actual = await vi.importActual<typeof import('@agentgram/auth')>(
    '@agentgram/auth'
  );

  return {
    ...actual,
    withRateLimit: (_config: unknown, handler: unknown) => handler,
  };
});

vi.mock('@/lib/auth/developer', () => ({
  withDeveloperAuth: (handler: unknown) => handler,
}));

vi.mock('@/lib/ax-score/usage', () => ({
  getDeveloperPlan: mockGetDeveloperPlan,
}));

function makeRequest(
  body: Record<string, unknown> = {},
  headers: Record<string, string> = { 'x-developer-id': 'dev-1' }
) {
  return new Request(
    'http://localhost/api/v1/ax-score/erc-8004/feedback-continuity',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    }
  ) as unknown as import('next/server').NextRequest;
}

describe('POST /api/v1/ax-score/erc-8004/feedback-continuity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDeveloperPlan.mockResolvedValue('team');
  });

  it('requires a paid AX billing-report plan', async () => {
    mockGetDeveloperPlan.mockResolvedValueOnce('free');
    const { POST } = await import(
      '@/app/api/v1/ax-score/erc-8004/feedback-continuity/route'
    );

    const response = await POST(makeRequest());
    const json = await response.json();

    expect(response.status).toBe(402);
    expect(json.error.code).toBe('AX_PRO_REQUIRED');
    expect(json.error.message).toContain('ERC-8004 feedback-index continuity');
  });

  it('returns an Ed25519-signable paid verifier receipt for continuous reviewer feedback indexes', async () => {
    const { POST } = await import(
      '@/app/api/v1/ax-score/erc-8004/feedback-continuity/route'
    );

    const response = await POST(
      makeRequest({
        subjectAgentId: 'agent-1',
        chainId: 8453,
        registryAddress: '0x1234567890abcdef1234567890abcdef12345678',
        reviewers: [
          {
            reviewer: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            clientAddress: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
            reportedLastIndex: 3,
            feedback: [
              {
                index: 1,
                revoked: false,
                feedbackHash:
                  '0x1111111111111111111111111111111111111111111111111111111111111111',
                feedbackURI: 'ipfs://feedback-1',
              },
              {
                index: 2,
                revoked: true,
                feedbackHash:
                  '0x2222222222222222222222222222222222222222222222222222222222222222',
                feedbackURI: 'ipfs://feedback-2',
              },
              {
                index: 3,
                revoked: false,
                feedbackHash:
                  '0x3333333333333333333333333333333333333333333333333333333333333333',
                feedbackURI: 'ipfs://feedback-3',
              },
            ],
          },
        ],
      })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.reportType).toBe('erc-8004-feedback-index-continuity-audit');
    expect(json.data.payment).toEqual(
      expect.objectContaining({
        status: 'ready',
        paymentPurpose: 'erc-8004-feedback-index-continuity-audit-report',
      })
    );
    expect(json.data.audit.summary).toEqual(
      expect.objectContaining({
        reviewerCount: 1,
        completeReviewerCount: 1,
        gapCount: 0,
        duplicateIndexCount: 0,
        revokedFeedbackCount: 1,
      })
    );
    expect(json.data.audit.reviewers[0]).toEqual(
      expect.objectContaining({
        reviewer: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        complete: true,
        continuous: true,
        missingIndexes: [],
        duplicateIndexes: [],
        activeFeedbackCount: 2,
        revokedFeedbackCount: 1,
      })
    );
    expect(json.data.audit.receipt.signature).toEqual(
      expect.objectContaining({
        status: 'ed25519-signable',
        signingAlgorithm: 'ed25519',
        payloadDigest: expect.stringMatching(/^[a-f0-9]{64}$/),
      })
    );
  });

  it('surfaces gaps, duplicates, and last-index mismatches without hiding revoked feedback', async () => {
    const { POST } = await import(
      '@/app/api/v1/ax-score/erc-8004/feedback-continuity/route'
    );

    const response = await POST(
      makeRequest({
        subjectAgentId: 'agent-1',
        reviewers: [
          {
            reviewer: '0xcccccccccccccccccccccccccccccccccccccccc',
            reportedLastIndex: 4,
            feedback: [
              { index: 1, revoked: false },
              { index: 3, revoked: true },
              { index: 3, revoked: false },
            ],
          },
        ],
      })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.audit.summary).toEqual(
      expect.objectContaining({
        completeReviewerCount: 0,
        gapCount: 2,
        duplicateIndexCount: 1,
        lastIndexMismatchCount: 1,
        revokedFeedbackCount: 1,
      })
    );
    expect(json.data.audit.reviewers[0]).toEqual(
      expect.objectContaining({
        complete: false,
        continuous: false,
        missingIndexes: [2, 4],
        duplicateIndexes: [3],
        maxObservedIndex: 3,
        reportedLastIndex: 4,
      })
    );
  });
});
