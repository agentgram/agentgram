import { createHash } from 'node:crypto';

const MCP_REGISTRY_ENDPOINT = 'https://registry.modelcontextprotocol.io/v0/servers';
const DEFAULT_PAGE_LIMIT = 100;
const DEFAULT_MAX_PAGES = 100;

export type McpRegistryAuditReportType =
  | 'mcp-registry-coverage-audit'
  | 'mcp-schema-compatibility-audit'
  | 'mcp-registry-lifecycle-chronology-audit';

export interface McpRegistrySweepOptions {
  fetcher?: typeof fetch;
  endpoint?: string;
  limit?: number;
  maxPages?: number;
  cursor?: string | null;
  generatedAt?: string;
  reportType?: McpRegistryAuditReportType;
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
  schemaCompatibilityFailures: string[];
  lifecycleChronologyGaps: string[];
  truncated: boolean;
}

export interface McpRegistryCoverageReceipt {
  kind:
    | 'agentgram.ax-score.mcp-registry.coverage-receipt'
    | 'agentgram.ax-score.mcp-registry.schema-compatibility-receipt'
    | 'agentgram.ax-score.mcp-registry.lifecycle-chronology-receipt';
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
    paymentPurpose:
      | 'mcp-registry-coverage-audit-report'
      | 'mcp-schema-compatibility-audit-report'
      | 'mcp-registry-lifecycle-chronology-audit-report';
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
    schemaCompatibleEntries: number;
    schemaCompatibilityPct: number;
    lifecycleChronologyEntries: number;
    lifecycleTimestampCoveragePct: number;
  };
  pageChain: McpRegistryPageDigest[];
  lifecycleChronology: McpRegistryLifecycleChronologyEntry[];
  anomalies: McpRegistryCoverageAnomalies;
  receipt: McpRegistryCoverageReceipt;
}

export interface McpRegistryLifecycleChronologyEntry {
  id: string;
  name: string;
  version: string;
  status: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
  isLatest: boolean;
  eventDigest: string;
}

interface NormalizedServerVersion {
  id: string;
  name: string;
  version: string;
  isLatest: boolean;
  status: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
  hasRemoteTransport: boolean;
  schemaCompatible: boolean;
  schemaCompatibilityErrors: string[];
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

function getOptionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function hasRemoteTransport(server: McpRegistryServerDocument): boolean {
  if (!Array.isArray(server.remotes)) return false;

  return server.remotes.some((remote) => {
    if (!remote || typeof remote !== 'object') return false;
    const record = remote as Record<string, unknown>;
    return typeof record.url === 'string' && record.url.startsWith('https://');
  });
}

function hasPackageLaunchSurface(server: McpRegistryServerDocument): boolean {
  if (!Array.isArray(server.packages)) return false;

  return server.packages.some((pkg) => {
    if (!pkg || typeof pkg !== 'object') return false;
    const record = pkg as Record<string, unknown>;
    return (
      typeof record.name === 'string' &&
      record.name.trim().length > 0 &&
      typeof record.version === 'string' &&
      record.version.trim().length > 0
    );
  });
}

function getSchemaCompatibilityErrors(
  server: McpRegistryServerDocument,
  hasRemote: boolean
): string[] {
  const errors: string[] = [];
  if (typeof server.name !== 'string' || !server.name.trim()) {
    errors.push('missing server.name');
  }
  if (typeof server.version !== 'string' || !server.version.trim()) {
    errors.push('missing server.version');
  }
  if (!hasRemote && !hasPackageLaunchSurface(server)) {
    errors.push('missing MCP launch surface (https remote or package)');
  }
  return errors;
}

function normalizeServer(entry: McpRegistryEntry): NormalizedServerVersion {
  const server = entry.server ?? {};
  const name = getString(server.name, 'unknown-server');
  const version = getString(server.version, 'unknown-version');
  const official = entry._meta?.['io.modelcontextprotocol.registry/official'];
  const hasRemote = hasRemoteTransport(server);
  const schemaCompatibilityErrors = getSchemaCompatibilityErrors(server, hasRemote);

  return {
    id: `${name}@${version}`,
    name,
    version,
    isLatest: official?.isLatest === true,
    status: getOptionalString(official?.status),
    publishedAt: getOptionalString(official?.publishedAt),
    updatedAt: getOptionalString(official?.updatedAt),
    hasRemoteTransport: hasRemote,
    schemaCompatible: schemaCompatibilityErrors.length === 0,
    schemaCompatibilityErrors,
  };
}

function buildLifecycleChronology(
  servers: NormalizedServerVersion[]
): McpRegistryLifecycleChronologyEntry[] {
  return servers
    .map((server) => ({
      id: server.id,
      name: server.name,
      version: server.version,
      status: server.status,
      publishedAt: server.publishedAt,
      updatedAt: server.updatedAt,
      isLatest: server.isLatest,
      eventDigest: sha256({
        id: server.id,
        status: server.status,
        publishedAt: server.publishedAt,
        updatedAt: server.updatedAt,
        isLatest: server.isLatest,
      }),
    }))
    .sort((a, b) => {
      const aTime = a.updatedAt ?? a.publishedAt ?? '';
      const bTime = b.updatedAt ?? b.publishedAt ?? '';
      return aTime.localeCompare(bTime) || a.id.localeCompare(b.id);
    });
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
    anomalies.schemaCompatibilityFailures.length +
    anomalies.lifecycleChronologyGaps.length +
    (anomalies.truncated ? 1 : 0)
  );
}

