import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetDeveloperPlan = vi.fn();
const mockSweepMcpRegistryCoverage = vi.fn();

vi.mock('@agentgram/auth', () => ({
  withRateLimit: (_config: unknown, handler: unknown) => handler,
}));

vi.mock('@/lib/auth/developer', () => ({
  withDeveloperAuth: (handler: unknown) => handler,
}));

vi.mock('@/lib/ax-score/usage', () => ({
  getDeveloperPlan: mockGetDeveloperPlan,
}));

vi.mock('@/lib/ax-score/mcp-registry-audit', () => ({
  sweepMcpRegistryCoverage: mockSweepMcpRegistryCoverage,
}));

function makeRequest(
  body: Record<string, unknown> = {},
  headers: Record<string, string> = { 'x-developer-id': 'dev-1' }
) {
  return new Request('http://localhost/api/v1/ax-score/mcp-registry/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  }) as unknown as import('next/server').NextRequest;
}

describe('POST /api/v1/ax-score/mcp-registry/audit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDeveloperPlan.mockResolvedValue('team');
    mockSweepMcpRegistryCoverage.mockResolvedValue({
      summary: {
        totalEntries: 2,
        uniqueServerVersions: 2,
        uniqueServerNames: 1,
        remoteTransportEntries: 2,
        remoteTransportCoveragePct: 100,
        latestMarkedNames: 1,
        schemaCompatibleEntries: 2,
        schemaCompatibilityPct: 100,
      },
      pageChain: [
        {
          index: 0,
          cursor: null,
          nextCursor: null,
          count: 2,
          digest: 'page-digest',
        },
      ],
      anomalies: {
        duplicateServerVersions: [],
        missingLatestMarkers: [],
        missingRemoteTransports: [],
        cursorLoops: [],
        emptyPagesWithCursor: [],
        schemaCompatibilityFailures: [],
        truncated: false,
      },
      receipt: {
        kind: 'agentgram.ax-score.mcp-registry.coverage-receipt',
        registryEndpoint: 'https://registry.modelcontextprotocol.io/v0/servers',
        generatedAt: '2026-08-04T00:00:00.000Z',
        digestAlgorithm: 'sha256',
        coverageDigest: 'coverage-digest',
        pageChainDigest: 'page-chain-digest',
        pageCount: 1,
        serverVersionCount: 2,
        uniqueServerVersionCount: 2,
        anomalyCount: 0,
        x402: {
          status: 'ready',
          paymentPurpose: 'mcp-registry-coverage-audit-report',
          recommendedPriceUsd: '49.00',
          deliverable: 'Full nextCursor sweep digest.',
        },
        signature: {
          status: 'unsigned',
          signingAlgorithm: 'ed25519',
          payloadDigest: 'payload-digest',
        },
      },
    });
  });

  it('requires an authenticated developer id', async () => {
    const { POST } = await import(
      '@/app/api/v1/ax-score/mcp-registry/audit/route'
    );

    const response = await POST(makeRequest({}, {}));
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error.code).toBe('UNAUTHORIZED');
    expect(mockSweepMcpRegistryCoverage).not.toHaveBeenCalled();
  });

  it('gates the paid coverage receipt package to billing-report plans', async () => {
    mockGetDeveloperPlan.mockResolvedValueOnce('starter');
    const { POST } = await import(
      '@/app/api/v1/ax-score/mcp-registry/audit/route'
    );

    const response = await POST(makeRequest());
    const json = await response.json();

    expect(response.status).toBe(402);
    expect(json.error.code).toBe('AX_PRO_REQUIRED');
    expect(json.error.message).toContain('Pro, Team, and Enterprise');
    expect(mockSweepMcpRegistryCoverage).not.toHaveBeenCalled();
  });

  it('returns an x402-ready registry coverage audit package', async () => {
    const { POST } = await import(
      '@/app/api/v1/ax-score/mcp-registry/audit/route'
    );

    const response = await POST(makeRequest({ limit: 50, maxPages: 3 }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockSweepMcpRegistryCoverage).toHaveBeenCalledWith({
      limit: 50,
      maxPages: 3,
      cursor: null,
      reportType: 'mcp-registry-coverage-audit',
    });
    expect(json.data).toMatchObject({
      developerId: 'dev-1',
      plan: 'team',
      reportType: 'mcp-registry-coverage-audit',
      payment: {
        status: 'ready',
        paymentPurpose: 'mcp-registry-coverage-audit-report',
      },
      audit: {
        receipt: {
          kind: 'agentgram.ax-score.mcp-registry.coverage-receipt',
          signature: {
            signingAlgorithm: 'ed25519',
          },
        },
      },
    });
  });

  it('passes through the paid MCP schema compatibility audit report type', async () => {
    mockSweepMcpRegistryCoverage.mockResolvedValueOnce({
      summary: {
        totalEntries: 2,
        uniqueServerVersions: 2,
        uniqueServerNames: 2,
        remoteTransportEntries: 1,
        remoteTransportCoveragePct: 50,
        latestMarkedNames: 2,
        schemaCompatibleEntries: 1,
        schemaCompatibilityPct: 50,
      },
      pageChain: [],
      anomalies: {
        duplicateServerVersions: [],
        missingLatestMarkers: [],
        missingRemoteTransports: ['bad/server@0.1.0'],
        cursorLoops: [],
        emptyPagesWithCursor: [],
        schemaCompatibilityFailures: [
          'bad/server@0.1.0: missing MCP launch surface (https remote or package)',
        ],
        truncated: false,
      },
      receipt: {
        kind: 'agentgram.ax-score.mcp-registry.schema-compatibility-receipt',
        registryEndpoint: 'https://registry.modelcontextprotocol.io/v0/servers',
        generatedAt: '2026-08-04T00:00:00.000Z',
        digestAlgorithm: 'sha256',
        coverageDigest: 'coverage-digest',
        pageChainDigest: 'page-chain-digest',
        pageCount: 1,
        serverVersionCount: 2,
        uniqueServerVersionCount: 2,
        anomalyCount: 1,
        x402: {
          status: 'ready',
          paymentPurpose: 'mcp-schema-compatibility-audit-report',
          recommendedPriceUsd: '79.00',
          deliverable: 'MCP Registry schema compatibility findings.',
        },
        signature: {
          status: 'unsigned',
          signingAlgorithm: 'ed25519',
          payloadDigest: 'payload-digest',
        },
      },
    });
    const { POST } = await import(
      '@/app/api/v1/ax-score/mcp-registry/audit/route'
    );

    const response = await POST(
      makeRequest({ reportType: 'mcp-schema-compatibility-audit', limit: 25 })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mockSweepMcpRegistryCoverage).toHaveBeenCalledWith({
      limit: 25,
      cursor: null,
      reportType: 'mcp-schema-compatibility-audit',
    });
    expect(json.data).toMatchObject({
      plan: 'team',
      reportType: 'mcp-schema-compatibility-audit',
      payment: {
        status: 'ready',
        paymentPurpose: 'mcp-schema-compatibility-audit-report',
      },
    });
  });
});
