import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockVerifyA2aAgentCardSignature = vi.fn();
const mockAttestA2aAgentCardTransportBindingParity = vi.fn();
const mockAttestA2aAgentCardRetrievalFreshness = vi.fn();
const mockAttestA2aExtendedAgentCardAuthorizationDowngrade = vi.fn();
const mockBuildA2aAgentCardCanonicalSignatureEvidence = vi.fn();

vi.mock('@agentgram/auth', () => ({
  withRateLimit: (_config: unknown, handler: unknown) => handler,
  buildA2aAgentCardCanonicalSignatureEvidence:
    mockBuildA2aAgentCardCanonicalSignatureEvidence,
  attestA2aAgentCardTransportBindingParity:
    mockAttestA2aAgentCardTransportBindingParity,
  attestA2aAgentCardRetrievalFreshness:
    mockAttestA2aAgentCardRetrievalFreshness,
  attestA2aExtendedAgentCardAuthorizationDowngrade:
    mockAttestA2aExtendedAgentCardAuthorizationDowngrade,
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

  it('exports signed retrieval freshness evidence with stale-cache metadata', async () => {
    const freshness = {
      kind: 'agentgram.a2a.agent-card.retrieval-freshness',
      generatedAt: '2026-08-18T00:00:00.000Z',
      agentCardUrl: 'https://weather.example/.well-known/agent-card.json',
      signedAgentCardPayloadDigest: 'a'.repeat(64),
      retrieval: {
        fetchedAt: '2026-08-17T23:59:00.000Z',
        etag: '"card-v7"',
        lastModified: 'Mon, 17 Aug 2026 23:58:00 GMT',
        cacheControl: 'public, max-age=3600',
      },
      signature: {
        status: 'verified',
        signingAlgorithm: 'ed25519',
        publicKey: 'b'.repeat(64),
        keyVersion: 'agent-card-ed25519-v3',
      },
      freshness: {
        status: 'fresh',
        staleCacheVerdict: 'accept',
        maxEvidenceAgeSeconds: 86400,
        fetchAgeSeconds: 60,
        cacheMaxAgeSeconds: 3600,
        lastModifiedAgeSeconds: 120,
        validators: { etag: true, lastModified: true },
        reasons: [],
      },
    };
    mockAttestA2aAgentCardRetrievalFreshness.mockResolvedValueOnce({
      ok: true,
      freshness,
      signature: { ok: true },
    });
    const { POST } = await import(
      '@/app/api/v1/a2a/agent-card/retrieval-freshness/route'
    );

    const response = await POST(
      makeRequest({
        agentCardUrl: 'https://weather.example/.well-known/agent-card.json',
        publicKey: 'b'.repeat(64),
        signature: 'c'.repeat(128),
        agentCard: { name: 'weather-agent' },
        fetchedAt: '2026-08-17T23:59:00.000Z',
        etag: '"card-v7"',
        lastModified: 'Mon, 17 Aug 2026 23:58:00 GMT',
        cacheControl: 'public, max-age=3600',
        signatureKeyVersion: 'agent-card-ed25519-v3',
      })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mockAttestA2aAgentCardRetrievalFreshness).toHaveBeenCalledWith({
      agentCardUrl: 'https://weather.example/.well-known/agent-card.json',
      publicKey: 'b'.repeat(64),
      signature: 'c'.repeat(128),
      jws: undefined,
      agentCard: { name: 'weather-agent' },
      fetchedAt: '2026-08-17T23:59:00.000Z',
      etag: '"card-v7"',
      lastModified: 'Mon, 17 Aug 2026 23:58:00 GMT',
      cacheControl: 'public, max-age=3600',
      signatureKeyVersion: 'agent-card-ed25519-v3',
    });
    expect(json.data.reportType).toBe('a2a-agent-card-retrieval-freshness');
    expect(json.data.freshness).toEqual(freshness);
  });

  it('fails closed when signed retrieval freshness evidence is stale', async () => {
    const freshness = {
      kind: 'agentgram.a2a.agent-card.retrieval-freshness',
      freshness: {
        status: 'stale',
        staleCacheVerdict: 'reject',
        reasons: ['retrieval evidence exceeds Cache-Control max-age'],
      },
    };
    mockAttestA2aAgentCardRetrievalFreshness.mockResolvedValueOnce({
      ok: false,
      code: 'AGENT_CARD_STALE',
      message:
        'A2A Agent Card retrieval evidence is stale and should not be trusted for discovery display',
      freshness,
      signature: { ok: true },
    });
    const { POST } = await import(
      '@/app/api/v1/a2a/agent-card/retrieval-freshness/route'
    );

    const response = await POST(
      makeRequest({
        agentCardUrl: 'https://weather.example/.well-known/agent-card.json',
        publicKey: 'b'.repeat(64),
        signature: 'c'.repeat(128),
        agentCard: { name: 'weather-agent' },
        fetchedAt: '2026-08-17T23:00:00.000Z',
        cacheControl: 'public, max-age=300',
      })
    );
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json.error.code).toBe('AGENT_CARD_STALE');
    expect(json.error.details.freshness.freshness.staleCacheVerdict).toBe(
      'reject'
    );
  });

  it('exports Extended Agent Card authorization-downgrade cache clearance evidence', async () => {
    const clearance = {
      kind: 'agentgram.a2a.extended-agent-card.authorization-downgrade-cache-clearance',
      generatedAt: '2026-08-21T00:00:00.000Z',
      signedAgentCardPayloadDigest: 'a'.repeat(64),
      sessionId: 'session-123',
      cardVersion: 'card-v9',
      disclosureDigest: 'd'.repeat(64),
      transitions: [],
      downgrade: {
        status: 'cleared',
        authenticatedDisclosureObserved: true,
        weakenedAuthorizationObserved: true,
        reasons: [],
      },
    };
    mockAttestA2aExtendedAgentCardAuthorizationDowngrade.mockResolvedValueOnce({
      ok: true,
      clearance,
      signature: { ok: true },
    });
    const { POST } = await import(
      '@/app/api/v1/a2a/agent-card/authorization-downgrade-cache-clearance/route'
    );

    const response = await POST(
      makeRequest({
        publicKey: 'b'.repeat(64),
        jws: 'protected.payload.signature',
        agentCard: { name: 'weather-agent' },
        sessionId: 'session-123',
        cardVersion: 'card-v9',
        disclosureDigest: 'd'.repeat(64),
        transitions: [{ authorization: 'public' }],
      })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mockAttestA2aExtendedAgentCardAuthorizationDowngrade).toHaveBeenCalledWith({
      publicKey: 'b'.repeat(64),
      signature: undefined,
      jws: 'protected.payload.signature',
      agentCard: { name: 'weather-agent' },
      sessionId: 'session-123',
      cardVersion: 'card-v9',
      disclosureDigest: 'd'.repeat(64),
      transitions: [{ authorization: 'public' }],
    });
    expect(json.data.reportType).toBe(
      'a2a-extended-agent-card-authorization-downgrade-cache-clearance'
    );
    expect(json.data.clearance).toEqual(clearance);
  });

  it('fails closed when downgraded retrieval leaks Extended Agent Card capabilities', async () => {
    const clearance = {
      kind: 'agentgram.a2a.extended-agent-card.authorization-downgrade-cache-clearance',
      downgrade: {
        status: 'leaked',
        reasons: ['transition[2] weakened retrieval retained extended capabilities'],
      },
    };
    mockAttestA2aExtendedAgentCardAuthorizationDowngrade.mockResolvedValueOnce({
      ok: false,
      code: 'EXTENDED_CAPABILITIES_CACHE_LEAK',
      message:
        'A2A Extended Agent Card cache retained authenticated capabilities after authorization weakened or expired',
      clearance,
      signature: { ok: true },
    });
    const { POST } = await import(
      '@/app/api/v1/a2a/agent-card/authorization-downgrade-cache-clearance/route'
    );

    const response = await POST(
      makeRequest({
        publicKey: 'b'.repeat(64),
        signature: 'c'.repeat(128),
        agentCard: { name: 'weather-agent' },
        sessionId: 'session-456',
        cardVersion: 'card-v10',
        disclosureDigest: 'e'.repeat(64),
        transitions: [],
      })
    );
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json.error.code).toBe('EXTENDED_CAPABILITIES_CACHE_LEAK');
    expect(json.error.details.clearance.downgrade.status).toBe('leaked');
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
});