function buildReceipt(input: {
  endpoint: string;
  generatedAt: string;
  pageChain: McpRegistryPageDigest[];
  servers: NormalizedServerVersion[];
  anomalies: McpRegistryCoverageAnomalies;
  reportType: McpRegistryAuditReportType;
}): McpRegistryCoverageReceipt {
  const pageChainDigest = sha256(input.pageChain);
  const coveragePayload = {
    endpoint: input.endpoint,
    reportType: input.reportType,
    pages: input.pageChain.map((page) => page.digest),
    servers: input.servers.map((server) => server.id).sort(),
    schemaCompatibility: input.servers
      .map((server) => ({
        id: server.id,
        compatible: server.schemaCompatible,
        errors: server.schemaCompatibilityErrors,
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    anomalies: input.anomalies,
  };
  const coverageDigest = sha256(coveragePayload);
  const anomalyCount = countAnomalies(input.anomalies);
  const signaturePayloadDigest = sha256({ coverageDigest, pageChainDigest });
  const isSchemaCompatibilityReport =
    input.reportType === 'mcp-schema-compatibility-audit';
  const isLifecycleChronologyReport =
    input.reportType === 'mcp-registry-lifecycle-chronology-audit';

  return {
    kind: isLifecycleChronologyReport
      ? 'agentgram.ax-score.mcp-registry.lifecycle-chronology-receipt'
      : isSchemaCompatibilityReport
        ? 'agentgram.ax-score.mcp-registry.schema-compatibility-receipt'
        : 'agentgram.ax-score.mcp-registry.coverage-receipt',
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
      paymentPurpose: isLifecycleChronologyReport
        ? 'mcp-registry-lifecycle-chronology-audit-report'
        : isSchemaCompatibilityReport
          ? 'mcp-schema-compatibility-audit-report'
          : 'mcp-registry-coverage-audit-report',
      recommendedPriceUsd: isLifecycleChronologyReport
        ? '99.00'
        : isSchemaCompatibilityReport
          ? '79.00'
          : '49.00',
      deliverable: isLifecycleChronologyReport
        ? 'MCP Registry server-version lifecycle chronology, timestamp gap analysis, and Ed25519-signable receipt payload.'
        : isSchemaCompatibilityReport
          ? 'MCP Registry schema compatibility findings, launch-surface gate results, and Ed25519-signable receipt payload.'
          : 'Full nextCursor sweep digest, coverage anomaly report, and Ed25519-signable receipt payload.',
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
  const reportType = options.reportType ?? 'mcp-registry-coverage-audit';
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
  const schemaCompatibilityFailures = servers
    .filter((server) => !server.schemaCompatible)
    .map((server) => `${server.id}: ${server.schemaCompatibilityErrors.join('; ')}`)
    .sort();
  const lifecycleChronology = buildLifecycleChronology(servers);
  const lifecycleChronologyGaps =
    reportType === 'mcp-registry-lifecycle-chronology-audit'
      ? servers
          .flatMap((server) => {
            const gaps: string[] = [];
            if (!server.status) gaps.push('missing lifecycle status');
            if (!server.publishedAt) gaps.push('missing publishedAt');
            if (!server.updatedAt) gaps.push('missing updatedAt');
            return gaps.map((gap) => `${server.id}: ${gap}`);
          })
          .sort()
      : [];

  const anomalies = {
    duplicateServerVersions,
    missingLatestMarkers,
    missingRemoteTransports,
    cursorLoops,
    emptyPagesWithCursor,
    schemaCompatibilityFailures,
    lifecycleChronologyGaps,
    truncated,
  };
  const remoteTransportEntries = servers.filter(
    (server) => server.hasRemoteTransport
  ).length;
  const uniqueServerVersions = new Set(servers.map((server) => server.id)).size;
  const uniqueServerNames = names.size;
  const schemaCompatibleEntries = servers.filter(
    (server) => server.schemaCompatible
  ).length;
  const lifecycleTimestampEntries = servers.filter(
    (server) => server.publishedAt && server.updatedAt
  ).length;

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
      schemaCompatibleEntries,
      schemaCompatibilityPct:
        servers.length === 0
          ? 0
          : Math.round((schemaCompatibleEntries / servers.length) * 10000) / 100,
      lifecycleChronologyEntries: lifecycleChronology.length,
      lifecycleTimestampCoveragePct:
        servers.length === 0
          ? 0
          : Math.round((lifecycleTimestampEntries / servers.length) * 10000) / 100,
    },
    pageChain,
    lifecycleChronology,
    anomalies,
    receipt: buildReceipt({
      endpoint,
      generatedAt,
      pageChain,
      servers,
      anomalies,
      reportType,
    }),
  };
}
