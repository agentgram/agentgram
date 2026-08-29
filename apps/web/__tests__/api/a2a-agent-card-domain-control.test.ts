import { describe, expect, it } from 'vitest';
import {
  attestA2aAgentCardDomainControl,
  generateAgentKeypair,
  signA2aAgentCard,
} from '@agentgram/auth';

const agentCard = {
  name: 'weather-agent',
  url: 'https://weather.example/a2a/jsonrpc',
  preferredTransport: 'JSONRPC',
  provider: {
    organization: 'Weather Example',
    url: 'https://weather.example/provider',
  },
  documentationUrl: 'https://weather.example/docs/a2a',
  skills: [{ id: 'forecast', name: 'Forecast weather' }],
};

describe('A2A Agent Card provider/documentation domain-control attestation', () => {
  it('binds provider and documentation canonical origins to the signed Agent Card digest', async () => {
    const keypair = await generateAgentKeypair();
    const signature = await signA2aAgentCard(keypair.secretKey, agentCard);

    const verdict = await attestA2aAgentCardDomainControl({
      agentCardUrl: 'https://weather.example/.well-known/agent-card.json',
      agentCard,
      publicKey: keypair.publicKey,
      signature,
      originObservations: [
        {
          target: 'provider-url',
          requestedUrl: 'https://weather.example/provider',
          finalUrl: 'https://weather.example/provider',
          tlsVerified: true,
          domainControlVerified: true,
        },
        {
          target: 'documentation-url',
          requestedUrl: 'https://weather.example/docs/a2a',
          finalUrl: 'https://weather.example/docs/a2a',
          tlsVerified: true,
          domainControlVerified: true,
        },
      ],
      now: new Date('2026-08-23T00:00:00.000Z'),
    });

    expect(verdict.ok).toBe(true);
    if (!verdict.ok) {
      throw new Error(verdict.message);
    }
    expect(verdict.domainControl).toMatchObject({
      kind: 'agentgram.a2a.agent-card.provider-documentation-domain-control-attestation',
      generatedAt: '2026-08-23T00:00:00.000Z',
      agentCardUrl: 'https://weather.example/.well-known/agent-card.json',
      agentCardOrigin: 'https://weather.example',
      canonicalOrigins: ['https://weather.example'],
      probeCount: 2,
      verifiedCount: 2,
      redirectedCount: 0,
      mismatchedCount: 0,
      missingCount: 0,
      verdict: { status: 'verified', reasons: [] },
      signature: {
        status: 'verified',
        signingAlgorithm: 'ed25519',
        publicKey: keypair.publicKey,
      },
    });
    expect(verdict.domainControl.signedAgentCardPayloadDigest).toMatch(
      /^[0-9a-f]{64}$/
    );
    expect(verdict.domainControl.signature.payloadDigest).toMatch(
      /^[0-9a-f]{64}$/
    );
    expect(verdict.domainControl.probes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          target: 'provider-url',
          canonicalOrigin: 'https://weather.example',
          externalDiscoveryMismatch: false,
          status: 'verified',
        }),
        expect.objectContaining({
          target: 'documentation-url',
          canonicalOrigin: 'https://weather.example',
          externalDiscoveryMismatch: false,
          status: 'verified',
        }),
      ])
    );
  });

  it('fails closed when provider/doc origins redirect away from the signed Card origin', async () => {
    const keypair = await generateAgentKeypair();
    const signature = await signA2aAgentCard(keypair.secretKey, agentCard);

    const verdict = await attestA2aAgentCardDomainControl({
      agentCardUrl: 'https://weather.example/.well-known/agent-card.json',
      agentCard,
      publicKey: keypair.publicKey,
      signature,
      originObservations: [
        {
          target: 'provider-url',
          requestedUrl: 'https://weather.example/provider',
          finalUrl: 'https://provider-cdn.example/provider',
          tlsVerified: true,
          domainControlVerified: true,
        },
        {
          target: 'documentation-url',
          requestedUrl: 'https://weather.example/docs/a2a',
          finalUrl: 'https://docs.vendor.example/a2a',
          tlsVerified: false,
          domainControlVerified: false,
        },
      ],
      now: new Date('2026-08-23T00:00:00.000Z'),
    });

    expect(verdict.ok).toBe(false);
    if (verdict.ok) {
      throw new Error(
        'expected provider/documentation origin mismatch to fail'
      );
    }
    expect(verdict.code).toBe('EXTERNAL_DISCOVERY_MISMATCH');
    expect(verdict.domainControl?.verdict.status).toBe(
      'external-discovery-mismatch'
    );
    expect(verdict.domainControl?.mismatchedCount).toBe(2);
    expect(verdict.domainControl?.probes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          target: 'provider-url',
          canonicalOrigin: 'https://provider-cdn.example',
          externalDiscoveryMismatch: true,
          status: 'mismatched',
        }),
        expect.objectContaining({
          target: 'documentation-url',
          canonicalOrigin: 'https://docs.vendor.example',
          tlsVerified: false,
          domainControlVerified: false,
          externalDiscoveryMismatch: true,
          status: 'mismatched',
        }),
      ])
    );
    expect(verdict.domainControl?.verdict.reasons).toEqual(
      expect.arrayContaining([
        'provider-url canonical origin https://provider-cdn.example does not match Agent Card origin https://weather.example',
        'documentation-url TLS chain was not verified',
        'documentation-url domain-control proof was not verified',
      ])
    );
  });

  it('rejects non-HTTPS provider or documentation targets before omitting them from the digest', async () => {
    const keypair = await generateAgentKeypair();
    const insecureProviderCard = {
      ...agentCard,
      provider: {
        organization: 'Weather Example',
        url: 'http://weather.example/provider',
      },
    };
    const signature = await signA2aAgentCard(
      keypair.secretKey,
      insecureProviderCard
    );

    const verdict = await attestA2aAgentCardDomainControl({
      agentCardUrl: 'https://weather.example/.well-known/agent-card.json',
      agentCard: insecureProviderCard,
      publicKey: keypair.publicKey,
      signature,
      originObservations: [
        {
          target: 'documentation-url',
          requestedUrl: 'https://weather.example/docs/a2a',
          finalUrl: 'https://weather.example/docs/a2a',
          tlsVerified: true,
          domainControlVerified: true,
        },
      ],
    });

    expect(verdict.ok).toBe(false);
    if (verdict.ok) {
      throw new Error('expected non-HTTPS provider URL to fail');
    }
    expect(verdict.code).toBe('DOMAIN_CONTROL_METADATA_INVALID');
    expect(verdict.message).toBe(
      'A2A provider.url must be HTTPS for domain-control attestation'
    );
  });
});
