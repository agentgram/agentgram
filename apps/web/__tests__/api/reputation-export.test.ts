import { createHash } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  canonicalJson,
  generateAgentKeypair,
  signRequest,
  NONCE_HEADER,
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
} from '@agentgram/auth';

const mockAgentSingle = vi.fn();
const mockAgentEq = vi.fn();
const mockAgentSelect = vi.fn();
const mockTrustEventsOrder = vi.fn();
const mockTrustEventsEq = vi.fn();
const mockTrustEventsSelect = vi.fn();
const mockFrom = vi.fn();

vi.mock('@agentgram/db', () => ({
  getSupabaseServiceClient: () => ({ from: mockFrom }),
}));

vi.mock('@agentgram/auth', async () => {
  const actual =
    await vi.importActual<typeof import('@agentgram/auth')>('@agentgram/auth');

  return {
    ...actual,
    withAuth: (handler: unknown) => handler,
  };
});

const routePath = '/api/v1/agents/me/reputation-export';

function sha256Hex(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

async function makeSignedRequest() {
  const { publicKey, secretKey } = await generateAgentKeypair();
  const timestamp = String(Date.now());
  const nonce = 'nonce-reputation-1';
  const signature = await signRequest(secretKey, {
    method: 'GET',
    path: routePath,
    timestamp,
    nonce,
    body: '',
  });

  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://supabase.local');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-key');
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/rest/v1/agents')) {
        return Response.json([{ public_key: publicKey }]);
      }
      if (
        url.includes('/rest/v1/agent_request_signature_nonces') &&
        init?.method === 'DELETE'
      ) {
        return new Response(null, { status: 204 });
      }
      if (
        url.includes('/rest/v1/agent_request_signature_nonces') &&
        init?.method === 'POST'
      ) {
        return new Response(null, { status: 201 });
      }
      return new Response(null, { status: 500 });
    })
  );

  return new Request(`http://localhost${routePath}`, {
    method: 'GET',
    headers: {
      'x-agent-id': 'agent-1',
      [SIGNATURE_HEADER]: signature,
      [TIMESTAMP_HEADER]: timestamp,
      [NONCE_HEADER]: nonce,
    },
  }) as unknown as import('next/server').NextRequest;
}

function makeUnsignedRequest() {
  return new Request(`http://localhost${routePath}`, {
    method: 'GET',
    headers: { 'x-agent-id': 'agent-1' },
  }) as unknown as import('next/server').NextRequest;
}

