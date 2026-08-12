import { createHash } from 'node:crypto';

export type A2aInterfaceProbeStatus =
  | 'reachable'
  | 'unreachable'
  | 'invalid-url';

export interface A2aInterfaceBindingInput {
  agentCard: unknown;
  previousAgentCard?: unknown;
  signatureVerified: boolean;
  signaturePayloadDigest?: string;
  fetcher?: typeof fetch;
  generatedAt?: string;
}

export interface A2aInterfaceBindingProbe {
  id: string;
  url: string;
  transport: string;
  version: string;
  securityScheme: string;
  probeStatus: A2aInterfaceProbeStatus;
  httpStatus: number | null;
  schemeMatchesUrl: boolean;
  evidence: string;
}

export interface A2aInterfaceBindingAttestationReport {
  kind: 'agentgram.a2a.interface-binding-attestation';
  generatedAt: string;
  summary: {
    interfaceCount: number;
    reachableInterfaces: number;
    mismatchedBindings: number;
    axPenaltyApplied: boolean;
  };
  interfaceProbes: A2aInterfaceBindingProbe[];
  cardDiff: {
    status: 'baseline' | 'unchanged' | 'changed';
    changedBindings: string[];
    previousDigest: string | null;
    currentDigest: string;
  };
  anomalies: {
    missingInterfaceDeclarations: boolean;
    invalidInterfaceUrls: string[];
    unreachableInterfaces: string[];
    securitySchemeMismatches: string[];
    unsignedOrUnverifiedCard: boolean;
  };
  axEvidence: {
    status: 'pass' | 'penalized';
    penaltyReasons: string[];
  };
  receipt: {
    kind: 'agentgram.a2a.interface-binding-attestation-receipt';
    digestAlgorithm: 'sha256';
    interfaceBindingDigest: string;
    cardDiffDigest: string;
    signatureVerification: {
      status: 'verified' | 'failed';
      signingAlgorithm: 'ed25519';
      payloadDigest: string | null;
    };
    signature: {
      status: 'unsigned';
      signingAlgorithm: 'ed25519';
      payloadDigest: string;
    };
  };
}

