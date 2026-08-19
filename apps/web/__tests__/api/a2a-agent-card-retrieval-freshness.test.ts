import { describe, expect, it } from 'vitest';
import {
  attestA2aAgentCardRetrievalFreshness,
  generateAgentKeypair,
  signA2aAgentCard,
} from '@agentgram/auth';

const agentCard = {
  name: 'weather-agent',
  url: 'https://weather.example/a2a/jsonrpc',
  preferredTransport: 'JSONRPC',
  skills: [{ id: 'forecast', name: 'Forecast weather' }],
};

describe('A2A Agent Card retrieval freshness evidence', () => {
  it('binds retrieval validators to a verified signed Agent Card payload digest', async () => {
    const keypair = await generateAgentKeypair();
    const signature = await signA2aAgentCard(keypair.secretKey, agentCard);

    const verdict = await attestA2aAgentCardRetrievalFreshness({
      agentCardUrl: 'https://weather.example/.well-known/agent-card.json',
      agentCard,
      publicKey: keypair.publicKey,
      signature,
      fetchedAt: '2026-08-17T23:59:00.000Z',
      etag: '"card-v7"',
      lastModified: 'Mon, 17 Aug 2026 23:58:00 GMT',
      cacheControl: 'public, max-age=3600',
      signatureKeyVersion: 'agent-card-ed25519-v3',
      now: new Date('2026-08-18T00:00:00.000Z'),
    });

    expect(verdict.ok).toBe(true);
    if (!verdict.ok) {
      throw new Error(verdict.message);
    }
    expect(verdict.freshness).toMatchObject({
      kind: 'agentgram.a2a.agent-card.retrieval-freshness',
      generatedAt: '2026-08-18T00:00:00.000Z',
      agentCardUrl: 'https://weather.example/.well-known/agent-card.json',
      retrieval: {
        fetchedAt: '2026-08-17T23:59:00.000Z',
        etag: '"card-v7"',
        lastModified: 'Mon, 17 Aug 2026 23:58:00 GMT',
        cacheControl: 'public, max-age=3600',
      },
      signature: {
        status: 'verified',
        signingAlgorithm: 'ed25519',
        publicKey: keypair.publicKey,
        keyVersion: 'agent-card-ed25519-v3',
      },
      freshness: {
        status: 'fresh',
        staleCacheVerdict: 'accept',
        fetchAgeSeconds: 60,
        cacheMaxAgeSeconds: 3600,
        lastModifiedAgeSeconds: 120,
        validators: { etag: true, lastModified: true },
        reasons: [],
      },
    });
    expect(verdict.freshness.signedAgentCardPayloadDigest).toMatch(/^[0-9a-f]{64}$/);
  });

  it('rejects valid signatures when retrieval evidence has exceeded cache max-age', async () => {
    const keypair = await generateAgentKeypair();
    const signature = await signA2aAgentCard(keypair.secretKey, agentCard);

    const verdict = await attestA2aAgentCardRetrievalFreshness({
      agentCardUrl: 'https://weather.example/.well-known/agent-card.json',
      agentCard,
      publicKey: keypair.publicKey,
      signature,
      fetchedAt: '2026-08-17T23:00:00.000Z',
      etag: '"card-v7"',
      cacheControl: 'public, max-age=300',
      now: new Date('2026-08-18T00:00:00.000Z'),
    });

    expect(verdict.ok).toBe(false);
    if (verdict.ok) {
      throw new Error('expected stale retrieval evidence to fail');
    }
    expect(verdict.code).toBe('AGENT_CARD_STALE');
    expect(verdict.freshness?.freshness).toMatchObject({
      status: 'stale',
      staleCacheVerdict: 'reject',
      fetchAgeSeconds: 3600,
      cacheMaxAgeSeconds: 300,
      reasons: ['retrieval evidence exceeds Cache-Control max-age'],
    });
  });
});
