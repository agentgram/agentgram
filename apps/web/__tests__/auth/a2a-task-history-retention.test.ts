import { describe, expect, it } from 'vitest';
import {
  A2A_TASK_HISTORY_RETENTION_SIGNATURE_DOMAIN,
  attestA2aTaskHistoryRetention,
  buildA2aTaskHistoryRetentionPayload,
  buildA2aTaskHistoryRetentionVerifierFixture,
  generateAgentKeypair,
  signA2aAgentCard,
  signA2aTaskHistoryRetentionAttestation,
} from '@agentgram/auth/src/ed25519';

describe('A2A task-history retention attestation', () => {
  const agentCard = {
    name: 'weather-agent',
    url: 'https://weather.example/a2a/jsonrpc',
    capabilities: { streaming: true },
  };
  const returnedHistory = [
    { id: 'event-1', role: 'user', parts: [{ text: 'forecast?' }] },
    { id: 'event-2', role: 'agent', parts: [{ text: 'sunny' }] },
  ];

  it('publishes a deterministic verifier fixture for external clients', async () => {
    const fixture = await buildA2aTaskHistoryRetentionVerifierFixture();

    expect(fixture.name).toBe('a2a-task-history-retention-requested-vs-returned');
    expect(fixture.payload).toMatchObject({
      kind: 'agentgram.a2a.task-history.retention-attestation-payload',
      requestedHistoryLength: 5,
      returnedHistoryLength: 3,
      truncationReason: 'server-retention-policy',
    });
    expect(fixture.canonicalJson).toContain('requestedHistoryLength');
    expect(fixture.digest).toMatch(/^[a-f0-9]{64}$/);
  });

  it('signs requested versus returned history length, versions, and truncation reason', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const agentCardSignature = await signA2aAgentCard(secretKey, agentCard);
    const retentionInput = {
      taskId: 'task-weather-42',
      taskVersion: 'task-v7',
      cardVersion: 'card-v3',
      requestedHistoryLength: 5,
      returnedHistory,
      truncationReason: 'server-retention-policy',
    };
    const retentionSignature = await signA2aTaskHistoryRetentionAttestation(
      secretKey,
      retentionInput
    );

    const verdict = await attestA2aTaskHistoryRetention({
      agentCard,
      publicKey,
      signature: agentCardSignature,
      ...retentionInput,
      retentionSignature,
      now: new Date('2026-08-24T00:00:00.000Z'),
    });

    expect(verdict.ok).toBe(true);
    if (verdict.ok) {
      expect(verdict.retention).toMatchObject({
        kind: 'agentgram.a2a.task-history.retention-attestation',
        generatedAt: '2026-08-24T00:00:00.000Z',
        taskId: 'task-weather-42',
        taskVersion: 'task-v7',
        cardVersion: 'card-v3',
        request: { requestedHistoryLength: 5 },
        response: {
          returnedHistoryLength: 2,
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
          signatureDomain: A2A_TASK_HISTORY_RETENTION_SIGNATURE_DOMAIN,
          publicKey,
        },
      });
      expect(verdict.retention.response.returnedHistoryDigest).toMatch(/^[a-f0-9]{64}$/);
      expect(verdict.retention.signature.payloadDigest).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  it('detects non-reproducible audit trails when truncated history omits a reason', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const agentCardSignature = await signA2aAgentCard(secretKey, agentCard);
    const retentionInput = {
      taskId: 'task-weather-42',
      taskVersion: 'task-v7',
      cardVersion: 'card-v3',
      requestedHistoryLength: 5,
      returnedHistory,
    };
    const retentionSignature = await signA2aTaskHistoryRetentionAttestation(
      secretKey,
      retentionInput
    );

    await expect(
      attestA2aTaskHistoryRetention({
        agentCard,
        publicKey,
        signature: agentCardSignature,
        ...retentionInput,
        retentionSignature,
      })
    ).resolves.toMatchObject({
      ok: false,
      code: 'TASK_HISTORY_RETENTION_NON_REPRODUCIBLE',
      retention: {
        retention: {
          status: 'non-reproducible',
          requestedVsReturned: 'truncated',
          reasons: ['truncated history requires an explicit truncation reason'],
        },
      },
    });
  });

  it('rejects retention signatures replayed across task/card versions or history bodies', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const agentCardSignature = await signA2aAgentCard(secretKey, agentCard);
    const retentionSignature = await signA2aTaskHistoryRetentionAttestation(
      secretKey,
      {
        taskId: 'task-weather-42',
        taskVersion: 'task-v7',
        cardVersion: 'card-v3',
        requestedHistoryLength: 2,
        returnedHistory,
      }
    );

    await expect(
      attestA2aTaskHistoryRetention({
        agentCard,
        publicKey,
        signature: agentCardSignature,
        taskId: 'task-weather-42',
        taskVersion: 'task-v8',
        cardVersion: 'card-v3',
        requestedHistoryLength: 2,
        returnedHistory,
        retentionSignature,
      })
    ).resolves.toMatchObject({
      ok: false,
      code: 'TASK_HISTORY_RETENTION_SIGNATURE_INVALID',
    });
  });

  it('builds the same signable payload independent of object key order inside history', async () => {
    const firstPayload = await buildA2aTaskHistoryRetentionPayload({
      taskId: 'task-weather-42',
      taskVersion: 'task-v7',
      cardVersion: 'card-v3',
      requestedHistoryLength: 1,
      returnedHistory: [{ id: 'event-1', role: 'agent' }],
    });
    const secondPayload = await buildA2aTaskHistoryRetentionPayload({
      taskId: 'task-weather-42',
      taskVersion: 'task-v7',
      cardVersion: 'card-v3',
      requestedHistoryLength: 1,
      returnedHistory: [{ role: 'agent', id: 'event-1' }],
    });

    expect(secondPayload).toEqual(firstPayload);
  });
});
