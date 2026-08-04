import { createHash } from 'node:crypto';

const MCP_REGISTRY_ENDPOINT = 'https://registry.modelcontextprotocol.io/v0/servers';
const DEFAULT_PAGE_LIMIT = 100;
const DEFAULT_MAX_PAGES = 100;

export interface McpRegistrySweepOptions {
  fetcher?: typeof fetch;
  endpoint?: string;
  limit?: number;
  maxPages?: number;
  cursor?: string | null;
  generatedAt?: string;
}

interface McpRegistryServerDocument {
  name?: unknown;
  version?: unknown;
  remotes?: unknown;
  packages?: unknown;
}

interface McpRegistryEntry {
  server?: McpRegistryServerDocument;
  _meta?: {
    'io.modelcontextprotocol.registry/official'?: {
      isLatest?: unknown;
      status?: unknown;
      publishedAt?: unknown;
      updatedAt?: unknown;
    };
  };
}

interface McpRegistryResponse {
  servers?: McpRegistryEntry[];
  metadata?: {
    nextCursor?: unknown;
    count?: unknown;
  };
}

export interface McpRegistryPageDigest {
  index: number;
  cursor: string | null;
  nextCursor: string | null;
  count: number;
  digest: string;
}

export interface McpRegistryCoverageAnomalies {
  duplicateServerVersions: string[];
  missingLatestMarkers: string[];
  missingRemoteTransports: string[];
  cursorLoops: string[];
  emptyPagesWithCursor: string[];
  truncated: boolean;
}

export interface McpRegistryCoverageReceipt {
  kind: 'agentgram.ax-score.mcp-registry.coverage-receipt';
  registryEndpoint: string;
  generatedAt: string;
  digestAlgorithm: 'sha256';
  coverageDigest: string;
  pageChainDigest: string;
  pageCount: number;
  serverVersionCount: number;
  uniqueServerVersionCount: number;
  anomalyCount: number;
  x402: {
    status: 'ready';
    paymentPurpose: 'mcp-registry-coverage-audit-report';
    recommendedPriceUsd: string;
    deliverable: string;
  };
  signature: {
    status: 'unsigned';
    signingAlgorithm: 'ed25519';
    payloadDigest: string;
  };
}

export interface McpRegistryCoverageAudit {
  summary: {
    totalEntries: number;
    uniqueServerVersions: number;
    uniqueServerNames: number;
    remoteTransportEntries: number;
    remoteTransportCoveragePct: number;
    latestMarkedNames: number;
  };
  pageChain: McpRegistryPageDigest[];
  anomalies: McpRegistryCoverageAnomalies;
  receipt: McpRegistryCoverageReceipt;
}

