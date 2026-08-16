import { describe, expect, it } from 'vitest';
import {
  A2A_AGENT_CARD_SIGNATURE_DOMAIN,
  A2A_AGENT_CARD_JWS_ALGORITHM,
  RFC8785_AGENT_CARD_FIXTURE_CANONICAL_JSON,
  RFC8785_AGENT_CARD_FIXTURE_DIGEST,
  buildA2aAgentCardCanonicalSignatureEvidence,
  canonicalJson,
  generateAgentKeypair,
  signA2aAgentCard,
  signA2aAgentCardJws,
  verifyA2aAgentCardSignature,
} from '@agentgram/auth/src/ed25519';

describe('A2A Agent Card canonical signature gate', () => {
  function encodeJwsPart(value: string): string {
    return Buffer.from(value, 'utf8').toString('base64url');
  }

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

  it('verifies compact JWS cards only when the protected header and RFC8785 payload are bound', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const agentCard = {
      name: 'weather-agent',
      url: 'https://weather.example/.well-known/agent.json',
      capabilities: { streaming: true, pushNotifications: false },
      skills: [{ id: 'forecast', name: 'Forecast' }],
    };
    const jws = await signA2aAgentCardJws(secretKey, publicKey, agentCard);

    const verdict = await verifyA2aAgentCardSignature({
      publicKey,
      agentCard: {
        skills: [{ name: 'Forecast', id: 'forecast' }],
        capabilities: { pushNotifications: false, streaming: true },
        name: 'weather-agent',
        url: 'https://weather.example/.well-known/agent.json',
      },
      jws,
    });

    expect(verdict.ok).toBe(true);
    if (verdict.ok) {
      expect(verdict.jwsProtectedHeader).toMatchObject({
        alg: A2A_AGENT_CARD_JWS_ALGORITHM,
        kid: publicKey,
        crit: ['agentgram-rfc8785'],
        'agentgram-rfc8785': true,
      });
      expect(verdict.payloadDigest).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  it('rejects algorithm confusion, unknown critical headers, kid mismatch, and detached-card substitution', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const agentCard = { name: 'weather-agent', url: 'https://weather.example' };

    await expect(
      signA2aAgentCardJws(secretKey, publicKey, agentCard, { alg: 'none' })
    ).rejects.toThrow('A2A Agent Card JWS alg must be EdDSA');

    await expect(
      signA2aAgentCardJws(secretKey, publicKey, agentCard, {
        crit: ['agentgram-rfc8785', 'unknown-critical'],
        'unknown-critical': true,
      })
    ).rejects.toThrow('Unsupported A2A Agent Card JWS critical header');

    const algorithmConfusionJws = [
      encodeJwsPart(JSON.stringify({ alg: 'none', kid: publicKey })),
      encodeJwsPart(canonicalJson(agentCard)),
      encodeJwsPart('unsigned'),
    ].join('.');
    await expect(
      verifyA2aAgentCardSignature({
        publicKey,
        agentCard,
        jws: algorithmConfusionJws,
      })
    ).resolves.toMatchObject({
      ok: false,
      code: 'SIGNATURE_INVALID',
      message:
        'A2A Agent Card JWS protected header must allowlist EdDSA, public-key kid, and known critical headers',
    });

    const unknownCriticalHeaderJws = [
      encodeJwsPart(
        JSON.stringify({
          alg: 'EdDSA',
          kid: publicKey,
          crit: ['unknown-critical'],
          'unknown-critical': true,
        })
      ),
      encodeJwsPart(canonicalJson(agentCard)),
      encodeJwsPart('signature'),
    ].join('.');
    await expect(
      verifyA2aAgentCardSignature({
        publicKey,
        agentCard,
        jws: unknownCriticalHeaderJws,
      })
    ).resolves.toMatchObject({
      ok: false,
      code: 'SIGNATURE_INVALID',
      message:
        'A2A Agent Card JWS protected header must allowlist EdDSA, public-key kid, and known critical headers',
    });

    const kidMismatchJws = await signA2aAgentCardJws(
      secretKey,
      'a'.repeat(64),
      agentCard
    );
    await expect(
      verifyA2aAgentCardSignature({ publicKey, agentCard, jws: kidMismatchJws })
    ).resolves.toMatchObject({
      ok: false,
      code: 'SIGNATURE_INVALID',
      message: 'A2A Agent Card JWS kid must match the supplied public key',
    });

    const substitutedCardJws = await signA2aAgentCardJws(
      secretKey,
      publicKey,
      agentCard
    );
    await expect(
      verifyA2aAgentCardSignature({
        publicKey,
        jws: substitutedCardJws,
        agentCard: { ...agentCard, url: 'https://evil.example' },
      })
    ).resolves.toMatchObject({
      ok: false,
      code: 'SIGNATURE_INVALID',
      message:
        'A2A Agent Card JWS payload must equal the supplied RFC8785 canonical Agent Card',
    });
  });
});
