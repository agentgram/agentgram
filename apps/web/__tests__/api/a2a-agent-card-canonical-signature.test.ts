import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockVerifyA2aAgentCardSignature = vi.fn();
const mockBuildA2aAgentCardCanonicalSignatureEvidence = vi.fn();

vi.mock('@agentgram/auth', () => ({
  withRateLimit: (_config: unknown, handler: unknown) => handler,
  buildA2aAgentCardCanonicalSignatureEvidence:
    mockBuildA2aAgentCardCanonicalSignatureEvidence,
  verifyA2aAgentCardSignature: mockVerifyA2aAgentCardSignature,
}));

function makeRequest(body: Record<string, unknown>) {
  return new Request(
    'http://localhost/api/v1/a2a/agent-card/canonical-signature',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  ) as unknown as import('next/server').NextRequest;
}

describe('A2A Agent Card canonical signature route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildA2aAgentCardCanonicalSignatureEvidence.mockReturnValue({
      kind: 'agentgram.a2a.agent-card.canonical-signature-gate',
      generatedAt: '2026-08-05T00:00:00.000Z',
      canonicalization: {
        status: 'conformant',
        standard: 'RFC8785',
        fixture: { digest: 'fixture-digest' },
      },
      signature: {
        status: 'fail-closed',
        signingAlgorithm: 'ed25519',
        unsignedCardsAccepted: false,
      },
    });
  });

  it('publishes public canonical-signature conformance evidence', async () => {
    const { GET } = await import(
      '@/app/api/v1/a2a/agent-card/canonical-signature/route'
    );

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.reportType).toBe('a2a-agent-card-canonical-signature');
    expect(json.data.evidence.signature).toMatchObject({
      status: 'fail-closed',
      unsignedCardsAccepted: false,
    });
  });

  it('validates signed Agent Cards and returns payload digest evidence', async () => {
    mockVerifyA2aAgentCardSignature.mockResolvedValueOnce({
      ok: true,
      canonicalJson: '{"name":"weather-agent"}',
      payloadDigest: 'a'.repeat(64),
      evidence: mockBuildA2aAgentCardCanonicalSignatureEvidence(),
    });
    const { POST } = await import(
      '@/app/api/v1/a2a/agent-card/canonical-signature/route'
    );

    const response = await POST(
      makeRequest({
        publicKey: 'b'.repeat(64),
        signature: 'c'.repeat(128),
        agentCard: { name: 'weather-agent' },
      })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.verdict).toMatchObject({
      ok: true,
      payloadDigest: 'a'.repeat(64),
    });
    expect(json.data.verdict.canonicalJson).toBeUndefined();
  });

  it('fails closed when signature material is missing or invalid', async () => {
    mockVerifyA2aAgentCardSignature.mockResolvedValueOnce({
      ok: false,
      code: 'SIGNATURE_INVALID',
      message: 'A2A Agent Card signatures require publicKey, signature, and agentCard',
      evidence: mockBuildA2aAgentCardCanonicalSignatureEvidence(),
    });
    const { POST } = await import(
      '@/app/api/v1/a2a/agent-card/canonical-signature/route'
    );

    const response = await POST(makeRequest({ agentCard: { name: 'unsigned' } }));
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error.code).toBe('SIGNATURE_INVALID');
    expect(json.error.details.evidence.signature.status).toBe('fail-closed');
  });
});