interface NormalizedServerVersion {
  id: string;
  name: string;
  version: string;
  isLatest: boolean;
  hasRemoteTransport: boolean;
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`;
}

function sha256(value: unknown): string {
  return createHash('sha256').update(stableStringify(value)).digest('hex');
}

function getString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function hasRemoteTransport(server: McpRegistryServerDocument): boolean {
  if (!Array.isArray(server.remotes)) return false;

  return server.remotes.some((remote) => {
    if (!remote || typeof remote !== 'object') return false;
    const record = remote as Record<string, unknown>;
    return typeof record.url === 'string' && record.url.startsWith('https://');
  });
}

function normalizeServer(entry: McpRegistryEntry): NormalizedServerVersion {
  const server = entry.server ?? {};
  const name = getString(server.name, 'unknown-server');
  const version = getString(server.version, 'unknown-version');
  const official = entry._meta?.['io.modelcontextprotocol.registry/official'];

  return {
    id: `${name}@${version}`,
    name,
    version,
    isLatest: official?.isLatest === true,
    hasRemoteTransport: hasRemoteTransport(server),
  };
}

function buildUrl(endpoint: string, cursor: string | null, limit: number): string {
  const url = new URL(endpoint);
  url.searchParams.set('limit', String(limit));
  if (cursor) url.searchParams.set('cursor', cursor);
  return url.toString();
}

function countAnomalies(anomalies: McpRegistryCoverageAnomalies): number {
  return (
    anomalies.duplicateServerVersions.length +
    anomalies.missingLatestMarkers.length +
    anomalies.missingRemoteTransports.length +
    anomalies.cursorLoops.length +
    anomalies.emptyPagesWithCursor.length +
    (anomalies.truncated ? 1 : 0)
  );
}

function buildReceipt(input: {
  endpoint: string;
  generatedAt: string;
  pageChain: McpRegistryPageDigest[];
  servers: NormalizedServerVersion[];
  anomalies: McpRegistryCoverageAnomalies;
}): McpRegistryCoverageReceipt {
  const pageChainDigest = sha256(input.pageChain);
  const coveragePayload = {
    endpoint: input.endpoint,
    pages: input.pageChain.map((page) => page.digest),
    servers: input.servers.map((server) => server.id).sort(),
    anomalies: input.anomalies,
  };
  const coverageDigest = sha256(coveragePayload);
  const anomalyCount = countAnomalies(input.anomalies);
  const signaturePayloadDigest = sha256({ coverageDigest, pageChainDigest });

  return {
    kind: 'agentgram.ax-score.mcp-registry.coverage-receipt',
    registryEndpoint: input.endpoint,
    generatedAt: input.generatedAt,
    digestAlgorithm: 'sha256',
    coverageDigest,
    pageChainDigest,
    pageCount: input.pageChain.length,
    serverVersionCount: input.servers.length,
    uniqueServerVersionCount: new Set(input.servers.map((server) => server.id)).size,
    anomalyCount,
    x402: {
      status: 'ready',
      paymentPurpose: 'mcp-registry-coverage-audit-report',
      recommendedPriceUsd: '49.00',
      deliverable: 'Full nextCursor sweep digest, coverage anomaly report, and Ed25519-signable receipt payload.',
    },
    signature: {
      status: 'unsigned',
      signingAlgorithm: 'ed25519',
      payloadDigest: signaturePayloadDigest,
    },
  };
}

export async function sweepMcpRegistryCoverage(
  options: McpRegistrySweepOptions = {}
): Promise<McpRegistryCoverageAudit> {
  const fetcher = options.fetcher ?? fetch;
  const endpoint = options.endpoint ?? MCP_REGISTRY_ENDPOINT;
  const limit = Math.max(1, Math.min(options.limit ?? DEFAULT_PAGE_LIMIT, 500));
  const maxPages = Math.max(1, options.maxPages ?? DEFAULT_MAX_PAGES);
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const requestedCursors = new Set<string | null>();
  const pageChain: McpRegistryPageDigest[] = [];
  const servers: NormalizedServerVersion[] = [];
  const cursorLoops: string[] = [];
  const emptyPagesWithCursor: string[] = [];
  let cursor = options.cursor ?? null;
  let truncated = false;

  for (let index = 0; index < maxPages; index += 1) {
    if (requestedCursors.has(cursor)) {
      cursorLoops.push(cursor ?? '<initial>');
      break;
    }
    requestedCursors.add(cursor);

    const response = await fetcher(buildUrl(endpoint, cursor, limit));
    if (!response.ok) {
      throw new Error(`MCP Registry fetch failed with status ${response.status}`);
    }

    const payload = (await response.json()) as McpRegistryResponse;
    const entries = Array.isArray(payload.servers) ? payload.servers : [];
    const normalizedPage = entries.map(normalizeServer);
    const nextCursor =
      typeof payload.metadata?.nextCursor === 'string' &&
      payload.metadata.nextCursor.trim()
        ? payload.metadata.nextCursor
        : null;

    if (normalizedPage.length === 0 && nextCursor) {
      emptyPagesWithCursor.push(nextCursor);
    }

    pageChain.push({
      index,
      cursor,
      nextCursor,
      count: normalizedPage.length,
      digest: sha256({ cursor, nextCursor, servers: normalizedPage }),
    });
    servers.push(...normalizedPage);

    if (!nextCursor) {
      cursor = null;
      break;
    }

    cursor = nextCursor;
    if (index === maxPages - 1) truncated = true;
  }

  const idCounts = new Map<string, number>();
  const names = new Map<string, NormalizedServerVersion[]>();
  for (const server of servers) {
    idCounts.set(server.id, (idCounts.get(server.id) ?? 0) + 1);
    names.set(server.name, [...(names.get(server.name) ?? []), server]);
  }

  const duplicateServerVersions = [...idCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([id]) => id)
    .sort();
  const missingLatestMarkers = [...names.entries()]
    .filter(([, versions]) => !versions.some((version) => version.isLatest))
    .map(([name]) => name)
    .sort();
  const missingRemoteTransports = servers
    .filter((server) => !server.hasRemoteTransport)
    .map((server) => server.id)
    .sort();

  const anomalies = {
    duplicateServerVersions,
    missingLatestMarkers,
    missingRemoteTransports,
    cursorLoops,
    emptyPagesWithCursor,
    truncated,
  };
  const remoteTransportEntries = servers.filter(
    (server) => server.hasRemoteTransport
  ).length;
  const uniqueServerVersions = new Set(servers.map((server) => server.id)).size;
  const uniqueServerNames = names.size;

  return {
    summary: {
      totalEntries: servers.length,
      uniqueServerVersions,
      uniqueServerNames,
      remoteTransportEntries,
      remoteTransportCoveragePct:
        servers.length === 0
          ? 0
          : Math.round((remoteTransportEntries / servers.length) * 10000) / 100,
      latestMarkedNames: [...names.values()].filter((versions) =>
        versions.some((version) => version.isLatest)
      ).length,
    },
    pageChain,
    anomalies,
    receipt: buildReceipt({
      endpoint,
      generatedAt,
      pageChain,
      servers,
      anomalies,
    }),
  };
}