interface NormalizedInterfaceBinding {
  id: string;
  url: string;
  transport: string;
  version: string;
  securityScheme: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
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
    .filter((key) => record[key] !== undefined)
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`;
}

function sha256(value: unknown): string {
  return createHash('sha256').update(stableStringify(value)).digest('hex');
}

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function readSecurityScheme(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (isRecord(value)) {
    return readString(value.scheme ?? value.type ?? value.name, 'unspecified');
  }
  if (Array.isArray(value) && value.length > 0) {
    return readSecurityScheme(value[0]);
  }
  return 'unspecified';
}

function inferTransport(url: string, explicitTransport: unknown): string {
  const transport = readString(explicitTransport, '');
  if (transport) return transport;
  try {
    const parsed = new URL(url);
    return parsed.protocol.replace(':', '') || 'unspecified';
  } catch {
    return 'unspecified';
  }
}

function normalizeInterface(
  binding: Record<string, unknown>,
  index: number
): NormalizedInterfaceBinding | null {
  const url = readString(
    binding.url ?? binding.endpoint ?? binding.href ?? binding.serviceEndpoint,
    ''
  );
  if (!url) return null;

  return {
    id: readString(binding.id ?? binding.name, `interface-${index + 1}`),
    url,
    transport: inferTransport(url, binding.transport ?? binding.protocol),
    version: readString(
      binding.version ?? binding.protocolVersion ?? binding.apiVersion,
      'unspecified'
    ),
    securityScheme: readSecurityScheme(
      binding.securityScheme ?? binding.securitySchemes ?? binding.security
    ),
  };
}

function normalizeInterfaces(agentCard: unknown): NormalizedInterfaceBinding[] {
  if (!isRecord(agentCard)) return [];

  const declared = agentCard.interfaces ?? agentCard.agentInterfaces;
  if (Array.isArray(declared)) {
    return declared
      .map((binding, index) =>
        isRecord(binding) ? normalizeInterface(binding, index) : null
      )
      .filter((binding): binding is NormalizedInterfaceBinding => binding !== null);
  }

  const fallback = normalizeInterface(agentCard, 0);
  return fallback ? [fallback] : [];
}

function bindingKey(binding: NormalizedInterfaceBinding): string {
  return [
    binding.url,
    binding.transport,
    binding.version,
    binding.securityScheme,
  ].join('|');
}

function compareBindings(
  previous: NormalizedInterfaceBinding[],
  current: NormalizedInterfaceBinding[]
): string[] {
  if (previous.length === 0) return [];
  const previousKeys = new Set(previous.map(bindingKey));
  const currentKeys = new Set(current.map(bindingKey));
  return [
    ...current
      .filter((binding) => !previousKeys.has(bindingKey(binding)))
      .map((binding) => `added ${binding.id} ${bindingKey(binding)}`),
    ...previous
      .filter((binding) => !currentKeys.has(bindingKey(binding)))
      .map((binding) => `removed ${binding.id} ${bindingKey(binding)}`),
  ].sort();
}

function schemeMatchesUrl(binding: NormalizedInterfaceBinding): boolean {
  try {
    const parsed = new URL(binding.url);
    if (parsed.protocol !== 'https:') return false;
  } catch {
    return false;
  }

  return binding.securityScheme !== 'unspecified' && binding.securityScheme !== 'none';
}

async function probeInterface(
  binding: NormalizedInterfaceBinding,
  fetcher: typeof fetch
): Promise<A2aInterfaceBindingProbe> {
  let parsed: URL;
  try {
    parsed = new URL(binding.url);
  } catch {
    return {
      ...binding,
      probeStatus: 'invalid-url',
      httpStatus: null,
      schemeMatchesUrl: false,
      evidence: 'interface URL is not parseable',
    };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return {
      ...binding,
      probeStatus: 'invalid-url',
      httpStatus: null,
      schemeMatchesUrl: false,
      evidence: 'interface URL must use http or https for reachability probing',
    };
  }

  let status: number | null = null;
  try {
    let response = await fetcher(binding.url, { method: 'HEAD' });
    if (response.status === 405) {
      response = await fetcher(binding.url, { method: 'GET' });
    }
    status = response.status;
  } catch {
    status = null;
  }

  const reachable = status !== null && status >= 200 && status < 400;
  return {
    ...binding,
    probeStatus: reachable ? 'reachable' : 'unreachable',
    httpStatus: status,
    schemeMatchesUrl: schemeMatchesUrl(binding),
    evidence: reachable
      ? `interface probe returned HTTP ${status}`
      : status === null
        ? 'interface probe failed before an HTTP response'
        : `interface probe returned HTTP ${status}`,
  };
}

export async function buildA2aInterfaceBindingAttestation(
  input: A2aInterfaceBindingInput
): Promise<A2aInterfaceBindingAttestationReport> {
  const fetcher = input.fetcher ?? fetch;
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const currentBindings = normalizeInterfaces(input.agentCard);
  const previousBindings = normalizeInterfaces(input.previousAgentCard);
  const interfaceProbes = await Promise.all(
    currentBindings.map((binding) => probeInterface(binding, fetcher))
  );
  const changedBindings = compareBindings(previousBindings, currentBindings);
  const invalidInterfaceUrls = interfaceProbes
    .filter((probe) => probe.probeStatus === 'invalid-url')
    .map((probe) => probe.id)
    .sort();
  const unreachableInterfaces = interfaceProbes
    .filter((probe) => probe.probeStatus === 'unreachable')
    .map((probe) => probe.id)
    .sort();
  const securitySchemeMismatches = interfaceProbes
    .filter((probe) => !probe.schemeMatchesUrl)
    .map((probe) => probe.id)
    .sort();
  const missingInterfaceDeclarations = currentBindings.length === 0;
  const unsignedOrUnverifiedCard = !input.signatureVerified;
  const anomalies = {
    missingInterfaceDeclarations,
    invalidInterfaceUrls,
    unreachableInterfaces,
    securitySchemeMismatches,
    unsignedOrUnverifiedCard,
  };
  const penaltyReasons = [
    ...(missingInterfaceDeclarations ? ['missing interface declarations'] : []),
    ...invalidInterfaceUrls.map((id) => `${id} has an invalid URL`),
    ...unreachableInterfaces.map((id) => `${id} is unreachable`),
    ...securitySchemeMismatches.map(
      (id) => `${id} has an HTTPS/security-scheme mismatch`
    ),
    ...(unsignedOrUnverifiedCard ? ['Agent Card signature was not verified'] : []),
  ];
  const currentDigest = sha256(currentBindings);
  const previousDigest = previousBindings.length > 0 ? sha256(previousBindings) : null;
  const cardDiff = {
    status:
      previousBindings.length === 0
        ? 'baseline'
        : changedBindings.length > 0
          ? 'changed'
          : 'unchanged',
    changedBindings,
    previousDigest,
    currentDigest,
  } as const;
  const interfaceBindingDigest = sha256({ interfaceProbes, anomalies });
  const cardDiffDigest = sha256(cardDiff);
  const signaturePayloadDigest = input.signaturePayloadDigest ?? null;
  const receiptPayloadDigest = sha256({
    interfaceBindingDigest,
    cardDiffDigest,
    signaturePayloadDigest,
    generatedAt,
  });

  return {
    kind: 'agentgram.a2a.interface-binding-attestation',
    generatedAt,
    summary: {
      interfaceCount: currentBindings.length,
      reachableInterfaces: interfaceProbes.filter(
        (probe) => probe.probeStatus === 'reachable'
      ).length,
      mismatchedBindings:
        invalidInterfaceUrls.length +
        unreachableInterfaces.length +
        securitySchemeMismatches.length,
      axPenaltyApplied: penaltyReasons.length > 0,
    },
    interfaceProbes,
    cardDiff,
    anomalies,
    axEvidence: {
      status: penaltyReasons.length > 0 ? 'penalized' : 'pass',
      penaltyReasons,
    },
    receipt: {
      kind: 'agentgram.a2a.interface-binding-attestation-receipt',
      digestAlgorithm: 'sha256',
      interfaceBindingDigest,
      cardDiffDigest,
      signatureVerification: {
        status: input.signatureVerified ? 'verified' : 'failed',
        signingAlgorithm: 'ed25519',
        payloadDigest: signaturePayloadDigest,
      },
      signature: {
        status: 'unsigned',
        signingAlgorithm: 'ed25519',
        payloadDigest: receiptPayloadDigest,
      },
    },
  };
}