describe('GET /api/v1/agents/me/reputation-export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();

    mockAgentSingle.mockResolvedValue({
      data: {
        id: 'agent-1',
        name: 'sage-bot',
        display_name: 'Sage Bot',
        public_key: 'registered-public-key',
        verification_state: 'verified',
        status: 'active',
        trust_score: 0.73,
        axp: 42,
        updated_at: '2026-08-03T00:00:00.000Z',
      },
      error: null,
    });
    mockAgentEq.mockReturnValue({ single: mockAgentSingle });
    mockAgentSelect.mockReturnValue({ eq: mockAgentEq });

    mockTrustEventsOrder.mockResolvedValue({
      data: [
        {
          id: 'event-1',
          delta: 0.2,
          reason: 'operator_verified',
          reference_id: '11111111-1111-1111-1111-111111111111',
          created_at: '2026-08-01T00:00:00.000Z',
        },
        {
          id: 'event-2',
          delta: 0.03,
          reason: 'external_registry_receipt',
          reference_id: '22222222-2222-2222-2222-222222222222',
          created_at: '2026-08-02T00:00:00.000Z',
        },
      ],
      error: null,
    });
    mockTrustEventsEq.mockReturnValue({ order: mockTrustEventsOrder });
    mockTrustEventsSelect.mockReturnValue({ eq: mockTrustEventsEq });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'agents') return { select: mockAgentSelect };
      if (table === 'trust_events') return { select: mockTrustEventsSelect };
      return {};
    });
  });

  it('requires the Ed25519 signed verifier gate before exporting reputation evidence', async () => {
    const { GET } =
      await import('@/app/api/v1/agents/me/reputation-export/route');

    const response = await GET(makeUnsignedRequest());
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('SIGNATURE_REQUIRED');
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('preserves storage state and trust-event evidence as separate ERC-8004 export sections', async () => {
    const { GET } =
      await import('@/app/api/v1/agents/me/reputation-export/route');

    const response = await GET(await makeSignedRequest());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.standard).toBe('ERC-8004');
    expect(json.data.subject).toEqual(
      expect.objectContaining({
        agentId: 'agent-1',
        name: 'sage-bot',
        publicKey: 'registered-public-key',
        verificationState: 'verified',
      })
    );
    expect(json.data.signedVerifierGate).toEqual(
      expect.objectContaining({
        required: true,
        verified: true,
        headers: ['X-AgentGram-Signature', 'X-AgentGram-Timestamp'],
      })
    );
    expect(json.data.storageState).toEqual(
      expect.objectContaining({ trustScore: 0.73, axp: 42 })
    );
    expect(json.data.eventEvidence).toEqual(
      expect.objectContaining({
        sourceTable: 'trust_events',
        retention: 'full_ledger',
        eventCount: 2,
        deltaSum: 0.23,
      })
    );
    expect(json.data.eventEvidence.events).toHaveLength(2);
    expect(json.data.storageEventReconciliation).toEqual(
      expect.objectContaining({
        baselineTrustScore: 0.5,
        projectedTrustScoreFromEvents: 0.73,
        storageEventDifference: 0,
        preservesStorageEventDifference: true,
      })
    );
  });

  it('adds a reproducible provenance bundle with digest, policy, tier, and canonical fixture', async () => {
    const { GET } =
      await import('@/app/api/v1/agents/me/reputation-export/route');

    const response = await GET(await makeSignedRequest());
    const json = await response.json();
    const bundle = json.data.provenanceBundle;

    expect(response.status).toBe(200);
    expect(bundle).toEqual(
      expect.objectContaining({
        kind: 'agentgram.reputation.provenance.bundle.v1',
        scoringPolicy: expect.objectContaining({
          version: 'agentgram.trust-score.policy.v1',
          baselineTrustScore: 0.5,
        }),
        validation: expect.objectContaining({
          tier: 'ed25519-verifier-gated-full-ledger',
          signingAlgorithm: 'ed25519',
          signedVerifierRequestRequired: true,
        }),
        aggregation: expect.objectContaining({
          eventCount: 2,
          firstEventAt: '2026-08-01T00:00:00.000Z',
          lastEventAt: '2026-08-02T00:00:00.000Z',
        }),
      })
    );
    expect(bundle.evidenceDigest.inputEvidenceDigest).toMatch(/^[a-f0-9]{64}$/);
    expect(sha256Hex(bundle.auditorVerification.canonicalInputEvidence)).toBe(
      bundle.evidenceDigest.inputEvidenceDigest
    );
    expect(bundle.signaturePayload).toEqual(
      expect.objectContaining({
        status: 'ed25519-signable',
        subjectAgentId: 'agent-1',
        inputEvidenceDigest: bundle.evidenceDigest.inputEvidenceDigest,
        scoringPolicyVersion: 'agentgram.trust-score.policy.v1',
        validationTier: 'ed25519-verifier-gated-full-ledger',
        payloadDigest: expect.stringMatching(/^[a-f0-9]{64}$/),
      })
    );
    expect(
      sha256Hex(bundle.auditorVerification.canonicalSignaturePayload)
    ).toBe(bundle.signaturePayload.payloadDigest);

    const canonicalInputs = JSON.parse(
      bundle.auditorVerification.canonicalInputEvidence
    );
    expect(canonicalInputs.eventEvidence.events).toHaveLength(2);
    expect(canonicalJson(canonicalInputs)).toBe(
      bundle.auditorVerification.canonicalInputEvidence
    );
  });
});
