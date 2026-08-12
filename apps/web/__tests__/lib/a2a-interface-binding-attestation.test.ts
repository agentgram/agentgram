import { describe, expect, it, vi } from 'vitest';
import { buildA2aInterfaceBindingAttestation } from '@/lib/a2a/interface-binding-attestation';

describe('A2A interface binding attestation', () => {
  it('probes signed interface bindings and records card-diff evidence', async () => {
    const fetcher = vi.fn(async () => new Response(null, { status: 204 }));

    const report = await buildA2aInterfaceBindingAttestation({
      generatedAt: '2026-08-10T00:00:00.000Z',
      signatureVerified: true,
      signaturePayloadDigest: 'a'.repeat(64),
      previousAgentCard: {
        interfaces: [
          {
            id: 'json-rpc',
            url: 'https://agent.example/a2a/v0',
            transport: 'jsonrpc',
            version: '0.9.0',
            securityScheme: 'bearer',
          },
        ],
      },
      agentCard: {
        name: 'weather-agent',
        interfaces: [
          {
            id: 'json-rpc',
            url: 'https://agent.example/a2a/v1',
            transport: 'jsonrpc',
            version: '1.0.0',
            securityScheme: 'bearer',
          },
        ],
      },
      fetcher,
    });

    expect(fetcher).toHaveBeenCalledWith('https://agent.example/a2a/v1', {
      method: 'HEAD',
    });
    expect(report.summary).toMatchObject({
      interfaceCount: 1,
      reachableInterfaces: 1,
      axPenaltyApplied: false,
    });
    expect(report.interfaceProbes[0]).toMatchObject({
      id: 'json-rpc',
      probeStatus: 'reachable',
      httpStatus: 204,
      schemeMatchesUrl: true,
    });
    expect(report.cardDiff.status).toBe('changed');
    expect(report.cardDiff.changedBindings).toEqual([
      'added json-rpc https://agent.example/a2a/v1|jsonrpc|1.0.0|bearer',
      'removed json-rpc https://agent.example/a2a/v0|jsonrpc|0.9.0|bearer',
    ]);
    expect(report.receipt.signatureVerification).toMatchObject({
      status: 'verified',
      signingAlgorithm: 'ed25519',
      payloadDigest: 'a'.repeat(64),
    });
    expect(report.receipt.signature.payloadDigest).toMatch(/^[a-f0-9]{64}$/);
  });

  it('penalizes missing declarations, unreachable URLs, and security mismatches', async () => {
    const fetcher = vi.fn(async () => new Response(null, { status: 503 }));

    const report = await buildA2aInterfaceBindingAttestation({
      generatedAt: '2026-08-10T00:00:00.000Z',
      signatureVerified: false,
      agentCard: {
        interfaces: [
          {
            id: 'sse',
            url: 'http://agent.example/a2a',
            transport: 'sse',
            version: '1.0.0',
            securityScheme: 'bearer',
          },
          {
            id: 'broken',
            url: 'not a url',
            transport: 'jsonrpc',
            version: '1.0.0',
            securityScheme: 'bearer',
          },
        ],
      },
      fetcher,
    });

    expect(report.axEvidence.status).toBe('penalized');
    expect(report.anomalies).toMatchObject({
      invalidInterfaceUrls: ['broken'],
      unreachableInterfaces: ['sse'],
      securitySchemeMismatches: ['broken', 'sse'],
      unsignedOrUnverifiedCard: true,
    });
    expect(report.axEvidence.penaltyReasons).toEqual(
      expect.arrayContaining([
        'broken has an invalid URL',
        'sse is unreachable',
        'sse has an HTTPS/security-scheme mismatch',
        'Agent Card signature was not verified',
      ])
    );
  });
});
