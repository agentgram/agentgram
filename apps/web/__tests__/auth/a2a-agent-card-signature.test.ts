import { describe, expect, it } from 'vitest';
import {
  A2A_AGENT_CARD_SIGNATURE_DOMAIN,
  A2A_AGENT_CARD_JWS_ALGORITHM,
  RFC8785_AGENT_CARD_FIXTURE_CANONICAL_JSON,
  RFC8785_AGENT_CARD_FIXTURE_DIGEST,
  attestA2aExtendedAgentCardAuthorizationDowngrade,
  attestA2aAgentCardTransportBindingParity,
  attestA2aSecurityRequirementSatisfiability,
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

  it('attests parity for identical semantics and auth across declared transport bindings', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const agentCard = {
      name: 'weather-agent',
      url: 'https://weather.example/a2a/jsonrpc',
      preferredTransport: 'JSONRPC',
      capabilities: { streaming: true, pushNotifications: false },
      skills: [{ id: 'forecast', name: 'Forecast' }],
      securitySchemes: { apiKey: { type: 'apiKey', in: 'header' } },
      security: [{ apiKey: [] }],
      additionalInterfaces: [
        { url: 'https://weather.example/a2a/grpc', transport: 'GRPC' },
      ],
    };
    const jws = await signA2aAgentCardJws(secretKey, publicKey, agentCard);

    const verdict = await attestA2aAgentCardTransportBindingParity({
      publicKey,
      jws,
      agentCard,
    });

    expect(verdict.ok).toBe(true);
    if (verdict.ok) {
      expect(verdict.parity.status).toBe('equivalent');
      expect(verdict.parity.bindingCount).toBe(2);
      expect(verdict.parity.probes).toHaveLength(2);
      expect(verdict.parity.divergences).toEqual([]);
      expect(verdict.parity.probes[0]?.taskSemanticsDigest).toBe(
        verdict.parity.probes[1]?.taskSemanticsDigest
      );
      expect(verdict.parity.probes[0]?.authBehaviorDigest).toBe(
        verdict.parity.probes[1]?.authBehaviorDigest
      );
    }
  });

  it('fails closed when a signed Agent Card binding diverges on semantics or auth behavior', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const agentCard = {
      name: 'weather-agent',
      url: 'https://weather.example/a2a/jsonrpc',
      preferredTransport: 'JSONRPC',
      capabilities: { streaming: true, pushNotifications: false },
      skills: [{ id: 'forecast', name: 'Forecast' }],
      securitySchemes: { apiKey: { type: 'apiKey', in: 'header' } },
      security: [{ apiKey: [] }],
      additionalInterfaces: [
        {
          url: 'https://weather.example/a2a/grpc',
          transport: 'GRPC',
          capabilities: { streaming: false, pushNotifications: false },
          security: [],
        },
      ],
    };
    const jws = await signA2aAgentCardJws(secretKey, publicKey, agentCard);

    await expect(
      attestA2aAgentCardTransportBindingParity({ publicKey, jws, agentCard })
    ).resolves.toMatchObject({
      ok: false,
      code: 'BINDING_PARITY_DIVERGED',
      parity: {
        status: 'diverged',
        bindingCount: 2,
        divergences: [
          { bindingId: 'additionalInterfaces[0]', kind: 'task-semantics' },
          { bindingId: 'additionalInterfaces[0]', kind: 'auth-behavior' },
        ],
      },
    });
  });

  it('attests Agent Card and skill security requirements are satisfiable from declared schemes', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const agentCard = {
      name: 'weather-agent',
      url: 'https://weather.example/a2a/jsonrpc',
      securitySchemes: {
        apiKey: {
          apiKeySecurityScheme: { location: 'header', name: 'X-AgentGram-Key' },
        },
        weatherOAuth: {
          oauth2SecurityScheme: {
            flows: {
              clientCredentials: {
                tokenUrl: 'https://weather.example/oauth/token',
                scopes: { 'forecast.read': 'Read forecasts' },
              },
            },
          },
        },
      },
      securityRequirements: [{ apiKey: [] }],
      skills: [
        {
          id: 'forecast',
          name: 'Forecast',
          securityRequirements: [{ weatherOAuth: ['forecast.read'] }],
        },
      ],
    };
    const jws = await signA2aAgentCardJws(secretKey, publicKey, agentCard);

    const verdict = await attestA2aSecurityRequirementSatisfiability({
      publicKey,
      jws,
      agentCard,
      now: new Date('2026-08-25T00:00:00.000Z'),
    });

    expect(verdict.ok).toBe(true);
    if (verdict.ok) {
      expect(verdict.satisfiability).toMatchObject({
        kind: 'agentgram.a2a.agent-card.security-requirement-satisfiability',
        generatedAt: '2026-08-25T00:00:00.000Z',
        securitySchemeNames: ['apiKey', 'weatherOAuth'],
        requirementCount: 2,
        satisfiableRequirementCount: 2,
        unsatisfiableRequirementCount: 0,
        satisfiability: {
          status: 'satisfiable',
          publicAccessDeclared: false,
          reasons: [],
        },
      });
      expect(verdict.satisfiability.signedAgentCardPayloadDigest).toMatch(
        /^[a-f0-9]{64}$/
      );
      expect(verdict.satisfiability.signature).toMatchObject({
        status: 'verified',
        signingAlgorithm: 'ed25519',
        publicKey,
      });
      expect(verdict.satisfiability.probes).toEqual([
        {
          scope: 'agent-card',
          skillId: null,
          requirementIndex: 0,
          schemeNames: ['apiKey'],
          status: 'satisfiable',
          reasons: [],
        },
        {
          scope: 'skill',
          skillId: 'forecast',
          requirementIndex: 0,
          schemeNames: ['weatherOAuth'],
          status: 'satisfiable',
          reasons: [],
        },
      ]);
    }
  });

  it('fails closed when security requirements reference missing schemes or impossible scopes', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const agentCard = {
      name: 'weather-agent',
      url: 'https://weather.example/a2a/jsonrpc',
      securitySchemes: {
        apiKey: {
          apiKeySecurityScheme: { location: 'header', name: 'X-AgentGram-Key' },
        },
      },
      securityRequirements: [
        { apiKey: ['forecast.read'] },
        { missingOAuth: ['forecast.read'] },
      ],
    };
    const jws = await signA2aAgentCardJws(secretKey, publicKey, agentCard);

    await expect(
      attestA2aSecurityRequirementSatisfiability({ publicKey, jws, agentCard })
    ).resolves.toMatchObject({
      ok: false,
      code: 'SECURITY_REQUIREMENTS_UNSATISFIABLE',
      satisfiability: {
        satisfiability: { status: 'unsatisfiable' },
        unsatisfiableRequirementCount: 2,
        probes: [
          {
            requirementIndex: 0,
            schemeNames: ['apiKey'],
            status: 'unsatisfiable',
            reasons: [
              'security requirement "apiKey" declares scopes for a non-OAuth scheme',
            ],
          },
          {
            requirementIndex: 1,
            schemeNames: ['missingOAuth'],
            status: 'unsatisfiable',
            reasons: [
              'security requirement references missing scheme "missingOAuth"',
            ],
          },
        ],
      },
    });
  });

  it('proves Extended Agent Card capabilities are cleared after authorization downgrades', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const agentCard = {
      name: 'weather-agent',
      url: 'https://weather.example/a2a/jsonrpc',
      capabilities: { streaming: true },
      supportsAuthenticatedExtendedCard: true,
    };
    const jws = await signA2aAgentCardJws(secretKey, publicKey, agentCard);
    const disclosureDigest = 'd'.repeat(64);

    const verdict = await attestA2aExtendedAgentCardAuthorizationDowngrade({
      publicKey,
      jws,
      agentCard,
      sessionId: 'session-123',
      cardVersion: 'card-v9',
      disclosureDigest,
      now: new Date('2026-08-21T00:00:00.000Z'),
      transitions: [
        {
          phase: 'initial-public',
          authorization: 'public',
          sessionId: 'session-123',
          cardVersion: 'card-v9',
          fetchedAt: '2026-08-20T23:59:00.000Z',
          extendedCapabilities: null,
        },
        {
          phase: 'authenticated',
          authorization: 'authenticated',
          sessionId: 'session-123',
          cardVersion: 'card-v9',
          disclosureDigest,
          fetchedAt: '2026-08-21T00:00:00.000Z',
          authenticatedExtendedCard: {
            capabilities: { streaming: true, privateTools: ['billing.read'] },
          },
        },
        {
          phase: 'downgraded-public',
          authorization: 'public',
          sessionId: 'session-123',
          cardVersion: 'card-v9',
          fetchedAt: '2026-08-21T00:01:00.000Z',
          extendedCapabilities: null,
        },
      ],
    });

    expect(verdict.ok).toBe(true);
    if (verdict.ok) {
      expect(verdict.clearance).toMatchObject({
        kind: 'agentgram.a2a.extended-agent-card.authorization-downgrade-cache-clearance',
        generatedAt: '2026-08-21T00:00:00.000Z',
        sessionId: 'session-123',
        cardVersion: 'card-v9',
        disclosureDigest,
        downgrade: {
          status: 'cleared',
          authenticatedDisclosureObserved: true,
          weakenedAuthorizationObserved: true,
          reasons: [],
        },
      });
      expect(verdict.clearance.signedAgentCardPayloadDigest).toMatch(/^[a-f0-9]{64}$/);
      expect(verdict.clearance.transitions[1]?.extendedCapabilitiesDigest).toMatch(
        /^[a-f0-9]{64}$/
      );
      expect(verdict.clearance.transitions[2]).toMatchObject({
        authorization: 'public',
        disclosureDigest: null,
        extendedCapabilitiesDigest: null,
        clearedExtendedCapabilities: true,
      });
    }
  });

  it('fails closed when downgraded public retrieval retains authenticated Extended Agent Card material', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const agentCard = {
      name: 'weather-agent',
      url: 'https://weather.example/a2a/jsonrpc',
      supportsAuthenticatedExtendedCard: true,
    };
    const jws = await signA2aAgentCardJws(secretKey, publicKey, agentCard);
    const disclosureDigest = 'e'.repeat(64);

    await expect(
      attestA2aExtendedAgentCardAuthorizationDowngrade({
        publicKey,
        jws,
        agentCard,
        sessionId: 'session-456',
        cardVersion: 'card-v10',
        disclosureDigest,
        transitions: [
          {
            authorization: 'public',
            sessionId: 'session-456',
            cardVersion: 'card-v10',
          },
          {
            authorization: 'authenticated',
            sessionId: 'session-456',
            cardVersion: 'card-v10',
            disclosureDigest,
            extendedCapabilities: { privateTools: ['billing.read'] },
          },
          {
            authorization: 'expired',
            sessionId: 'session-456',
            cardVersion: 'card-v10',
            disclosureDigest,
            extendedCapabilities: { privateTools: ['billing.read'] },
          },
        ],
      })
    ).resolves.toMatchObject({
      ok: false,
      code: 'EXTENDED_CAPABILITIES_CACHE_LEAK',
      clearance: {
        downgrade: {
          status: 'leaked',
          reasons: [
            'transition[2] weakened retrieval retained authenticated disclosure digest',
            'transition[2] weakened retrieval retained extended capabilities',
          ],
        },
      },
    });
  });
});
