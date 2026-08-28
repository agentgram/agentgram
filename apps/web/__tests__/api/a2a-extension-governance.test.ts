import { describe, expect, it } from 'vitest';
import {
  attestA2aAgentCardExtensionGovernance,
  generateAgentKeypair,
  signA2aAgentCard,
} from '@agentgram/auth';

const promotedDigest = 'a'.repeat(64);

const agentCard = {
  name: 'weather-agent',
  url: 'https://weather.example/a2a/jsonrpc',
  preferredTransport: 'JSONRPC',
  extensions: [
    {
      uri: 'https://a2a.example/extensions/weather-alerts',
      version: '1.2.0',
      required: true,
    },
    {
      uri: 'https://vendor.example/extensions/beta-radar',
      version: '0.9.0',
      required: false,
    },
  ],
};

describe('A2A Agent Card extension governance provenance attestation', () => {
  it('binds every extension URI/version to spec provenance, governance tier, observation time, and support policy', async () => {
    const keypair = await generateAgentKeypair();
    const signature = await signA2aAgentCard(keypair.secretKey, agentCard);

    const verdict = await attestA2aAgentCardExtensionGovernance({
      agentCard,
      publicKey: keypair.publicKey,
      signature,
      governanceRegistry: [
        {
          extensionUri: 'https://a2a.example/extensions/weather-alerts',
          version: '1.2.0',
          canonicalSpecUrl: 'https://a2a.example/spec/extensions/weather-alerts/1.2.0',
          canonicalSpecDigest: promotedDigest,
          promotionTier: 'promoted',
          observedAt: '2026-08-20T00:00:00.000Z',
          supportPolicyVerdict: 'supported',
        },
        {
          extensionUri: 'https://vendor.example/extensions/beta-radar',
          version: '0.9.0',
          canonicalSpecUrl: 'https://vendor.example/spec/beta-radar',
          canonicalSpecDigest: 'b'.repeat(64),
          promotionTier: 'experimental',
          observedAt: '2026-08-20T00:00:00.000Z',
          supportPolicyVerdict: 'unpromoted',
        },
      ],
      now: new Date('2026-08-20T00:05:00.000Z'),
    });

    expect(verdict.ok).toBe(false);
    if (verdict.ok) {
      throw new Error('expected unpromoted extension to lower discovery confidence');
    }
    expect(verdict.code).toBe('EXTENSION_GOVERNANCE_CONFIDENCE_LOWERED');
    expect(verdict.governance).toMatchObject({
      kind: 'agentgram.a2a.agent-card.extension-governance-provenance-attestation',
      generatedAt: '2026-08-20T00:05:00.000Z',
      signedAgentCardPayloadDigest: expect.stringMatching(/^[0-9a-f]{64}$/),
      extensionCount: 2,
      supportedCount: 1,
      loweredCount: 1,
      probes: [
        {
          extensionUri: 'https://a2a.example/extensions/weather-alerts',
          version: '1.2.0',
          required: true,
          canonicalSpecUrl: 'https://a2a.example/spec/extensions/weather-alerts/1.2.0',
          canonicalSpecDigest: promotedDigest,
          promotionTier: 'promoted',
          observedAt: '2026-08-20T00:00:00.000Z',
          supportPolicyVerdict: 'supported',
          discoveryConfidence: { status: 'full', score: 1, reasons: [] },
        },
        {
          extensionUri: 'https://vendor.example/extensions/beta-radar',
          version: '0.9.0',
          required: false,
          promotionTier: 'experimental',
          supportPolicyVerdict: 'unpromoted',
          discoveryConfidence: {
            status: 'lowered',
            score: 0.5,
            reasons: [
              'extension is not promoted into a stable governance tier',
              'extension support policy verdict is unpromoted',
            ],
          },
        },
      ],
      verdict: {
        status: 'lowered-confidence',
        reasons: [
          'extension https://vendor.example/extensions/beta-radar@0.9.0: extension is not promoted into a stable governance tier',
          'extension https://vendor.example/extensions/beta-radar@0.9.0: extension support policy verdict is unpromoted',
        ],
      },
      signature: {
        status: 'verified',
        signingAlgorithm: 'ed25519',
        signatureDomain: 'agentgram:v1:a2a-extension-governance:',
        publicKey: keypair.publicKey,
        payloadDigest: expect.stringMatching(/^[0-9a-f]{64}$/),
      },
    });
  });

  it('fails closed and lowers required discovery confidence for unknown or retired extensions', async () => {
    const keypair = await generateAgentKeypair();
    const riskyCard = {
      ...agentCard,
      extensions: [
        {
          uri: 'https://vendor.example/extensions/retired-required',
          version: '2.0.0',
          required: true,
        },
        {
          uri: 'https://unknown.example/ext/custom',
          version: '0.1.0',
          required: true,
        },
      ],
    };
    const signature = await signA2aAgentCard(keypair.secretKey, riskyCard);

    const verdict = await attestA2aAgentCardExtensionGovernance({
      agentCard: riskyCard,
      publicKey: keypair.publicKey,
      signature,
      governanceRegistry: [
        {
          extensionUri: 'https://vendor.example/extensions/retired-required',
          version: '2.0.0',
          canonicalSpecUrl: 'https://vendor.example/spec/retired-required',
          canonicalSpecDigest: 'c'.repeat(64),
          promotionTier: 'retired',
          observedAt: '2026-08-20T00:00:00.000Z',
          supportPolicyVerdict: 'retired',
        },
      ],
      now: new Date('2026-08-20T00:05:00.000Z'),
    });

    expect(verdict.ok).toBe(false);
    if (verdict.ok) {
      throw new Error('expected retired and unknown required extensions to fail closed');
    }
    expect(verdict.code).toBe('EXTENSION_GOVERNANCE_UNSUPPORTED');
    expect(verdict.governance?.requiredUnsupportedCount).toBe(2);
    expect(verdict.governance?.probes.map((probe) => probe.supportPolicyVerdict)).toEqual([
      'retired',
      'unknown',
    ]);
    expect(verdict.governance?.verdict.status).toBe('unsupported-required');
    expect(verdict.governance?.probes.every((probe) => probe.discoveryConfidence.status === 'lowered')).toBe(true);
  });
});
