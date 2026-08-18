import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockVerifyA2aAgentCardSignature = vi.fn();
const mockAttestA2aAgentCardTransportBindingParity = vi.fn();
const mockAttestErc8004RevisionPolicyDrift = vi.fn();
const mockBuildA2aAgentCardCanonicalSignatureEvidence = vi.fn();

vi.mock('@agentgram/auth', () => ({
  withRateLimit: (_config: unknown, handler: unknown) => handler,
  buildA2aAgentCardCanonicalSignatureEvidence:
    mockBuildA2aAgentCardCanonicalSignatureEvidence,
  attestA2aAgentCardTransportBindingParity:
    mockAttestA2aAgentCardTransportBindingParity,
  attestErc8004RevisionPolicyDrift: mockAttestErc8004RevisionPolicyDrift,
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

  it('exports a transport-binding parity verdict for a signed multi-binding Agent Card', async () => {
    const parity = {
      kind: 'agentgram.a2a.agent-card.transport-binding-parity',
      signedAgentCardPayloadDigest: 'a'.repeat(64),
      status: 'equivalent',
      bindingCount: 2,
      probes: [
        {
          bindingId: 'primary',
          transport: 'JSONRPC',
          url: 'https://weather.example/a2a/jsonrpc',
          taskSemanticsDigest: 'b'.repeat(64),
          authBehaviorDigest: 'c'.repeat(64),
        },
        {
          bindingId: 'additionalInterfaces[0]',
          transport: 'GRPC',
          url: 'https://weather.example/a2a/grpc',
          taskSemanticsDigest: 'b'.repeat(64),
          authBehaviorDigest: 'c'.repeat(64),
        },
      ],
      divergences: [],
    };
    mockAttestA2aAgentCardTransportBindingParity.mockResolvedValueOnce({
      ok: true,
      parity,
      signature: { ok: true },
    });
    const { POST } = await import(
      '@/app/api/v1/a2a/agent-card/transport-binding-parity/route'
    );

    const response = await POST(
      makeRequest({
        publicKey: 'b'.repeat(64),
        jws: 'protected.payload.signature',
        agentCard: { name: 'weather-agent' },
      })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mockAttestA2aAgentCardTransportBindingParity).toHaveBeenCalledWith({
      publicKey: 'b'.repeat(64),
      signature: undefined,
      jws: 'protected.payload.signature',
      agentCard: { name: 'weather-agent' },
    });
    expect(json.data.reportType).toBe(
      'a2a-agent-card-transport-binding-parity'
    );
    expect(json.data.parity).toEqual(parity);
  });

  it('fails closed when a transport binding changes task semantics or auth behavior', async () => {
    const parity = {
      kind: 'agentgram.a2a.agent-card.transport-binding-parity',
      signedAgentCardPayloadDigest: 'a'.repeat(64),
      status: 'diverged',
      bindingCount: 2,
      probes: [],
      divergences: [
        {
          bindingId: 'additionalInterfaces[0]',
          kind: 'task-semantics',
          expectedDigest: 'b'.repeat(64),
          actualDigest: 'd'.repeat(64),
        },
      ],
    };
    mockAttestA2aAgentCardTransportBindingParity.mockResolvedValueOnce({
      ok: false,
      code: 'BINDING_PARITY_DIVERGED',
      message:
        'A2A Agent Card transport bindings diverge on task semantics or authentication behavior',
      parity,
      signature: { ok: true },
    });
    const { POST } = await import(
      '@/app/api/v1/a2a/agent-card/transport-binding-parity/route'
    );

    const response = await POST(
      makeRequest({
        publicKey: 'b'.repeat(64),
        jws: 'protected.payload.signature',
        agentCard: { name: 'weather-agent' },
      })
    );
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error.code).toBe('BINDING_PARITY_DIVERGED');
    expect(json.error.details.parity).toEqual(parity);
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

  it('accepts compact JWS material without leaking the protected header', async () => {
    mockVerifyA2aAgentCardSignature.mockResolvedValueOnce({
      ok: true,
      canonicalJson: '{"name":"weather-agent"}',
      payloadDigest: 'd'.repeat(64),
      jwsProtectedHeader: {
        alg: 'EdDSA',
        kid: 'b'.repeat(64),
        crit: ['agentgram-rfc8785'],
        'agentgram-rfc8785': true,
      },
      evidence: mockBuildA2aAgentCardCanonicalSignatureEvidence(),
    });
    const { POST } = await import(
      '@/app/api/v1/a2a/agent-card/canonical-signature/route'
    );

    const response = await POST(
      makeRequest({
        publicKey: 'b'.repeat(64),
        jws: 'protected.payload.signature',
        agentCard: { name: 'weather-agent' },
      })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mockVerifyA2aAgentCardSignature).toHaveBeenCalledWith({
      publicKey: 'b'.repeat(64),
      signature: undefined,
      jws: 'protected.payload.signature',
      agentCard: { name: 'weather-agent' },
    });
    expect(json.data.verdict).toMatchObject({
      ok: true,
      payloadDigest: 'd'.repeat(64),
    });
    expect(json.data.verdict.jwsProtectedHeader).toBeUndefined();
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

  it('exports an ERC-8004 revision-policy drift report when revisions cover policy changes', async () => {
    const report = {
      kind: 'agentgram.erc8004.revision-policy-drift-gate',
      standard: 'ERC-8004',
      revision: { previous: 1, current: 2 },
      policyDigestChanged: true,
      requiredRevisionIncrementObserved: true,
      policyDeltaReasonPresent: true,
      status: 'revision-policy-clean',
    };
    mockAttestErc8004RevisionPolicyDrift.mockResolvedValueOnce({
      ok: true,
      report,
    });
    const { POST } = await import(
      '@/app/api/v1/erc-8004/revision-policy-drift/route'
    );

    const response = await POST(
      makeRequest({
        previousRegistration: { revision: 1 },
        currentRegistration: { revision: 2 },
      })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mockAttestErc8004RevisionPolicyDrift).toHaveBeenCalledWith({
      previousRegistration: { revision: 1 },
      currentRegistration: { revision: 2 },
      policyFields: undefined,
    });
    expect(json.data.reportType).toBe('erc-8004-revision-policy-drift');
    expect(json.data.report).toEqual(report);
  });

  it('fails closed when the ERC-8004 revision-policy drift gate reports drift', async () => {
    const report = {
      kind: 'agentgram.erc8004.revision-policy-drift-gate',
      standard: 'ERC-8004',
      revision: { previous: 1, current: 1 },
      policyFieldsChanged: ['services'],
      requiredRevisionIncrementObserved: false,
      policyDeltaReasonPresent: false,
      status: 'policy-drift',
    };
    mockAttestErc8004RevisionPolicyDrift.mockResolvedValueOnce({
      ok: false,
      code: 'REVISION_POLICY_DRIFT',
      message:
        'ERC-8004 registration policy fields changed without a revision increment and policyDeltaReason',
      report,
    });
    const { POST } = await import(
      '@/app/api/v1/erc-8004/revision-policy-drift/route'
    );

    const response = await POST(
      makeRequest({
        previousRegistration: { revision: 1 },
        currentRegistration: { revision: 1 },
      })
    );
    const json = await response.json();

    expect(response.status).toBe(422);
    expect(json.error.code).toBe('REVISION_POLICY_DRIFT');
    expect(json.error.details.report).toEqual(report);
  });
});
