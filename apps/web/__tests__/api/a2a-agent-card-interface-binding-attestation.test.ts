import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockVerifyA2aAgentCardSignature = vi.fn();
const mockBuildA2aInterfaceBindingAttestation = vi.fn();

vi.mock('@agentgram/auth', () => ({
  withRateLimit: (_config: unknown, handler: unknown) => handler,
  verifyA2aAgentCardSignature: mockVerifyA2aAgentCardSignature,
}));

vi.mock('@/lib/a2a/interface-binding-attestation', () => ({
  buildA2aInterfaceBindingAttestation: mockBuildA2aInterfaceBindingAttestation,
}));

function makeRequest(body: Record<string, unknown>) {
  return new Request(
    'http://localhost/api/v1/a2a/agent-card/interface-binding-attestation',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  ) as unknown as import('next/server').NextRequest;
}

describe('A2A Agent Card interface-binding attestation route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildA2aInterfaceBindingAttestation.mockResolvedValue({
      kind: 'agentgram.a2a.interface-binding-attestation',
      generatedAt: '2026-08-10T00:00:00.000Z',
      summary: {
        interfaceCount: 1,
        reachableInterfaces: 1,
        mismatchedBindings: 0,
        axPenaltyApplied: false,
      },
      interfaceProbes: [
        {
          id: 'json-rpc',
          url: 'https://agent.example/a2a',
          transport: 'jsonrpc',
          version: '1.0.0',
          securityScheme: 'bearer',
          probeStatus: 'reachable',
          httpStatus: 200,
          schemeMatchesUrl: true,
          evidence: 'interface probe returned HTTP 200',
        },
      ],
      receipt: {
        kind: 'agentgram.a2a.interface-binding-attestation-receipt',
        digestAlgorithm: 'sha256',
        signatureVerification: {
          status: 'verified',
          signingAlgorithm: 'ed25519',
          payloadDigest: 'a'.repeat(64),
        },
        signature: {
          status: 'unsigned',
          signingAlgorithm: 'ed25519',
          payloadDigest: 'b'.repeat(64),
        },
      },
    });
  });

  it('rejects unsigned Agent Cards before probing interfaces', async () => {
    mockVerifyA2aAgentCardSignature.mockResolvedValueOnce({
      ok: false,
      code: 'SIGNATURE_INVALID',
      message: 'A2A Agent Card signatures require publicKey, signature, and agentCard',
      evidence: { signature: { status: 'fail-closed' } },
    });
    const { POST } = await import(
      '@/app/api/v1/a2a/agent-card/interface-binding-attestation/route'
    );

    const response = await POST(makeRequest({ agentCard: { name: 'unsigned' } }));
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error.code).toBe('SIGNATURE_INVALID');
    expect(json.error.details.evidence.signature.status).toBe('fail-closed');
    expect(mockBuildA2aInterfaceBindingAttestation).not.toHaveBeenCalled();
  });

  it('returns a signed-card interface attestation report with probe evidence', async () => {
    const agentCard = {
      name: 'weather-agent',
      interfaces: [
        {
          id: 'json-rpc',
          url: 'https://agent.example/a2a',
          transport: 'jsonrpc',
          version: '1.0.0',
          securityScheme: 'bearer',
        },
      ],
    };
    const previousAgentCard = {
      ...agentCard,
      interfaces: [{ ...agentCard.interfaces[0], version: '0.9.0' }],
    };
    mockVerifyA2aAgentCardSignature.mockResolvedValueOnce({
      ok: true,
      canonicalJson: '{"name":"weather-agent"}',
      payloadDigest: 'a'.repeat(64),
      evidence: { signature: { status: 'fail-closed' } },
    });
    const { POST } = await import(
      '@/app/api/v1/a2a/agent-card/interface-binding-attestation/route'
    );

    const response = await POST(
      makeRequest({
        publicKey: 'c'.repeat(64),
        signature: 'd'.repeat(128),
        agentCard,
        previousAgentCard,
      })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockBuildA2aInterfaceBindingAttestation).toHaveBeenCalledWith({
      agentCard,
      previousAgentCard,
      signatureVerified: true,
      signaturePayloadDigest: 'a'.repeat(64),
    });
    expect(json.data).toMatchObject({
      reportType: 'a2a-interface-binding-attestation',
      verdict: {
        ok: true,
        payloadDigest: 'a'.repeat(64),
      },
      attestation: {
        summary: {
          interfaceCount: 1,
          reachableInterfaces: 1,
          axPenaltyApplied: false,
        },
        receipt: {
          signatureVerification: {
            status: 'verified',
            signingAlgorithm: 'ed25519',
          },
        },
      },
    });
  });
});
