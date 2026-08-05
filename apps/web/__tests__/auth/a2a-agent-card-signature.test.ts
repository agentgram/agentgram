import { describe, expect, it } from 'vitest';
import {
  A2A_AGENT_CARD_SIGNATURE_DOMAIN,
  RFC8785_AGENT_CARD_FIXTURE_CANONICAL_JSON,
  RFC8785_AGENT_CARD_FIXTURE_DIGEST,
  buildA2aAgentCardCanonicalSignatureEvidence,
  canonicalJson,
  generateAgentKeypair,
  signA2aAgentCard,
  verifyA2aAgentCardSignature,
} from '@agentgram/auth/src/ed25519';

describe('A2A Agent Card canonical signature gate', () => {
  it('publishes the RFC8785 canonicalization fixture used by the gate', () => {
    const evidence = buildA2aAgentCardCanonicalSignatureEvidence({
      generatedAt: '2026-08-05T00:00:00.000Z',
    });

    expect(evidence.kind).toBe(
      'agentgram.a2a.agent-card.canonical-signature-gate'
    );
    expect(evidence.canonicalization.status).toBe('conformant');
    expect(evidence.canonicalization.standard).toBe('RFC8785');
    expect(evidence.canonicalization.fixture.canonicalJson).toBe(
      RFC8785_AGENT_CARD_FIXTURE_CANONICAL_JSON
    );
    expect(evidence.canonicalization.fixture.digest).toBe(
      RFC8785_AGENT_CARD_FIXTURE_DIGEST
    );
    expect(evidence.signature).toMatchObject({
      status: 'fail-closed',
      signingAlgorithm: 'ed25519',
      signatureDomain: A2A_AGENT_CARD_SIGNATURE_DOMAIN,
      unsignedCardsAccepted: false,
    });
  });

  it('verifies a signed Agent Card independent of object key order', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const card = {
      url: 'https://weather.example/.well-known/agent.json',
      name: 'weather-agent',
      capabilities: { streaming: true, pushNotifications: false },
      skills: [{ id: 'forecast', name: 'Forecast' }],
    };
    const signature = await signA2aAgentCard(secretKey, card);

    const verdict = await verifyA2aAgentCardSignature({
      publicKey,
      signature,
      agentCard: {
        skills: [{ name: 'Forecast', id: 'forecast' }],
        capabilities: { pushNotifications: false, streaming: true },
        name: 'weather-agent',
        url: 'https://weather.example/.well-known/agent.json',
      },
    });

    expect(verdict.ok).toBe(true);
    if (verdict.ok) {
      expect(verdict.payloadDigest).toMatch(/^[a-f0-9]{64}$/);
      expect(verdict.canonicalJson).toBe(canonicalJson(card));
    }
  });

  it('fails closed for unsigned, malformed, or tampered Agent Cards', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const agentCard = { name: 'weather-agent', url: 'https://weather.example' };
    const signature = await signA2aAgentCard(secretKey, agentCard);

    await expect(
      verifyA2aAgentCardSignature({ publicKey, signature: '', agentCard })
    ).resolves.toMatchObject({
      ok: false,
      code: 'SIGNATURE_INVALID',
      evidence: { signature: { status: 'fail-closed' } },
    });

    await expect(
      verifyA2aAgentCardSignature({
        publicKey,
        signature,
        agentCard: { ...agentCard, url: 'https://evil.example' },
      })
    ).resolves.toMatchObject({
      ok: false,
      code: 'SIGNATURE_INVALID',
    });
  });
});
