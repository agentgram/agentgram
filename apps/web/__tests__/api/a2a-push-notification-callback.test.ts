import { describe, expect, it } from 'vitest';
import {
  A2A_PUSH_NOTIFICATION_CALLBACK_VERIFICATION_SIGNATURE_DOMAIN,
  attestA2aPushNotificationCallbackVerification,
  generateAgentKeypair,
  signA2aAgentCard,
} from '@agentgram/auth';

const agentCard = {
  name: 'weather-agent',
  url: 'https://weather.example/a2a/jsonrpc',
  preferredTransport: 'JSONRPC',
  capabilities: { streaming: true, pushNotifications: true },
  skills: [{ id: 'forecast', name: 'Forecast weather' }],
};

const callbackUrl = 'https://weather.example/a2a/push/callback';
const subscriptionTransitions = [
  {
    action: 'create',
    subscriptionId: 'push-sub-1',
    callbackUrl,
    occurredAt: '2026-08-26T00:00:00.000Z',
  },
  {
    action: 'delete',
    subscriptionId: 'push-sub-1',
    callbackUrl,
    occurredAt: '2026-08-26T00:05:00.000Z',
  },
];
const failedDelivery = {
  status: 'failed',
  subscriptionId: 'push-sub-1',
  callbackUrl,
  statusCode: 502,
  error: 'upstream timeout with private host detail',
};

function makeRequest(body: Record<string, unknown>) {
  return new Request(
    'http://localhost/api/v1/a2a/agent-card/push-notification-callback',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  ) as unknown as import('next/server').NextRequest;
}

describe('A2A push-notification callback verification receipt', () => {
  it('binds HTTPS callback ownership, subscription transitions, and failed delivery to a signed Agent Card', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const signature = await signA2aAgentCard(secretKey, agentCard);

    const verdict = await attestA2aPushNotificationCallbackVerification({
      agentCard,
      publicKey,
      signature,
      callbackUrl,
      subscriptionTransitions,
      failedDelivery,
      now: new Date('2026-08-26T00:06:00.000Z'),
    });

    expect(verdict.ok).toBe(true);
    if (!verdict.ok) {
      throw new Error(verdict.message);
    }
    expect(verdict.receipt).toMatchObject({
      kind: 'agentgram.a2a.push-notification.callback-verification-receipt',
      generatedAt: '2026-08-26T00:06:00.000Z',
      agentCardUrl: 'https://weather.example/a2a/jsonrpc',
      callbackUrl,
      callback: {
        https: true,
        ownershipPolicy: 'same-origin-agent-card-url',
        ownership: 'verified',
        reasons: [],
      },
      subscription: {
        createObserved: true,
        deleteObserved: true,
        reasons: [],
      },
      failedDelivery: {
        observed: true,
        subscriptionId: 'push-sub-1',
        statusCode: 502,
        reasons: [],
      },
      receipt: {
        status: 'verified',
        signingAlgorithm: 'ed25519',
        signatureDomain: A2A_PUSH_NOTIFICATION_CALLBACK_VERIFICATION_SIGNATURE_DOMAIN,
        publicKey,
      },
    });
    expect(verdict.receipt.signedAgentCardPayloadDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(verdict.receipt.failedDelivery.errorDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(verdict.receipt.receipt.payloadDigest).toMatch(/^[0-9a-f]{64}$/);
  });

  it('fails closed when the callback is HTTPS but not owned by the signed Agent Card origin', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const signature = await signA2aAgentCard(secretKey, agentCard);

    const verdict = await attestA2aPushNotificationCallbackVerification({
      agentCard,
      publicKey,
      signature,
      callbackUrl: 'https://callback.evil.example/a2a/push/callback',
      subscriptionTransitions: subscriptionTransitions.map((transition) => ({
        ...transition,
        callbackUrl: 'https://callback.evil.example/a2a/push/callback',
      })),
      failedDelivery: {
        ...failedDelivery,
        callbackUrl: 'https://callback.evil.example/a2a/push/callback',
      },
    });

    expect(verdict.ok).toBe(false);
    if (verdict.ok) {
      throw new Error('expected callback ownership failure');
    }
    expect(verdict.code).toBe('CALLBACK_VERIFICATION_FAILED');
    expect(verdict.receipt?.callback).toMatchObject({
      ownership: 'failed',
      reasons: ['callbackUrl origin must match signed Agent Card url origin'],
    });
  });

  it('publishes the receipt through the public route without leaking raw delivery errors', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const signature = await signA2aAgentCard(secretKey, agentCard);
    const { POST } = await import(
      '@/app/api/v1/a2a/agent-card/push-notification-callback/route'
    );

    const response = await POST(
      makeRequest({
        agentCard,
        publicKey,
        signature,
        callbackUrl,
        subscriptionTransitions,
        failedDelivery,
      })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.reportType).toBe(
      'a2a-push-notification-callback-verification'
    );
    expect(json.data.receipt.failedDelivery.errorDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(json)).not.toContain('private host detail');
  });
});
