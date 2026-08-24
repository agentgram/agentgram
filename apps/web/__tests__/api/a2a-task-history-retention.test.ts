import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAttestA2aTaskHistoryRetention = vi.fn();
const mockBuildA2aTaskHistoryRetentionVerifierFixture = vi.fn();

vi.mock('@agentgram/auth', () => ({
  withRateLimit: (_config: unknown, handler: unknown) => handler,
  attestA2aTaskHistoryRetention: mockAttestA2aTaskHistoryRetention,
  buildA2aTaskHistoryRetentionVerifierFixture:
    mockBuildA2aTaskHistoryRetentionVerifierFixture,
}));

function makeRequest(body: Record<string, unknown>) {
  return new Request(
    'http://localhost/api/v1/a2a/agent-card/task-history-retention',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  ) as unknown as import('next/server').NextRequest;
}

describe('A2A task-history retention route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildA2aTaskHistoryRetentionVerifierFixture.mockResolvedValue({
      name: 'a2a-task-history-retention-requested-vs-returned',
      canonicalJson: '{"kind":"agentgram.a2a.task-history.retention-attestation-payload"}',
      digestAlgorithm: 'sha256',
      digest: 'f'.repeat(64),
      payload: {
        kind: 'agentgram.a2a.task-history.retention-attestation-payload',
        taskId: 'task-weather-42',
        taskVersion: 'task-v7',
        cardVersion: 'card-v3',
        requestedHistoryLength: 5,
        returnedHistoryLength: 3,
        returnedHistoryDigest: 'a'.repeat(64),
        truncationReason: 'server-retention-policy',
      },
    });
  });

  it('publishes the public verifier fixture', async () => {
    const { GET } = await import(
      '@/app/api/v1/a2a/agent-card/task-history-retention/route'
    );

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.reportType).toBe(
      'a2a-task-history-retention-attestation-fixture'
    );
    expect(json.data.verifierFixture.digest).toMatch(/^[a-f0-9]{64}$/);
  });

  it('exports signed requested-vs-returned retention evidence', async () => {
    const retention = {
      kind: 'agentgram.a2a.task-history.retention-attestation',
      generatedAt: '2026-08-24T00:00:00.000Z',
      signedAgentCardPayloadDigest: 'a'.repeat(64),
      taskId: 'task-weather-42',
      taskVersion: 'task-v7',
      cardVersion: 'card-v3',
      request: { requestedHistoryLength: 5 },
      response: {
        returnedHistoryLength: 3,
        returnedHistoryDigest: 'b'.repeat(64),
        truncated: true,
        truncationReason: 'server-retention-policy',
      },
      retention: {
        status: 'truncated',
        requestedVsReturned: 'truncated',
        reasons: [],
      },
      signature: {
        status: 'verified',
        signingAlgorithm: 'ed25519',
        signatureDomain: 'agentgram:v1:a2a-task-history-retention:',
        publicKey: 'c'.repeat(64),
        payloadDigest: 'd'.repeat(64),
        verifierFixture: { digest: 'f'.repeat(64) },
      },
    };
    mockAttestA2aTaskHistoryRetention.mockResolvedValueOnce({
      ok: true,
      retention,
      signature: { ok: true },
    });
    const { POST } = await import(
      '@/app/api/v1/a2a/agent-card/task-history-retention/route'
    );

    const response = await POST(
      makeRequest({
        publicKey: 'c'.repeat(64),
        signature: 'e'.repeat(128),
        agentCard: { name: 'weather-agent' },
        taskId: 'task-weather-42',
        taskVersion: 'task-v7',
        cardVersion: 'card-v3',
        requestedHistoryLength: 5,
        returnedHistory: [{ id: 'event-1' }, { id: 'event-2' }, { id: 'event-3' }],
        truncationReason: 'server-retention-policy',
        retentionSignature: 'f'.repeat(128),
      })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mockAttestA2aTaskHistoryRetention).toHaveBeenCalledWith({
      publicKey: 'c'.repeat(64),
      signature: 'e'.repeat(128),
      jws: undefined,
      agentCard: { name: 'weather-agent' },
      taskId: 'task-weather-42',
      taskVersion: 'task-v7',
      cardVersion: 'card-v3',
      requestedHistoryLength: 5,
      returnedHistory: [{ id: 'event-1' }, { id: 'event-2' }, { id: 'event-3' }],
      truncationReason: 'server-retention-policy',
      retentionSignature: 'f'.repeat(128),
    });
    expect(json.data.reportType).toBe('a2a-task-history-retention-attestation');
    expect(json.data.retention).toEqual(retention);
  });

  it('fails closed when the returned history is not reproducible', async () => {
    const retention = {
      kind: 'agentgram.a2a.task-history.retention-attestation',
      retention: {
        status: 'non-reproducible',
        reasons: ['truncated history requires an explicit truncation reason'],
      },
    };
    mockAttestA2aTaskHistoryRetention.mockResolvedValueOnce({
      ok: false,
      code: 'TASK_HISTORY_RETENTION_NON_REPRODUCIBLE',
      message:
        'A2A task-history retention attestation is non-reproducible from requested versus returned history metadata',
      retention,
      signature: { ok: true },
    });
    const { POST } = await import(
      '@/app/api/v1/a2a/agent-card/task-history-retention/route'
    );

    const response = await POST(
      makeRequest({
        publicKey: 'c'.repeat(64),
        signature: 'e'.repeat(128),
        agentCard: { name: 'weather-agent' },
        taskId: 'task-weather-42',
        taskVersion: 'task-v7',
        cardVersion: 'card-v3',
        requestedHistoryLength: 5,
        returnedHistory: [{ id: 'event-1' }],
        retentionSignature: 'f'.repeat(128),
      })
    );
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json.error.code).toBe('TASK_HISTORY_RETENTION_NON_REPRODUCIBLE');
    expect(json.error.details.retention.retention.status).toBe('non-reproducible');
  });
});
