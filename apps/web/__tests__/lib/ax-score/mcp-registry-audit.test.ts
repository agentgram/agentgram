import { describe, expect, it, vi } from 'vitest';
import { sweepMcpRegistryCoverage } from '@/lib/ax-score/mcp-registry-audit';

function registryResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('sweepMcpRegistryCoverage', () => {
  it('builds a full nextCursor page-chain digest and x402-ready receipt', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        registryResponse({
          servers: [
            {
              server: {
                name: 'acme/weather',
                version: '1.0.0',
                remotes: [{ type: 'streamable-http', url: 'https://weather.example/mcp' }],
              },
              _meta: {
                'io.modelcontextprotocol.registry/official': {
                  isLatest: false,
                },
              },
            },
          ],
          metadata: { count: 1, nextCursor: 'acme/weather:1.0.0' },
        })
      )
      .mockResolvedValueOnce(
        registryResponse({
          servers: [
            {
              server: {
                name: 'acme/weather',
                version: '1.1.0',
                remotes: [{ type: 'streamable-http', url: 'https://weather.example/mcp' }],
              },
              _meta: {
                'io.modelcontextprotocol.registry/official': {
                  isLatest: true,
                },
              },
            },
          ],
          metadata: { count: 1 },
        })
      );

    const audit = await sweepMcpRegistryCoverage({
      fetcher,
      endpoint: 'https://registry.example/v0/servers',
      limit: 1,
      generatedAt: '2026-08-04T00:00:00.000Z',
    });

    expect(fetcher).toHaveBeenNthCalledWith(
      1,
      'https://registry.example/v0/servers?limit=1'
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      2,
      'https://registry.example/v0/servers?limit=1&cursor=acme%2Fweather%3A1.0.0'
    );
    expect(audit.summary).toMatchObject({
      totalEntries: 2,
      uniqueServerVersions: 2,
      uniqueServerNames: 1,
      remoteTransportEntries: 2,
      remoteTransportCoveragePct: 100,
      latestMarkedNames: 1,
      schemaCompatibleEntries: 2,
      schemaCompatibilityPct: 100,
    });
    expect(audit.pageChain).toHaveLength(2);
    expect(audit.anomalies.duplicateServerVersions).toEqual([]);
    expect(audit.anomalies.truncated).toBe(false);
    expect(audit.receipt).toMatchObject({
      kind: 'agentgram.ax-score.mcp-registry.coverage-receipt',
      registryEndpoint: 'https://registry.example/v0/servers',
      digestAlgorithm: 'sha256',
      pageCount: 2,
      serverVersionCount: 2,
      uniqueServerVersionCount: 2,
      anomalyCount: 0,
      x402: {
        status: 'ready',
        paymentPurpose: 'mcp-registry-coverage-audit-report',
      },
      signature: {
        status: 'unsigned',
        signingAlgorithm: 'ed25519',
      },
    });
    expect(audit.receipt.coverageDigest).toMatch(/^[a-f0-9]{64}$/);
    expect(audit.receipt.signature.payloadDigest).toMatch(/^[a-f0-9]{64}$/);
  });

  it('produces a paid schema compatibility receipt and flags incompatible registry entries', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(
      registryResponse({
        servers: [
          {
            server: {
              name: 'valid/server',
              version: '1.0.0',
              remotes: [{ type: 'streamable-http', url: 'https://valid.example/mcp' }],
            },
            _meta: {
              'io.modelcontextprotocol.registry/official': {
                isLatest: true,
              },
            },
          },
          {
            server: {
              name: 'missing/launch-surface',
              version: '0.1.0',
              remotes: [{ type: 'streamable-http', url: 'http://insecure.example/mcp' }],
            },
            _meta: {
              'io.modelcontextprotocol.registry/official': {
                isLatest: true,
              },
            },
          },
        ],
        metadata: { count: 2 },
      })
    );

    const audit = await sweepMcpRegistryCoverage({
      fetcher,
      endpoint: 'https://registry.example/v0/servers',
      reportType: 'mcp-schema-compatibility-audit',
      generatedAt: '2026-08-04T00:00:00.000Z',
    });

    expect(audit.summary.schemaCompatibleEntries).toBe(1);
    expect(audit.summary.schemaCompatibilityPct).toBe(50);
    expect(audit.anomalies.schemaCompatibilityFailures).toEqual([
      'missing/launch-surface@0.1.0: missing MCP launch surface (https remote or package)',
    ]);
    expect(audit.receipt).toMatchObject({
      kind: 'agentgram.ax-score.mcp-registry.schema-compatibility-receipt',
      x402: {
        status: 'ready',
        paymentPurpose: 'mcp-schema-compatibility-audit-report',
        recommendedPriceUsd: '79.00',
      },
    });
  });

  it('produces a paid lifecycle chronology receipt with timestamp gap evidence', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(
      registryResponse({
        servers: [
          {
            server: {
              name: 'chrono/server',
              version: '1.0.0',
              remotes: [{ type: 'streamable-http', url: 'https://chrono.example/mcp' }],
            },
            _meta: {
              'io.modelcontextprotocol.registry/official': {
                status: 'active',
                publishedAt: '2026-08-01T00:00:00.000Z',
                updatedAt: '2026-08-03T00:00:00.000Z',
                isLatest: true,
              },
            },
          },
          {
            server: {
              name: 'chrono/server',
              version: '0.9.0',
              remotes: [{ type: 'streamable-http', url: 'https://chrono.example/mcp' }],
            },
            _meta: {
              'io.modelcontextprotocol.registry/official': {
                publishedAt: '2026-07-01T00:00:00.000Z',
                isLatest: false,
              },
            },
          },
        ],
        metadata: { count: 2 },
      })
    );

    const audit = await sweepMcpRegistryCoverage({
      fetcher,
      endpoint: 'https://registry.example/v0/servers',
      reportType: 'mcp-registry-lifecycle-chronology-audit',
      generatedAt: '2026-08-04T00:00:00.000Z',
    });

    expect(audit.summary.lifecycleChronologyEntries).toBe(2);
    expect(audit.summary.lifecycleTimestampCoveragePct).toBe(50);
    expect([
      audit.lifecycleChronology[0].id,
      audit.lifecycleChronology[1].id,
    ]).toEqual([
      'chrono/server@0.9.0',
      'chrono/server@1.0.0',
    ]);
    expect(audit.lifecycleChronology[0]).toMatchObject({
      status: null,
      publishedAt: '2026-07-01T00:00:00.000Z',
      updatedAt: null,
      isLatest: false,
    });
    expect(audit.lifecycleChronology[0].eventDigest).toMatch(/^[a-f0-9]{64}$/);
    expect(audit.anomalies.lifecycleChronologyGaps).toEqual([
      'chrono/server@0.9.0: missing lifecycle status',
      'chrono/server@0.9.0: missing updatedAt',
    ]);
    expect(audit.receipt).toMatchObject({
      kind: 'agentgram.ax-score.mcp-registry.lifecycle-chronology-receipt',
      anomalyCount: 2,
      x402: {
        status: 'ready',
        paymentPurpose: 'mcp-registry-lifecycle-chronology-audit-report',
        recommendedPriceUsd: '99.00',
      },
      signature: {
        status: 'unsigned',
        signingAlgorithm: 'ed25519',
      },
    });
  });

  it('reports duplicate, remote-coverage, latest-marker, and cursor anomalies', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        registryResponse({
          servers: [
            { server: { name: 'loop/server', version: '1.0.0', remotes: [] } },
            { server: { name: 'loop/server', version: '1.0.0', remotes: [] } },
          ],
          metadata: { count: 2, nextCursor: 'cursor-a' },
        })
      )
      .mockResolvedValueOnce(
        registryResponse({
          servers: [],
          metadata: { count: 0, nextCursor: 'cursor-a' },
        })
      );

    const audit = await sweepMcpRegistryCoverage({
      fetcher,
      endpoint: 'https://registry.example/v0/servers',
      limit: 2,
      generatedAt: '2026-08-04T00:00:00.000Z',
    });

    expect(audit.summary.remoteTransportCoveragePct).toBe(0);
    expect(audit.anomalies.duplicateServerVersions).toEqual([
      'loop/server@1.0.0',
    ]);
    expect(audit.anomalies.missingRemoteTransports).toEqual([
      'loop/server@1.0.0',
      'loop/server@1.0.0',
    ]);
    expect(audit.anomalies.missingLatestMarkers).toEqual(['loop/server']);
    expect(audit.anomalies.emptyPagesWithCursor).toEqual(['cursor-a']);
    expect(audit.anomalies.cursorLoops).toEqual(['cursor-a']);
    expect(audit.anomalies.schemaCompatibilityFailures).toEqual([
      'loop/server@1.0.0: missing MCP launch surface (https remote or package)',
      'loop/server@1.0.0: missing MCP launch surface (https remote or package)',
    ]);
    expect(audit.receipt.anomalyCount).toBe(8);
  });

  it('marks a sweep as truncated when maxPages stops before registry exhaustion', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(
      registryResponse({
        servers: [
          {
            server: {
              name: 'paged/server',
              version: '1.0.0',
              remotes: [{ type: 'streamable-http', url: 'https://paged.example/mcp' }],
            },
            _meta: {
              'io.modelcontextprotocol.registry/official': {
                isLatest: true,
              },
            },
          },
        ],
        metadata: { count: 1, nextCursor: 'next-page' },
      })
    );

    const audit = await sweepMcpRegistryCoverage({
      fetcher,
      endpoint: 'https://registry.example/v0/servers',
      maxPages: 1,
      generatedAt: '2026-08-04T00:00:00.000Z',
    });

    expect(audit.pageChain).toHaveLength(1);
    expect(audit.anomalies.truncated).toBe(true);
    expect(audit.receipt.anomalyCount).toBe(1);
  });
});
