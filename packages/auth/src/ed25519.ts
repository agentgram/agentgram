import * as ed25519 from '@noble/ed25519';

/**
 * Ed25519 signature primitives for AgentGram.
 *
 * All signatures are domain-separated: the signed message is the UTF-8
 * encoding of a domain prefix followed by a canonical JSON serialization
 * of the payload. This prevents signatures produced for one context
 * (e.g. registration proof-of-possession) from being replayed in another
 * (e.g. request signing).
 */

/** Domain prefix for payload signatures (registration proof-of-possession). */
export const SIGNATURE_DOMAIN = 'agentgram:v1:';

/** Domain prefix for A2A Agent Card canonical signatures. */
export const A2A_AGENT_CARD_SIGNATURE_DOMAIN =
  'agentgram:v1:a2a-agent-card:';

export const A2A_AGENT_CARD_JWS_ALGORITHM = 'EdDSA';
export const A2A_AGENT_CARD_JWS_CRITICAL_RFC8785 = 'agentgram-rfc8785';

/** Domain prefix for A2A task-history retention attestation signatures. */
export const A2A_TASK_HISTORY_RETENTION_SIGNATURE_DOMAIN =
  'agentgram:v1:a2a-task-history-retention:';

/** Domain prefix for A2A security-requirement satisfiability attestations. */
export const A2A_SECURITY_REQUIREMENT_SATISFIABILITY_SIGNATURE_DOMAIN =
  'agentgram:v1:a2a-security-requirement-satisfiability:';

/** Domain prefix for A2A extension governance provenance attestations. */
export const A2A_EXTENSION_GOVERNANCE_SIGNATURE_DOMAIN =
  'agentgram:v1:a2a-extension-governance:';

export const RFC8785_AGENT_CARD_FIXTURE_CANONICAL_JSON =
  '{"literals":[null,true,false],"numbers":[333333333.3333333,1e+30,4.5,0.002,1e-27],"string":"€$\\u000f\\nA\'B\\"\\\\\\"/"}';

export const RFC8785_AGENT_CARD_FIXTURE_DIGEST =
  '6d77565c0fe51d7346bd5debb08f2eebbe9bde01eade30b34e2011f360f91b0e';

/** Maximum allowed clock skew between signer and server, in milliseconds. */
export const SIGNATURE_FRESHNESS_WINDOW_MS = 5 * 60 * 1000;

/** Maximum age for exported A2A Agent Card retrieval evidence. */
export const A2A_AGENT_CARD_RETRIEVAL_FRESHNESS_WINDOW_MS =
  24 * 60 * 60 * 1000;

const PUBLIC_KEY_HEX_REGEX = /^[0-9a-f]{64}$/i;
const SECRET_KEY_HEX_REGEX = /^[0-9a-f]{64}$/i;
const SIGNATURE_HEX_REGEX = /^[0-9a-f]{128}$/i;
const BASE64URL_REGEX = /^[A-Za-z0-9_-]+$/;

export interface AgentKeypair {
  /** 32-byte Ed25519 public key, lowercase hex (64 chars). */
  publicKey: string;
  /** 32-byte Ed25519 secret key, lowercase hex (64 chars). Never send to the server. */
  secretKey: string;
}

export type SignatureVerdict =
  | { ok: true }
  | { ok: false; code: 'SIGNATURE_EXPIRED' | 'SIGNATURE_INVALID'; message: string };

export interface A2aAgentCardCanonicalSignatureEvidence {
  kind: 'agentgram.a2a.agent-card.canonical-signature-gate';
  generatedAt: string;
  canonicalization: {
    status: 'conformant' | 'failed';
    standard: 'RFC8785';
    fixture: {
      name: 'rfc8785-json-canonicalization-number-string-order';
      canonicalJson: string;
      digestAlgorithm: 'sha256';
      digest: string;
    };
  };
  signature: {
    status: 'fail-closed';
    signingAlgorithm: 'ed25519';
    signatureDomain: typeof A2A_AGENT_CARD_SIGNATURE_DOMAIN;
    jws: {
      algAllowlist: [typeof A2A_AGENT_CARD_JWS_ALGORITHM];
      kidBinding: 'must-match-public-key';
      criticalHeaderAllowlist: [typeof A2A_AGENT_CARD_JWS_CRITICAL_RFC8785];
      payloadBinding: 'protected-payload-must-equal-rfc8785-agent-card';
    };
    unsignedCardsAccepted: false;
    requiredFields: ['agentCard', 'publicKey', 'signature-or-jws'];
    failureModes: string[];
  };
}

export interface A2aAgentCardJwsProtectedHeader {
  alg: typeof A2A_AGENT_CARD_JWS_ALGORITHM;
  kid: string;
  crit?: string[];
  [A2A_AGENT_CARD_JWS_CRITICAL_RFC8785]?: true;
}

export type A2aAgentCardSignatureVerdict =
  | {
      ok: true;
      canonicalJson: string;
      payloadDigest: string;
      jwsProtectedHeader?: A2aAgentCardJwsProtectedHeader;
      evidence: A2aAgentCardCanonicalSignatureEvidence;
    }
  | {
      ok: false;
      code: 'RFC8785_CONFORMANCE_FAILED' | 'SIGNATURE_INVALID';
      message: string;
      evidence: A2aAgentCardCanonicalSignatureEvidence;
    };

export type A2aAgentCardTransportBindingParityStatus =
  | 'equivalent'
  | 'diverged'
  | 'single-binding';

export type A2aAgentCardTransportBindingDivergenceKind =
  | 'task-semantics'
  | 'auth-behavior';

export interface A2aAgentCardTransportBindingProbe {
  bindingId: string;
  transport: string;
  url: string;
  taskSemanticsDigest: string;
  authBehaviorDigest: string;
}

export interface A2aAgentCardTransportBindingDivergence {
  bindingId: string;
  kind: A2aAgentCardTransportBindingDivergenceKind;
  expectedDigest: string;
  actualDigest: string;
}

export interface A2aAgentCardTransportBindingParityReport {
  kind: 'agentgram.a2a.agent-card.transport-binding-parity';
  signedAgentCardPayloadDigest: string;
  status: A2aAgentCardTransportBindingParityStatus;
  bindingCount: number;
  probes: A2aAgentCardTransportBindingProbe[];
  divergences: A2aAgentCardTransportBindingDivergence[];
}

export type A2aAgentCardTransportBindingParityVerdict =
  | {
      ok: true;
      parity: A2aAgentCardTransportBindingParityReport;
      signature: Extract<A2aAgentCardSignatureVerdict, { ok: true }>;
    }
  | {
      ok: false;
      code: 'SIGNATURE_INVALID' | 'BINDING_PARITY_DIVERGED';
      message: string;
      parity?: A2aAgentCardTransportBindingParityReport;
      signature: A2aAgentCardSignatureVerdict;
    };

export type A2aAgentCardRetrievalFreshnessStatus =
  | 'fresh'
  | 'stale'
  | 'indeterminate';

export type A2aAgentCardStaleCacheVerdict = 'accept' | 'reject' | 'review';

export interface A2aAgentCardRetrievalFreshnessReport {
  kind: 'agentgram.a2a.agent-card.retrieval-freshness';
  generatedAt: string;
  agentCardUrl: string;
  signedAgentCardPayloadDigest: string;
  retrieval: {
    fetchedAt: string;
    etag: string | null;
    lastModified: string | null;
    cacheControl: string | null;
  };
  signature: {
    status: 'verified';
    signingAlgorithm: 'ed25519';
    publicKey: string;
    keyVersion: string | null;
  };
  freshness: {
    status: A2aAgentCardRetrievalFreshnessStatus;
    staleCacheVerdict: A2aAgentCardStaleCacheVerdict;
    maxEvidenceAgeSeconds: number;
    fetchAgeSeconds: number | null;
    cacheMaxAgeSeconds: number | null;
    lastModifiedAgeSeconds: number | null;
    validators: {
      etag: boolean;
      lastModified: boolean;
    };
    reasons: string[];
  };
}

export type A2aAgentCardRetrievalFreshnessVerdict =
  | {
      ok: true;
      freshness: A2aAgentCardRetrievalFreshnessReport;
      signature: Extract<A2aAgentCardSignatureVerdict, { ok: true }>;
    }
  | {
      ok: false;
      code:
        | 'SIGNATURE_INVALID'
        | 'RETRIEVAL_METADATA_INVALID'
        | 'AGENT_CARD_STALE';
      message: string;
      freshness?: A2aAgentCardRetrievalFreshnessReport;
      signature: A2aAgentCardSignatureVerdict;
    };

export type A2aAgentCardMcpServiceLinkStatus =
  | 'linked'
  | 'redirected'
  | 'mismatched'
  | 'unregistered';

export interface A2aAgentCardMcpServiceLinkProbe {
  serviceId: string;
  registryServerName: string;
  namespace: string;
  declaredEndpointUrl: string;
  observedEndpointUrl: string | null;
  declaredEndpointAuthority: string;
  observedEndpointAuthority: string | null;
  registryRemoteUrls: string[];
  registryEndpointAuthorities: string[];
  status: A2aAgentCardMcpServiceLinkStatus;
  reasons: string[];
}

export interface A2aAgentCardMcpServiceLinkReport {
  kind: 'agentgram.a2a.agent-card.mcp-service-link-attestation';
  generatedAt: string;
  signedAgentCardPayloadDigest: string;
  serviceCount: number;
  linkedCount: number;
  redirectedCount: number;
  mismatchedCount: number;
  unregisteredCount: number;
  probes: A2aAgentCardMcpServiceLinkProbe[];
  verdict: {
    status: 'linked' | 'review-required';
    reasons: string[];
  };
  signature: {
    status: 'verified';
    signingAlgorithm: 'ed25519';
    publicKey: string;
    payloadDigest: string;
  };
}

export type A2aAgentCardMcpServiceLinkVerdict =
  | {
      ok: true;
      serviceLink: A2aAgentCardMcpServiceLinkReport;
      signature: Extract<A2aAgentCardSignatureVerdict, { ok: true }>;
    }
  | {
      ok: false;
      code:
        | 'SIGNATURE_INVALID'
        | 'MCP_SERVICE_LINKS_INVALID'
        | 'MCP_SERVICE_LINK_REVIEW_REQUIRED';
      message: string;
      serviceLink?: A2aAgentCardMcpServiceLinkReport;
      signature: A2aAgentCardSignatureVerdict;
    };

export type A2aExtensionGovernancePromotionTier =
  | 'core'
  | 'promoted'
  | 'experimental'
  | 'vendor'
  | 'retired'
  | 'unknown';

export type A2aExtensionGovernanceSupportPolicyVerdict =
  | 'supported'
  | 'unpromoted'
  | 'retired'
  | 'unknown';

export interface A2aExtensionGovernanceProbe {
  extensionUri: string;
  version: string;
  required: boolean;
  canonicalSpecUrl: string | null;
  canonicalSpecDigest: string | null;
  promotionTier: A2aExtensionGovernancePromotionTier;
  observedAt: string | null;
  supportPolicyVerdict: A2aExtensionGovernanceSupportPolicyVerdict;
  discoveryConfidence: {
    status: 'full' | 'lowered';
    score: number;
    reasons: string[];
  };
}

export interface A2aExtensionGovernanceReport {
  kind: 'agentgram.a2a.agent-card.extension-governance-provenance-attestation';
  generatedAt: string;
  signedAgentCardPayloadDigest: string;
  extensionCount: number;
  supportedCount: number;
  loweredCount: number;
  requiredUnsupportedCount: number;
  probes: A2aExtensionGovernanceProbe[];
  verdict: {
    status: 'supported' | 'lowered-confidence' | 'unsupported-required';
    reasons: string[];
  };
  signature: {
    status: 'verified';
    signingAlgorithm: 'ed25519';
    signatureDomain: typeof A2A_EXTENSION_GOVERNANCE_SIGNATURE_DOMAIN;
    publicKey: string;
    payloadDigest: string;
  };
}

export type A2aExtensionGovernanceVerdict =
  | {
      ok: true;
      governance: A2aExtensionGovernanceReport;
      signature: Extract<A2aAgentCardSignatureVerdict, { ok: true }>;
    }
  | {
      ok: false;
      code:
        | 'SIGNATURE_INVALID'
        | 'EXTENSIONS_INVALID'
        | 'EXTENSION_GOVERNANCE_UNSUPPORTED'
        | 'EXTENSION_GOVERNANCE_CONFIDENCE_LOWERED';
      message: string;
      governance?: A2aExtensionGovernanceReport;
      signature: A2aAgentCardSignatureVerdict;
    };

export type A2aExtendedAgentCardAuthorizationState =
  | 'public'
  | 'authenticated'
  | 'expired';

export interface A2aExtendedAgentCardAuthorizationTransitionProbe {
  phase: string;
  authorization: A2aExtendedAgentCardAuthorizationState;
  sessionId: string;
  cardVersion: string;
  disclosureDigest: string | null;
  extendedCapabilitiesDigest: string | null;
  clearedExtendedCapabilities: boolean;
  fetchedAt: string | null;
}

export interface A2aExtendedAgentCardAuthorizationDowngradeReport {
  kind: 'agentgram.a2a.extended-agent-card.authorization-downgrade-cache-clearance';
  generatedAt: string;
  signedAgentCardPayloadDigest: string;
  sessionId: string;
  cardVersion: string;
  disclosureDigest: string;
  transitions: A2aExtendedAgentCardAuthorizationTransitionProbe[];
  downgrade: {
    status: 'cleared' | 'leaked' | 'indeterminate';
    authenticatedDisclosureObserved: boolean;
    weakenedAuthorizationObserved: boolean;
    reasons: string[];
  };
}

export type A2aExtendedAgentCardAuthorizationDowngradeVerdict =
  | {
      ok: true;
      clearance: A2aExtendedAgentCardAuthorizationDowngradeReport;
      signature: Extract<A2aAgentCardSignatureVerdict, { ok: true }>;
    }
  | {
      ok: false;
      code:
        | 'SIGNATURE_INVALID'
        | 'AUTHORIZATION_TRANSITIONS_INVALID'
        | 'EXTENDED_CAPABILITIES_CACHE_LEAK';
      message: string;
      clearance?: A2aExtendedAgentCardAuthorizationDowngradeReport;
      signature: A2aAgentCardSignatureVerdict;
    };

export type A2aTaskHistoryRetentionStatus =
  | 'reproducible'
  | 'truncated'
  | 'non-reproducible';

export type A2aTaskHistoryRetentionComparison =
  | 'complete'
  | 'truncated'
  | 'over-returned';

export interface A2aTaskHistoryRetentionPayload {
  kind: 'agentgram.a2a.task-history.retention-attestation-payload';
  taskId: string;
  taskVersion: string;
  cardVersion: string;
  requestedHistoryLength: number;
  returnedHistoryLength: number;
  returnedHistoryDigest: string;
  truncationReason: string | null;
}

export interface A2aTaskHistoryRetentionVerifierFixture {
  name: 'a2a-task-history-retention-requested-vs-returned';
  canonicalJson: string;
  digestAlgorithm: 'sha256';
  digest: string;
  payload: A2aTaskHistoryRetentionPayload;
}

export interface A2aTaskHistoryRetentionReport {
  kind: 'agentgram.a2a.task-history.retention-attestation';
  generatedAt: string;
  signedAgentCardPayloadDigest: string;
  taskId: string;
  taskVersion: string;
  cardVersion: string;
  request: {
    requestedHistoryLength: number;
  };
  response: {
    returnedHistoryLength: number;
    returnedHistoryDigest: string;
    truncated: boolean;
    truncationReason: string | null;
  };
  retention: {
    status: A2aTaskHistoryRetentionStatus;
    requestedVsReturned: A2aTaskHistoryRetentionComparison;
    reasons: string[];
  };
  signature: {
    status: 'verified';
    signingAlgorithm: 'ed25519';
    signatureDomain: typeof A2A_TASK_HISTORY_RETENTION_SIGNATURE_DOMAIN;
    publicKey: string;
    payloadDigest: string;
    verifierFixture: A2aTaskHistoryRetentionVerifierFixture;
  };
}

export type A2aTaskHistoryRetentionVerdict =
  | {
      ok: true;
      retention: A2aTaskHistoryRetentionReport;
      signature: Extract<A2aAgentCardSignatureVerdict, { ok: true }>;
    }
  | {
      ok: false;
      code:
        | 'SIGNATURE_INVALID'
        | 'TASK_HISTORY_RETENTION_METADATA_INVALID'
        | 'TASK_HISTORY_RETENTION_SIGNATURE_INVALID'
        | 'TASK_HISTORY_RETENTION_NON_REPRODUCIBLE';
      message: string;
      retention?: A2aTaskHistoryRetentionReport;
      signature: A2aAgentCardSignatureVerdict;
    };

export type A2aSecurityRequirementSatisfiabilityStatus =
  | 'satisfiable'
  | 'unsatisfiable';

export interface A2aSecurityRequirementProbe {
  scope: 'agent-card' | 'skill';
  skillId: string | null;
  requirementIndex: number;
  schemeNames: string[];
  status: A2aSecurityRequirementSatisfiabilityStatus;
  reasons: string[];
}

export type A2aSkillAuthorizationInterfaceStatus = 'accepted' | 'rejected';

export interface A2aSkillAuthorizationInterfaceProbe {
  skillId: string;
  bindingId: string | null;
  transport: string | null;
  url: string | null;
  protocolVersion: string | null;
  requirementIndex: number;
  requiredSchemeNames: string[];
  acceptedSchemeNames: string[];
  status: A2aSkillAuthorizationInterfaceStatus;
  reasons: string[];
}

export interface A2aSecurityRequirementSatisfiabilityReport {
  kind: 'agentgram.a2a.agent-card.security-requirement-satisfiability';
  generatedAt: string;
  signedAgentCardPayloadDigest: string;
  securitySchemeNames: string[];
  requirementCount: number;
  satisfiableRequirementCount: number;
  unsatisfiableRequirementCount: number;
  probes: A2aSecurityRequirementProbe[];
  skillAuthorization: {
    status: 'accepted' | 'rejected' | 'not-declared';
    probeCount: number;
    acceptedProbeCount: number;
    rejectedProbeCount: number;
    probes: A2aSkillAuthorizationInterfaceProbe[];
    reasons: string[];
  };
  satisfiability: {
    status: A2aSecurityRequirementSatisfiabilityStatus;
    publicAccessDeclared: boolean;
    reasons: string[];
  };
  signature: {
    status: 'verified';
    signingAlgorithm: 'ed25519';
    signatureDomain: typeof A2A_SECURITY_REQUIREMENT_SATISFIABILITY_SIGNATURE_DOMAIN;
    publicKey: string;
    payloadDigest: string;
  };
}

export type A2aSecurityRequirementSatisfiabilityVerdict =
  | {
      ok: true;
      satisfiability: A2aSecurityRequirementSatisfiabilityReport;
      signature: Extract<A2aAgentCardSignatureVerdict, { ok: true }>;
    }
  | {
      ok: false;
      code:
        | 'SIGNATURE_INVALID'
        | 'SECURITY_REQUIREMENTS_INVALID'
        | 'SECURITY_REQUIREMENTS_UNSATISFIABLE';
      message: string;
      satisfiability?: A2aSecurityRequirementSatisfiabilityReport;
      signature: A2aAgentCardSignatureVerdict;
    };

interface A2aExtendedAgentCardAuthorizationTransitionInput {
  phase?: unknown;
  authorization?: unknown;
  sessionId?: unknown;
  cardVersion?: unknown;
  disclosureDigest?: unknown;
  fetchedAt?: unknown;
  agentCard?: unknown;
  extendedAgentCard?: unknown;
  authenticatedExtendedCard?: unknown;
  extendedCapabilities?: unknown;
}

interface A2aTaskHistoryRetentionMetadata {
  taskId: string;
  taskVersion: string;
  cardVersion: string;
  requestedHistoryLength: number;
  returnedHistoryLength: number;
  returnedHistoryDigest: string;
  truncationReason: string | null;
}

interface NormalizedA2aAgentCardTransportBinding {
  bindingId: string;
  transport: string;
  url: string;
  taskSemantics: unknown;
  authBehavior: unknown;
}

interface NormalizedA2aMcpServiceLink {
  serviceId: string;
  registryServerName: string;
  namespace: string;
  endpointUrl: string;
  endpointAuthority: string;
}

interface NormalizedMcpRegistryServer {
  name: string;
  namespace: string;
  remoteUrls: string[];
  remoteAuthorities: string[];
}

interface NormalizedA2aMcpEndpointObservation {
  serviceId: string | null;
  requestedUrl: string;
  requestedAuthority: string;
  finalUrl: string;
  finalAuthority: string;
}

interface NormalizedA2aExtensionDeclaration {
  extensionUri: string;
  version: string;
  required: boolean;
}

interface NormalizedA2aExtensionGovernanceEntry {
  extensionUri: string;
  version: string;
  canonicalSpecUrl: string;
  canonicalSpecDigest: string;
  promotionTier: A2aExtensionGovernancePromotionTier;
  observedAt: string;
  supportPolicyVerdict: A2aExtensionGovernanceSupportPolicyVerdict;
}

type A2aSecuritySchemeKind =
  | 'apiKeySecurityScheme'
  | 'httpAuthSecurityScheme'
  | 'oauth2SecurityScheme'
  | 'openIdConnectSecurityScheme'
  | 'mtlsSecurityScheme';

const A2A_SECURITY_SCHEME_KEYS: A2aSecuritySchemeKind[] = [
  'apiKeySecurityScheme',
  'httpAuthSecurityScheme',
  'oauth2SecurityScheme',
  'openIdConnectSecurityScheme',
  'mtlsSecurityScheme',
];

/**
 * Deterministic JSON serialization: object keys are sorted recursively so
 * that logically identical payloads always produce the same signed bytes.
 * Values must be JSON-serializable (undefined object values are omitted,
 * matching JSON.stringify semantics).
 */
export function canonicalJson(value: unknown): string {
  if (value === null) {
    return 'null';
  }
  const kind = typeof value;
  if (kind === 'string' || kind === 'boolean') {
    return JSON.stringify(value);
  }
  if (kind === 'number') {
    if (!Number.isFinite(value as number)) {
      throw new Error('Cannot canonicalize non-finite number');
    }
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item === undefined ? null : item)).join(',')}]`;
  }
  if (kind === 'object') {
    const record = value as Record<string, unknown>;
    const entries = Object.keys(record)
      .sort()
      .filter((key) => record[key] !== undefined)
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`);
    return `{${entries.join(',')}}`;
  }
  throw new Error(`Cannot canonicalize value of type ${kind}`);
}

const RFC8785_AGENT_CARD_FIXTURE = {
  numbers: [Number('333333333.33333329'), 1e30, 4.5, 2e-3, 1e-27],
  string: '€$\u000f\nA\'B"\\"/',
  literals: [null, true, false],
};

async function sha256Hex(data: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(data)
  );
  return ed25519.etc.bytesToHex(new Uint8Array(digest));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readOptionalString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function normalizeTaskSemantics(
  agentCard: Record<string, unknown>,
  binding: Record<string, unknown>
): unknown {
  return {
    capabilities: binding.capabilities ?? agentCard.capabilities ?? null,
    skills: binding.skills ?? agentCard.skills ?? null,
    supportsAuthenticatedExtendedCard:
      binding.supportsAuthenticatedExtendedCard ??
      agentCard.supportsAuthenticatedExtendedCard ??
      null,
  };
}

function normalizeAuthBehavior(
  agentCard: Record<string, unknown>,
  binding: Record<string, unknown>
): unknown {
  return {
    securitySchemes: binding.securitySchemes ?? agentCard.securitySchemes ?? null,
    security: binding.security ?? agentCard.security ?? null,
    authenticatedExtendedCard:
      binding.authenticatedExtendedCard ?? agentCard.authenticatedExtendedCard ?? null,
  };
}

function normalizeTransportBindings(
  agentCard: Record<string, unknown>
): NormalizedA2aAgentCardTransportBinding[] {
  const bindings: NormalizedA2aAgentCardTransportBinding[] = [];
  const primaryUrl = readOptionalString(agentCard, 'url');
  if (primaryUrl !== undefined) {
    bindings.push({
      bindingId: 'primary',
      transport:
        readOptionalString(agentCard, 'preferredTransport') ??
        readOptionalString(agentCard, 'transport') ??
        'unspecified',
      url: primaryUrl,
      taskSemantics: normalizeTaskSemantics(agentCard, agentCard),
      authBehavior: normalizeAuthBehavior(agentCard, agentCard),
    });
  }

  const appendBinding = (value: unknown, bindingId: string) => {
    if (!isRecord(value)) {
      return;
    }
    const url = readOptionalString(value, 'url');
    if (url === undefined) {
      return;
    }
    bindings.push({
      bindingId,
      transport:
        readOptionalString(value, 'transport') ??
        readOptionalString(value, 'type') ??
        readOptionalString(value, 'protocol') ??
        'unspecified',
      url,
      taskSemantics: normalizeTaskSemantics(agentCard, value),
      authBehavior: normalizeAuthBehavior(agentCard, value),
    });
  };

  const additionalInterfaces = agentCard.additionalInterfaces;
  if (Array.isArray(additionalInterfaces)) {
    additionalInterfaces.forEach((binding, index) => {
      appendBinding(binding, `additionalInterfaces[${index}]`);
    });
  }

  const transportBindings = agentCard.transportBindings;
  if (Array.isArray(transportBindings)) {
    transportBindings.forEach((binding, index) => {
      const defaultId = `transportBindings[${index}]`;
      const bindingId = isRecord(binding)
        ? readOptionalString(binding, 'id') ?? defaultId
        : defaultId;
      appendBinding(binding, bindingId);
    });
  }

  return bindings;
}

function readSecurityRequirementScopes(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  return value.every((scope) => typeof scope === 'string') ? value : null;
}

function validateHttpsUrl(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function collectOAuth2Scopes(scheme: Record<string, unknown>): Set<string> {
  const scopes = new Set<string>();
  const oauth2 = scheme.oauth2SecurityScheme;
  if (!isRecord(oauth2) || !isRecord(oauth2.flows)) {
    return scopes;
  }
  for (const flow of Object.values(oauth2.flows)) {
    if (!isRecord(flow) || !isRecord(flow.scopes)) {
      continue;
    }
    for (const scope of Object.keys(flow.scopes)) {
      scopes.add(scope);
    }
  }
  return scopes;
}

function validateSecurityScheme(
  schemeName: string,
  value: unknown
): { kind: A2aSecuritySchemeKind | null; reasons: string[] } {
  if (!isRecord(value)) {
    return {
      kind: null,
      reasons: [`security scheme "${schemeName}" must be an object`],
    };
  }

  const presentKinds = A2A_SECURITY_SCHEME_KEYS.filter((key) =>
    isRecord(value[key])
  );
  if (presentKinds.length !== 1) {
    return {
      kind: null,
      reasons: [
        `security scheme "${schemeName}" must define exactly one A2A security scheme kind`,
      ],
    };
  }

  const kind = presentKinds[0];
  const scheme = value[kind];
  const reasons: string[] = [];
  if (kind === 'apiKeySecurityScheme' && isRecord(scheme)) {
    if (!['query', 'header', 'cookie'].includes(String(scheme.location))) {
      reasons.push(
        `apiKeySecurityScheme "${schemeName}" requires location query/header/cookie`
      );
    }
    if (readRequiredString(scheme.name) === null) {
      reasons.push(`apiKeySecurityScheme "${schemeName}" requires name`);
    }
  }
  if (kind === 'httpAuthSecurityScheme' && isRecord(scheme)) {
    if (readRequiredString(scheme.scheme) === null) {
      reasons.push(`httpAuthSecurityScheme "${schemeName}" requires scheme`);
    }
  }
  if (kind === 'oauth2SecurityScheme' && isRecord(scheme)) {
    if (!isRecord(scheme.flows) || Object.keys(scheme.flows).length === 0) {
      reasons.push(`oauth2SecurityScheme "${schemeName}" requires flows`);
    }
    if (
      scheme.oauth2MetadataUrl !== undefined &&
      !validateHttpsUrl(scheme.oauth2MetadataUrl)
    ) {
      reasons.push(
        `oauth2SecurityScheme "${schemeName}" metadata URL must be HTTPS`
      );
    }
  }
  if (kind === 'openIdConnectSecurityScheme' && isRecord(scheme)) {
    if (!validateHttpsUrl(scheme.openIdConnectUrl)) {
      reasons.push(
        `openIdConnectSecurityScheme "${schemeName}" discovery URL must be HTTPS`
      );
    }
  }

  return { kind, reasons };
}

function collectSecurityRequirementInputs(
  agentCard: Record<string, unknown>
):
  | { ok: true; inputs: Array<{ scope: 'agent-card' | 'skill'; skillId: string | null; requirements: unknown }> }
  | { ok: false; reasons: string[] } {
  const inputs: Array<{
    scope: 'agent-card' | 'skill';
    skillId: string | null;
    requirements: unknown;
  }> = [];
  const reasons: string[] = [];

  if (agentCard.securityRequirements !== undefined) {
    inputs.push({
      scope: 'agent-card',
      skillId: null,
      requirements: agentCard.securityRequirements,
    });
  }

  if (agentCard.skills !== undefined) {
    if (!Array.isArray(agentCard.skills)) {
      reasons.push('Agent Card skills must be an array when present');
    } else {
      agentCard.skills.forEach((skill, index) => {
        if (!isRecord(skill)) {
          reasons.push(`skill[${index}] must be an object`);
          return;
        }
        if (skill.securityRequirements !== undefined) {
          inputs.push({
            scope: 'skill',
            skillId: readOptionalString(skill, 'id') ?? `skill[${index}]`,
            requirements: skill.securityRequirements,
          });
        }
      });
    }
  }

  return reasons.length > 0 ? { ok: false, reasons } : { ok: true, inputs };
}

function readRequirementSchemeNames(requirements: unknown): string[] {
  if (!Array.isArray(requirements)) {
    return [];
  }
  const schemeNames = new Set<string>();
  for (const requirement of requirements) {
    if (!isRecord(requirement)) {
      continue;
    }
    for (const schemeName of Object.keys(requirement)) {
      schemeNames.add(schemeName);
    }
  }
  return [...schemeNames].sort();
}

function readInterfaceAcceptedSchemeNames(
  agentCard: Record<string, unknown>,
  binding: Record<string, unknown>
): string[] {
  if (binding.securityRequirements !== undefined) {
    return readRequirementSchemeNames(binding.securityRequirements);
  }
  if (binding.security !== undefined) {
    return readRequirementSchemeNames(binding.security);
  }
  if (agentCard.securityRequirements !== undefined) {
    return readRequirementSchemeNames(agentCard.securityRequirements);
  }
  if (agentCard.security !== undefined) {
    return readRequirementSchemeNames(agentCard.security);
  }
  return [];
}

function collectCallableInterfaces(agentCard: Record<string, unknown>): Array<{
  bindingId: string;
  transport: string;
  url: string;
  protocolVersion: string | null;
  acceptedSchemeNames: string[];
}> {
  const interfaces: Array<{
    bindingId: string;
    transport: string;
    url: string;
    protocolVersion: string | null;
    acceptedSchemeNames: string[];
  }> = [];

  const appendInterface = (binding: Record<string, unknown>, bindingId: string) => {
    const url = readOptionalString(binding, 'url');
    if (url === undefined) {
      return;
    }
    interfaces.push({
      bindingId,
      transport:
        readOptionalString(binding, 'transport') ??
        readOptionalString(binding, 'type') ??
        readOptionalString(binding, 'protocol') ??
        readOptionalString(agentCard, 'preferredTransport') ??
        'unspecified',
      url,
      protocolVersion:
        readOptionalString(binding, 'protocolVersion') ??
        readOptionalString(binding, 'version') ??
        readOptionalString(agentCard, 'protocolVersion') ??
        null,
      acceptedSchemeNames: readInterfaceAcceptedSchemeNames(agentCard, binding),
    });
  };

  if (readOptionalString(agentCard, 'url') !== undefined) {
    appendInterface(agentCard, 'primary');
  }

  if (Array.isArray(agentCard.additionalInterfaces)) {
    agentCard.additionalInterfaces.forEach((binding, index) => {
      if (isRecord(binding)) {
        appendInterface(binding, `additionalInterfaces[${index}]`);
      }
    });
  }

  if (Array.isArray(agentCard.transportBindings)) {
    agentCard.transportBindings.forEach((binding, index) => {
      if (!isRecord(binding)) {
        return;
      }
      appendInterface(
        binding,
        readOptionalString(binding, 'id') ?? `transportBindings[${index}]`
      );
    });
  }

  return interfaces;
}

function readMcpServiceRegistryServerName(value: Record<string, unknown>): string | null {
  const explicitServer =
    readRequiredString(value.registryServer) ??
    readRequiredString(value.registryServerName) ??
    readRequiredString(value.serverName) ??
    readRequiredString(value.name);
  const namespace =
    readRequiredString(value.registryNamespace) ?? readRequiredString(value.namespace);
  const server = readRequiredString(value.server);
  if (explicitServer !== null && explicitServer.includes('/')) {
    return explicitServer;
  }
  if (namespace !== null && server !== null) {
    return `${namespace}/${server}`;
  }
  return explicitServer;
}

function readMcpServiceEndpointUrl(value: Record<string, unknown>): string | null {
  return (
    parseHttpsUrl(value.url) ??
    parseHttpsUrl(value.endpointUrl) ??
    parseHttpsUrl(value.remoteUrl) ??
    parseHttpsUrl(value.serviceUrl)
  );
}

function isMcpServiceCandidate(value: Record<string, unknown>): boolean {
  const markers = [value.protocol, value.transport, value.type, value.kind]
    .filter((marker): marker is string => typeof marker === 'string')
    .map((marker) => marker.toLowerCase());
  return (
    markers.some((marker) => marker.includes('mcp')) ||
    value.registryServer !== undefined ||
    value.registryServerName !== undefined ||
    value.registryNamespace !== undefined
  );
}

function appendMcpServicesFromArray(
  services: NormalizedA2aMcpServiceLink[],
  value: unknown,
  sourceName: string
): void {
  if (!Array.isArray(value)) {
    return;
  }
  value.forEach((service, index) => {
    if (!isRecord(service) || !isMcpServiceCandidate(service)) {
      return;
    }
    const endpointUrl = readMcpServiceEndpointUrl(service);
    const registryServerName = readMcpServiceRegistryServerName(service);
    if (endpointUrl === null || registryServerName === null) {
      return;
    }
    services.push({
      serviceId:
        readRequiredString(service.id) ??
        readRequiredString(service.serviceId) ??
        `${sourceName}[${index}]`,
      registryServerName,
      namespace: registryServerName.split('/')[0] ?? registryServerName,
      endpointUrl,
      endpointAuthority: new URL(endpointUrl).host,
    });
  });
}

function collectA2aMcpServiceLinks(
  agentCard: Record<string, unknown>
): NormalizedA2aMcpServiceLink[] {
  const services: NormalizedA2aMcpServiceLink[] = [];
  appendMcpServicesFromArray(services, agentCard.mcpServices, 'mcpServices');
  appendMcpServicesFromArray(services, agentCard.mcpServers, 'mcpServers');
  appendMcpServicesFromArray(services, agentCard.serviceLinks, 'serviceLinks');
  appendMcpServicesFromArray(services, agentCard.services, 'services');
  return services;
}

function normalizeMcpRegistryServers(value: unknown): NormalizedMcpRegistryServer[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const servers: NormalizedMcpRegistryServer[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) {
      continue;
    }
    const server = isRecord(entry.server) ? entry.server : entry;
    const name = readRequiredString(server.name);
    if (name === null) {
      continue;
    }
    const remoteUrls = Array.isArray(server.remotes)
      ? server.remotes.flatMap((remote) => {
          if (!isRecord(remote)) {
            return [];
          }
          const remoteUrl = parseHttpsUrl(remote.url);
          return remoteUrl === null ? [] : [remoteUrl];
        })
      : [];
    servers.push({
      name,
      namespace: name.split('/')[0] ?? name,
      remoteUrls: remoteUrls.sort(),
      remoteAuthorities: [...new Set(remoteUrls.map((url) => new URL(url).host))].sort(),
    });
  }
  return servers;
}

function normalizeMcpEndpointObservations(
  value: unknown
): NormalizedA2aMcpEndpointObservation[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const observations: NormalizedA2aMcpEndpointObservation[] = [];
  for (const observation of value) {
    if (!isRecord(observation)) {
      continue;
    }
    const requestedUrl =
      parseHttpsUrl(observation.requestedUrl) ?? parseHttpsUrl(observation.url);
    const finalUrl =
      parseHttpsUrl(observation.finalUrl) ?? parseHttpsUrl(observation.location);
    if (requestedUrl === null || finalUrl === null) {
      continue;
    }
    observations.push({
      serviceId: readRequiredString(observation.serviceId),
      requestedUrl,
      requestedAuthority: new URL(requestedUrl).host,
      finalUrl,
      finalAuthority: new URL(finalUrl).host,
    });
  }
  return observations;
}

function readExtensionUri(value: Record<string, unknown>): string | null {
  return (
    readRequiredString(value.uri) ??
    readRequiredString(value.extensionUri) ??
    readRequiredString(value.url)
  );
}

function readExtensionVersion(value: Record<string, unknown>): string | null {
  return readRequiredString(value.version) ?? readRequiredString(value.extensionVersion);
}

function normalizeA2aExtensions(value: unknown):
  | { ok: true; extensions: NormalizedA2aExtensionDeclaration[] }
  | { ok: false; reasons: string[] } {
  if (!Array.isArray(value)) {
    return { ok: false, reasons: ['Agent Card extensions must be an array'] };
  }
  const extensions: NormalizedA2aExtensionDeclaration[] = [];
  const reasons: string[] = [];
  value.forEach((extension, index) => {
    if (!isRecord(extension)) {
      reasons.push(`extensions[${index}] must be an object`);
      return;
    }
    const extensionUri = readExtensionUri(extension);
    const version = readExtensionVersion(extension);
    if (extensionUri === null || version === null) {
      reasons.push(`extensions[${index}] requires uri and version`);
      return;
    }
    extensions.push({
      extensionUri,
      version,
      required: extension.required === true,
    });
  });
  return reasons.length > 0 ? { ok: false, reasons } : { ok: true, extensions };
}

function readPromotionTier(value: unknown): A2aExtensionGovernancePromotionTier {
  return value === 'core' ||
    value === 'promoted' ||
    value === 'experimental' ||
    value === 'vendor' ||
    value === 'retired'
    ? value
    : 'unknown';
}

function readSupportPolicyVerdict(
  value: unknown
): A2aExtensionGovernanceSupportPolicyVerdict {
  return value === 'supported' || value === 'unpromoted' || value === 'retired'
    ? value
    : 'unknown';
}

function normalizeA2aExtensionGovernanceRegistry(
  value: unknown
): NormalizedA2aExtensionGovernanceEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((entry) => {
    if (!isRecord(entry)) {
      return [];
    }
    const extensionUri = readExtensionUri(entry);
    const version = readExtensionVersion(entry);
    const canonicalSpecUrl = parseHttpsUrl(entry.canonicalSpecUrl ?? entry.specUrl);
    const canonicalSpecDigest = readRequiredString(entry.canonicalSpecDigest);
    const observedAtDate = parseIsoDate(entry.observedAt);
    if (
      extensionUri === null ||
      version === null ||
      canonicalSpecUrl === null ||
      canonicalSpecDigest === null ||
      !/^[0-9a-f]{64}$/i.test(canonicalSpecDigest) ||
      observedAtDate === null
    ) {
      return [];
    }
    return [
      {
        extensionUri,
        version,
        canonicalSpecUrl,
        canonicalSpecDigest: canonicalSpecDigest.toLowerCase(),
        promotionTier: readPromotionTier(entry.promotionTier),
        observedAt: observedAtDate.toISOString(),
        supportPolicyVerdict: readSupportPolicyVerdict(entry.supportPolicyVerdict),
      },
    ];
  });
}

function buildExtensionGovernanceProbe(
  extension: NormalizedA2aExtensionDeclaration,
  registry: Map<string, NormalizedA2aExtensionGovernanceEntry>
): A2aExtensionGovernanceProbe {
  const evidence = registry.get(`${extension.extensionUri}\u0000${extension.version}`);
  const promotionTier = evidence?.promotionTier ?? 'unknown';
  const supportPolicyVerdict = evidence?.supportPolicyVerdict ?? 'unknown';
  const reasons: string[] = [];
  if (evidence === undefined) {
    reasons.push('extension governance provenance is unknown');
  }
  if (promotionTier !== 'core' && promotionTier !== 'promoted') {
    reasons.push('extension is not promoted into a stable governance tier');
  }
  if (supportPolicyVerdict !== 'supported') {
    reasons.push(`extension support policy verdict is ${supportPolicyVerdict}`);
  }
  return {
    extensionUri: extension.extensionUri,
    version: extension.version,
    required: extension.required,
    canonicalSpecUrl: evidence?.canonicalSpecUrl ?? null,
    canonicalSpecDigest: evidence?.canonicalSpecDigest ?? null,
    promotionTier,
    observedAt: evidence?.observedAt ?? null,
    supportPolicyVerdict,
    discoveryConfidence: {
      status: reasons.length === 0 ? 'full' : 'lowered',
      score: reasons.length === 0 ? 1 : extension.required ? 0.25 : 0.5,
      reasons,
    },
  };
}

function findMcpEndpointObservation(
  service: NormalizedA2aMcpServiceLink,
  observations: NormalizedA2aMcpEndpointObservation[]
): NormalizedA2aMcpEndpointObservation | undefined {
  return observations.find(
    (observation) =>
      observation.serviceId === service.serviceId ||
      observation.requestedUrl === service.endpointUrl
  );
}

async function buildA2aMcpServiceLinkReport(input: {
  agentCard: Record<string, unknown>;
  signature: Extract<A2aAgentCardSignatureVerdict, { ok: true }>;
  publicKey: unknown;
  registryServers?: unknown;
  endpointObservations?: unknown;
  now?: Date;
}): Promise<A2aAgentCardMcpServiceLinkReport | { invalid: string[] }> {
  const services = collectA2aMcpServiceLinks(input.agentCard);
  if (services.length === 0) {
    return { invalid: ['Agent Card must declare at least one MCP service link'] };
  }
  const registryServers = normalizeMcpRegistryServers(input.registryServers);
  if (registryServers.length === 0) {
    return { invalid: ['MCP Registry evidence must include at least one server'] };
  }
  const observations = normalizeMcpEndpointObservations(input.endpointObservations);
  const registryByName = new Map(
    registryServers.map((server) => [server.name, server] as const)
  );
  const probes: A2aAgentCardMcpServiceLinkProbe[] = services.map((service) => {
    const registryServer = registryByName.get(service.registryServerName);
    const observation = findMcpEndpointObservation(service, observations);
    const observedEndpointUrl = observation?.finalUrl ?? null;
    const observedEndpointAuthority = observation?.finalAuthority ?? null;
    const effectiveAuthority = observedEndpointAuthority ?? service.endpointAuthority;
    const reasons: string[] = [];
    let status: A2aAgentCardMcpServiceLinkStatus = 'linked';

    if (registryServer === undefined) {
      status = 'unregistered';
      reasons.push(
        `service ${service.serviceId} registry server ${service.registryServerName} is not registered`
      );
    } else if (!registryServer.remoteAuthorities.includes(effectiveAuthority)) {
      status = 'mismatched';
      reasons.push(
        `service ${service.serviceId} endpoint authority ${effectiveAuthority} is not declared by registry server ${registryServer.name}`
      );
    } else if (
      observation !== undefined &&
      observation.finalAuthority !== observation.requestedAuthority
    ) {
      status = 'redirected';
      reasons.push(
        `service ${service.serviceId} redirected from ${observation.requestedAuthority} to ${observation.finalAuthority}`
      );
    }

    return {
      serviceId: service.serviceId,
      registryServerName: service.registryServerName,
      namespace: service.namespace,
      declaredEndpointUrl: service.endpointUrl,
      observedEndpointUrl,
      declaredEndpointAuthority: service.endpointAuthority,
      observedEndpointAuthority,
      registryRemoteUrls: registryServer?.remoteUrls ?? [],
      registryEndpointAuthorities: registryServer?.remoteAuthorities ?? [],
      status,
      reasons,
    };
  });
  const reasons = probes.flatMap((probe) => probe.reasons);
  const payload = {
    kind: 'agentgram.a2a.agent-card.mcp-service-link-attestation-payload',
    signedAgentCardPayloadDigest: input.signature.payloadDigest,
    probes,
    verdictStatus: reasons.length === 0 ? 'linked' : 'review-required',
  };

  return {
    kind: 'agentgram.a2a.agent-card.mcp-service-link-attestation',
    generatedAt: (input.now ?? new Date()).toISOString(),
    signedAgentCardPayloadDigest: input.signature.payloadDigest,
    serviceCount: probes.length,
    linkedCount: probes.filter((probe) => probe.status === 'linked').length,
    redirectedCount: probes.filter((probe) => probe.status === 'redirected').length,
    mismatchedCount: probes.filter((probe) => probe.status === 'mismatched').length,
    unregisteredCount: probes.filter((probe) => probe.status === 'unregistered').length,
    probes,
    verdict: {
      status: reasons.length === 0 ? 'linked' : 'review-required',
      reasons,
    },
    signature: {
      status: 'verified',
      signingAlgorithm: 'ed25519',
      publicKey: String(input.publicKey).toLowerCase(),
      payloadDigest: await sha256Hex(canonicalJson(payload)),
    },
  };
}

function buildSkillAuthorizationInterfaceProbes(
  agentCard: Record<string, unknown>,
  requirementInputs: Array<{
    scope: 'agent-card' | 'skill';
    skillId: string | null;
    requirements: unknown;
  }>
): A2aSkillAuthorizationInterfaceProbe[] {
  const skillRequirements = requirementInputs.filter(
    (input) => input.scope === 'skill' && input.skillId !== null
  );
  if (skillRequirements.length === 0) {
    return [];
  }

  const callableInterfaces = collectCallableInterfaces(agentCard);
  const probes: A2aSkillAuthorizationInterfaceProbe[] = [];

  for (const inputRequirements of skillRequirements) {
    if (!Array.isArray(inputRequirements.requirements)) {
      continue;
    }
    inputRequirements.requirements.forEach((requirement, requirementIndex) => {
      const requiredSchemeNames = isRecord(requirement)
        ? Object.keys(requirement).sort()
        : [];
      if (callableInterfaces.length === 0) {
        probes.push({
          skillId: inputRequirements.skillId ?? 'unknown-skill',
          bindingId: null,
          transport: null,
          url: null,
          protocolVersion: null,
          requirementIndex,
          requiredSchemeNames,
          acceptedSchemeNames: [],
          status: 'rejected',
          reasons: ['skill securityRequirements cannot be probed without a callable AgentInterface URL'],
        });
        return;
      }

      for (const callableInterface of callableInterfaces) {
        const missingSchemeNames = requiredSchemeNames.filter(
          (schemeName) => !callableInterface.acceptedSchemeNames.includes(schemeName)
        );
        probes.push({
          skillId: inputRequirements.skillId ?? 'unknown-skill',
          bindingId: callableInterface.bindingId,
          transport: callableInterface.transport,
          url: callableInterface.url,
          protocolVersion: callableInterface.protocolVersion,
          requirementIndex,
          requiredSchemeNames,
          acceptedSchemeNames: callableInterface.acceptedSchemeNames,
          status: missingSchemeNames.length === 0 ? 'accepted' : 'rejected',
          reasons: missingSchemeNames.map(
            (schemeName) =>
              `callable interface does not accept required scheme "${schemeName}"`
          ),
        });
      }
    });
  }

  return probes;
}

async function buildSecurityRequirementReport(input: {
  agentCard: Record<string, unknown>;
  signature: Extract<A2aAgentCardSignatureVerdict, { ok: true }>;
  publicKey: unknown;
  now?: Date;
}): Promise<A2aSecurityRequirementSatisfiabilityReport | { invalid: string[] }> {
  const agentCard = input.agentCard;
  if (
    agentCard.securitySchemes !== undefined &&
    !isRecord(agentCard.securitySchemes)
  ) {
    return { invalid: ['Agent Card securitySchemes must be an object when present'] };
  }
  const requirementInputs = collectSecurityRequirementInputs(agentCard);
  if (!requirementInputs.ok) {
    return { invalid: requirementInputs.reasons };
  }

  const securitySchemes = isRecord(agentCard.securitySchemes)
    ? agentCard.securitySchemes
    : {};
  const probes: A2aSecurityRequirementProbe[] = [];
  let publicAccessDeclared = requirementInputs.inputs.length === 0;
  for (const inputRequirements of requirementInputs.inputs) {
    if (!Array.isArray(inputRequirements.requirements)) {
      return {
        invalid: [
          `${inputRequirements.scope}${
            inputRequirements.skillId === null ? '' : ` ${inputRequirements.skillId}`
          } securityRequirements must be an array`,
        ],
      };
    }
    inputRequirements.requirements.forEach((requirement, requirementIndex) => {
      if (!isRecord(requirement)) {
        probes.push({
          scope: inputRequirements.scope,
          skillId: inputRequirements.skillId,
          requirementIndex,
          schemeNames: [],
          status: 'unsatisfiable',
          reasons: ['security requirement must be an object'],
        });
        return;
      }
      const schemeNames = Object.keys(requirement).sort();
      if (schemeNames.length === 0) {
        publicAccessDeclared = true;
        probes.push({
          scope: inputRequirements.scope,
          skillId: inputRequirements.skillId,
          requirementIndex,
          schemeNames,
          status: 'satisfiable',
          reasons: [],
        });
        return;
      }

      const reasons: string[] = [];
      for (const schemeName of schemeNames) {
        const scopes = readSecurityRequirementScopes(requirement[schemeName]);
        if (scopes === null) {
          reasons.push(
            `security requirement "${schemeName}" scopes must be an array of strings`
          );
          continue;
        }
        if (!(schemeName in securitySchemes)) {
          reasons.push(
            `security requirement references missing scheme "${schemeName}"`
          );
          continue;
        }
        const schemeVerdict = validateSecurityScheme(
          schemeName,
          securitySchemes[schemeName]
        );
        reasons.push(...schemeVerdict.reasons);
        if (
          scopes.length > 0 &&
          schemeVerdict.kind !== 'oauth2SecurityScheme' &&
          schemeVerdict.kind !== 'openIdConnectSecurityScheme'
        ) {
          reasons.push(
            `security requirement "${schemeName}" declares scopes for a non-OAuth scheme`
          );
        }
        if (schemeVerdict.kind === 'oauth2SecurityScheme') {
          const availableScopes = collectOAuth2Scopes(
            securitySchemes[schemeName] as Record<string, unknown>
          );
          for (const scope of scopes) {
            if (!availableScopes.has(scope)) {
              reasons.push(
                `security requirement "${schemeName}" references undeclared OAuth2 scope "${scope}"`
              );
            }
          }
        }
      }
      probes.push({
        scope: inputRequirements.scope,
        skillId: inputRequirements.skillId,
        requirementIndex,
        schemeNames,
        status: reasons.length > 0 ? 'unsatisfiable' : 'satisfiable',
        reasons,
      });
    });
  }

  const unsatisfiableProbes = probes.filter(
    (probe) => probe.status === 'unsatisfiable'
  );
  const skillAuthorizationProbes = buildSkillAuthorizationInterfaceProbes(
    agentCard,
    requirementInputs.inputs
  );
  const rejectedSkillAuthorizationProbes = skillAuthorizationProbes.filter(
    (probe) => probe.status === 'rejected'
  );
  const skillAuthorizationReasons = rejectedSkillAuthorizationProbes.flatMap((probe) =>
    probe.reasons.map(
      (reason) =>
        `skill ${probe.skillId} interface ${probe.bindingId ?? 'missing'} requirement[${probe.requirementIndex}]: ${reason}`
    )
  );
  const reportReasons = unsatisfiableProbes.flatMap((probe) =>
    probe.reasons.map(
      (reason) =>
        `${probe.scope}${probe.skillId === null ? '' : ` ${probe.skillId}`} requirement[${probe.requirementIndex}]: ${reason}`
    )
  );
  const payload = {
    kind: 'agentgram.a2a.agent-card.security-requirement-satisfiability-payload',
    signedAgentCardPayloadDigest: input.signature.payloadDigest,
    securitySchemeNames: Object.keys(securitySchemes).sort(),
    probes,
    skillAuthorization: {
      probes: skillAuthorizationProbes,
      reasons: skillAuthorizationReasons,
    },
  };

  return {
    kind: 'agentgram.a2a.agent-card.security-requirement-satisfiability',
    generatedAt: (input.now ?? new Date()).toISOString(),
    signedAgentCardPayloadDigest: input.signature.payloadDigest,
    securitySchemeNames: Object.keys(securitySchemes).sort(),
    requirementCount: probes.length,
    satisfiableRequirementCount: probes.length - unsatisfiableProbes.length,
    unsatisfiableRequirementCount: unsatisfiableProbes.length,
    probes,
    skillAuthorization: {
      status:
        skillAuthorizationProbes.length === 0
          ? 'not-declared'
          : rejectedSkillAuthorizationProbes.length > 0
            ? 'rejected'
            : 'accepted',
      probeCount: skillAuthorizationProbes.length,
      acceptedProbeCount:
        skillAuthorizationProbes.length - rejectedSkillAuthorizationProbes.length,
      rejectedProbeCount: rejectedSkillAuthorizationProbes.length,
      probes: skillAuthorizationProbes,
      reasons: skillAuthorizationReasons,
    },
    satisfiability: {
      status:
        unsatisfiableProbes.length > 0 ||
        rejectedSkillAuthorizationProbes.length > 0
          ? 'unsatisfiable'
          : 'satisfiable',
      publicAccessDeclared,
      reasons: [...reportReasons, ...skillAuthorizationReasons],
    },
    signature: {
      status: 'verified',
      signingAlgorithm: 'ed25519',
      signatureDomain: A2A_SECURITY_REQUIREMENT_SATISFIABILITY_SIGNATURE_DOMAIN,
      publicKey: String(input.publicKey).toLowerCase(),
      payloadDigest: await sha256Hex(canonicalJson(payload)),
    },
  };
}

function base64UrlEncode(data: Uint8Array | string): string {
  const buffer =
    typeof data === 'string' ? Buffer.from(data, 'utf8') : Buffer.from(data);
  return buffer
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecodeToString(value: string): string | null {
  if (!BASE64URL_REGEX.test(value)) {
    return null;
  }
  try {
    const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), '=');
    return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(
      'utf8'
    );
  } catch {
    return null;
  }
}

function base64UrlDecodeToBytes(value: string): Uint8Array | null {
  if (!BASE64URL_REGEX.test(value)) {
    return null;
  }
  try {
    const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), '=');
    return new Uint8Array(
      Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
    );
  } catch {
    return null;
  }
}

function parseA2aAgentCardJwsProtectedHeader(
  encodedProtectedHeader: string
): A2aAgentCardJwsProtectedHeader | null {
  const decoded = base64UrlDecodeToString(encodedProtectedHeader);
  if (decoded === null) {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(decoded);
  } catch {
    return null;
  }
  if (!isRecord(parsed)) {
    return null;
  }
  if (
    parsed.alg !== A2A_AGENT_CARD_JWS_ALGORITHM ||
    typeof parsed.kid !== 'string' ||
    !PUBLIC_KEY_HEX_REGEX.test(parsed.kid)
  ) {
    return null;
  }
  if (parsed.crit !== undefined) {
    if (!Array.isArray(parsed.crit)) {
      return null;
    }
    for (const criticalHeader of parsed.crit) {
      if (criticalHeader !== A2A_AGENT_CARD_JWS_CRITICAL_RFC8785) {
        return null;
      }
    }
    if (parsed[A2A_AGENT_CARD_JWS_CRITICAL_RFC8785] !== true) {
      return null;
    }
  }
  return parsed as unknown as A2aAgentCardJwsProtectedHeader;
}

function buildA2aAgentCardMessage(agentCard: unknown): Uint8Array {
  return new TextEncoder().encode(
    A2A_AGENT_CARD_SIGNATURE_DOMAIN + canonicalJson(agentCard)
  );
}

export function buildA2aAgentCardCanonicalSignatureEvidence(
  options: { generatedAt?: string } = {}
): A2aAgentCardCanonicalSignatureEvidence {
  const canonicalFixture = canonicalJson(RFC8785_AGENT_CARD_FIXTURE);
  const isConformant =
    canonicalFixture === RFC8785_AGENT_CARD_FIXTURE_CANONICAL_JSON;

  return {
    kind: 'agentgram.a2a.agent-card.canonical-signature-gate',
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    canonicalization: {
      status: isConformant ? 'conformant' : 'failed',
      standard: 'RFC8785',
      fixture: {
        name: 'rfc8785-json-canonicalization-number-string-order',
        canonicalJson: canonicalFixture,
        digestAlgorithm: 'sha256',
        digest: isConformant
          ? RFC8785_AGENT_CARD_FIXTURE_DIGEST
          : 'fixture-conformance-failed',
      },
    },
    signature: {
      status: 'fail-closed',
      signingAlgorithm: 'ed25519',
      signatureDomain: A2A_AGENT_CARD_SIGNATURE_DOMAIN,
      jws: {
        algAllowlist: [A2A_AGENT_CARD_JWS_ALGORITHM],
        kidBinding: 'must-match-public-key',
        criticalHeaderAllowlist: [A2A_AGENT_CARD_JWS_CRITICAL_RFC8785],
        payloadBinding: 'protected-payload-must-equal-rfc8785-agent-card',
      },
      unsignedCardsAccepted: false,
      requiredFields: ['agentCard', 'publicKey', 'signature-or-jws'],
      failureModes: [
        'missing Agent Card payload',
        'missing or malformed Ed25519 public key',
        'missing or malformed Ed25519 signature or compact JWS',
        'JWS protected header alg outside allowlist',
        'JWS protected header kid mismatch',
        'JWS unknown critical header',
        'detached Agent Card substitution',
        'signature mismatch after RFC8785 canonicalization',
        'canonicalization fixture drift',
      ],
    },
  };
}

/**
 * Sign an A2A Agent Card over RFC8785-style canonical JSON. Client-side helper
 * (SDKs, tests); the public route verifies and fails closed.
 */
export async function signA2aAgentCard(
  secretKeyHex: string,
  agentCard: unknown
): Promise<string> {
  if (!SECRET_KEY_HEX_REGEX.test(secretKeyHex)) {
    throw new Error('Secret key must be 64 hex characters');
  }
  if (!isRecord(agentCard)) {
    throw new Error('A2A Agent Card payload must be a JSON object');
  }
  const signature = await ed25519.signAsync(
    buildA2aAgentCardMessage(agentCard),
    ed25519.etc.hexToBytes(secretKeyHex)
  );
  return ed25519.etc.bytesToHex(signature);
}

export async function signA2aAgentCardJws(
  secretKeyHex: string,
  kid: string,
  agentCard: unknown,
  protectedHeader: Partial<A2aAgentCardJwsProtectedHeader> = {}
): Promise<string> {
  if (!SECRET_KEY_HEX_REGEX.test(secretKeyHex)) {
    throw new Error('Secret key must be 64 hex characters');
  }
  if (!PUBLIC_KEY_HEX_REGEX.test(kid)) {
    throw new Error('A2A Agent Card JWS kid must be a 64 character public key');
  }
  if (!isRecord(agentCard)) {
    throw new Error('A2A Agent Card payload must be a JSON object');
  }
  if (
    protectedHeader.alg !== undefined &&
    protectedHeader.alg !== A2A_AGENT_CARD_JWS_ALGORITHM
  ) {
    throw new Error('A2A Agent Card JWS alg must be EdDSA');
  }
  const criticalHeaders = protectedHeader.crit ?? [
    A2A_AGENT_CARD_JWS_CRITICAL_RFC8785,
  ];
  for (const criticalHeader of criticalHeaders) {
    if (criticalHeader !== A2A_AGENT_CARD_JWS_CRITICAL_RFC8785) {
      throw new Error('Unsupported A2A Agent Card JWS critical header');
    }
  }

  const header: A2aAgentCardJwsProtectedHeader = {
    alg: A2A_AGENT_CARD_JWS_ALGORITHM,
    kid,
    crit: criticalHeaders,
    [A2A_AGENT_CARD_JWS_CRITICAL_RFC8785]: true,
  };
  const protectedPart = base64UrlEncode(JSON.stringify(header));
  const payloadPart = base64UrlEncode(canonicalJson(agentCard));
  const signingInput = `${protectedPart}.${payloadPart}`;
  const signature = await ed25519.signAsync(
    new TextEncoder().encode(signingInput),
    ed25519.etc.hexToBytes(secretKeyHex)
  );
  return `${signingInput}.${base64UrlEncode(signature)}`;
}

/**
 * Verify an A2A Agent Card signature. This gate is intentionally fail-closed:
 * unsigned cards, malformed keys/signatures, fixture drift, and tampering all
 * return a structured negative verdict instead of falling back to trust.
 */
export async function verifyA2aAgentCardSignature(input: {
  publicKey?: unknown;
  signature?: unknown;
  jws?: unknown;
  agentCard?: unknown;
}): Promise<A2aAgentCardSignatureVerdict> {
  const evidence = buildA2aAgentCardCanonicalSignatureEvidence();
  if (evidence.canonicalization.status !== 'conformant') {
    return {
      ok: false,
      code: 'RFC8785_CONFORMANCE_FAILED',
      message: 'A2A Agent Card canonicalization fixture does not match RFC8785',
      evidence,
    };
  }

  if (
    typeof input.publicKey !== 'string' ||
    !isRecord(input.agentCard)
  ) {
    return {
      ok: false,
      code: 'SIGNATURE_INVALID',
      message:
        'A2A Agent Card signatures require publicKey, signature, and agentCard',
      evidence,
    };
  }

  if (
    !PUBLIC_KEY_HEX_REGEX.test(input.publicKey) ||
    (typeof input.signature !== 'string' && typeof input.jws !== 'string')
  ) {
    return {
      ok: false,
      code: 'SIGNATURE_INVALID',
      message:
        'A2A Agent Card publicKey must be 64 hex characters and signature or compact JWS must be supplied',
      evidence,
    };
  }

  const canonicalPayload = canonicalJson(input.agentCard);

  if (typeof input.jws === 'string') {
    const parts = input.jws.split('.');
    if (parts.length !== 3) {
      return {
        ok: false,
        code: 'SIGNATURE_INVALID',
        message: 'A2A Agent Card JWS must use compact protected.payload.signature form',
        evidence,
      };
    }
    const [protectedPart, payloadPart, signaturePart] = parts;
    const header = parseA2aAgentCardJwsProtectedHeader(protectedPart);
    if (header === null) {
      return {
        ok: false,
        code: 'SIGNATURE_INVALID',
        message:
          'A2A Agent Card JWS protected header must allowlist EdDSA, public-key kid, and known critical headers',
        evidence,
      };
    }
    if (header.kid.toLowerCase() !== input.publicKey.toLowerCase()) {
      return {
        ok: false,
        code: 'SIGNATURE_INVALID',
        message: 'A2A Agent Card JWS kid must match the supplied public key',
        evidence,
      };
    }
    const jwsPayload = base64UrlDecodeToString(payloadPart);
    if (jwsPayload !== canonicalPayload) {
      return {
        ok: false,
        code: 'SIGNATURE_INVALID',
        message:
          'A2A Agent Card JWS payload must equal the supplied RFC8785 canonical Agent Card',
        evidence,
      };
    }
    const jwsSignature = base64UrlDecodeToBytes(signaturePart);
    let validJws = false;
    try {
      validJws =
        jwsSignature !== null &&
        (await ed25519.verifyAsync(
          jwsSignature,
          new TextEncoder().encode(`${protectedPart}.${payloadPart}`),
          ed25519.etc.hexToBytes(input.publicKey)
        ));
    } catch {
      validJws = false;
    }
    if (!validJws) {
      return {
        ok: false,
        code: 'SIGNATURE_INVALID',
        message:
          'A2A Agent Card JWS signature does not match the protected header and canonical payload',
        evidence,
      };
    }
    return {
      ok: true,
      canonicalJson: canonicalPayload,
      payloadDigest: await sha256Hex(canonicalPayload),
      jwsProtectedHeader: header,
      evidence,
    };
  }

  if (typeof input.signature !== 'string' || !SIGNATURE_HEX_REGEX.test(input.signature)) {
    return {
      ok: false,
      code: 'SIGNATURE_INVALID',
      message:
        'A2A Agent Card signature must be 128 hex characters when compact JWS is not supplied',
      evidence,
    };
  }

  let valid = false;
  try {
    valid = await ed25519.verifyAsync(
      ed25519.etc.hexToBytes(input.signature),
      buildA2aAgentCardMessage(input.agentCard),
      ed25519.etc.hexToBytes(input.publicKey)
    );
  } catch {
    valid = false;
  }

  if (!valid) {
    return {
      ok: false,
      code: 'SIGNATURE_INVALID',
      message:
        'A2A Agent Card signature does not match the supplied public key and canonical payload',
      evidence,
    };
  }

  return {
    ok: true,
    canonicalJson: canonicalPayload,
    payloadDigest: await sha256Hex(canonicalPayload),
    evidence,
  };
}

/**
 * Verify a signed A2A Agent Card and attest that every declared transport
 * binding exposes equivalent task semantics and authentication behavior. This
 * is intentionally a signed-card probe rather than an optimistic URL list: a
 * binding is compared only after the compact JWS/signature binds the Agent
 * Card payload, and any semantic/auth mismatch returns a negative verdict.
 */
export async function attestA2aAgentCardTransportBindingParity(input: {
  publicKey?: unknown;
  signature?: unknown;
  jws?: unknown;
  agentCard?: unknown;
}): Promise<A2aAgentCardTransportBindingParityVerdict> {
  const signature = await verifyA2aAgentCardSignature(input);
  if (!signature.ok) {
    return {
      ok: false,
      code: 'SIGNATURE_INVALID',
      message:
        'A2A Agent Card transport-binding parity requires a valid signed Agent Card',
      signature,
    };
  }

  if (!isRecord(input.agentCard)) {
    return {
      ok: false,
      code: 'SIGNATURE_INVALID',
      message:
        'A2A Agent Card transport-binding parity requires an Agent Card object',
      signature,
    };
  }

  const bindings = normalizeTransportBindings(input.agentCard);
  const probes = await Promise.all(
    bindings.map(async (binding) => ({
      bindingId: binding.bindingId,
      transport: binding.transport,
      url: binding.url,
      taskSemanticsDigest: await sha256Hex(canonicalJson(binding.taskSemantics)),
      authBehaviorDigest: await sha256Hex(canonicalJson(binding.authBehavior)),
    }))
  );
  const baseline = probes[0];
  const divergences: A2aAgentCardTransportBindingDivergence[] = [];

  if (baseline !== undefined) {
    for (const probe of probes.slice(1)) {
      if (probe.taskSemanticsDigest !== baseline.taskSemanticsDigest) {
        divergences.push({
          bindingId: probe.bindingId,
          kind: 'task-semantics',
          expectedDigest: baseline.taskSemanticsDigest,
          actualDigest: probe.taskSemanticsDigest,
        });
      }
      if (probe.authBehaviorDigest !== baseline.authBehaviorDigest) {
        divergences.push({
          bindingId: probe.bindingId,
          kind: 'auth-behavior',
          expectedDigest: baseline.authBehaviorDigest,
          actualDigest: probe.authBehaviorDigest,
        });
      }
    }
  }

  const parity: A2aAgentCardTransportBindingParityReport = {
    kind: 'agentgram.a2a.agent-card.transport-binding-parity',
    signedAgentCardPayloadDigest: signature.payloadDigest,
    status:
      divergences.length > 0
        ? 'diverged'
        : probes.length > 1
          ? 'equivalent'
          : 'single-binding',
    bindingCount: probes.length,
    probes,
    divergences,
  };

  if (divergences.length > 0) {
    return {
      ok: false,
      code: 'BINDING_PARITY_DIVERGED',
      message:
        'A2A Agent Card transport bindings diverge on task semantics or authentication behavior',
      parity,
      signature,
    };
  }

  return { ok: true, parity, signature };
}

function readOptionalHeaderString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

function readRequiredString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

function readSafeNonNegativeInteger(value: unknown): number | null {
  return Number.isSafeInteger(value) && (value as number) >= 0
    ? (value as number)
    : null;
}

function normalizeA2aTaskHistoryRetentionMetadata(input: {
  taskId?: unknown;
  taskVersion?: unknown;
  cardVersion?: unknown;
  requestedHistoryLength?: unknown;
  returnedHistory?: unknown;
  truncationReason?: unknown;
}): A2aTaskHistoryRetentionMetadata | null {
  const taskId = readRequiredString(input.taskId);
  const taskVersion = readRequiredString(input.taskVersion);
  const cardVersion = readRequiredString(input.cardVersion);
  const requestedHistoryLength = readSafeNonNegativeInteger(
    input.requestedHistoryLength
  );
  if (
    taskId === null ||
    taskVersion === null ||
    cardVersion === null ||
    requestedHistoryLength === null ||
    !Array.isArray(input.returnedHistory)
  ) {
    return null;
  }

  return {
    taskId,
    taskVersion,
    cardVersion,
    requestedHistoryLength,
    returnedHistoryLength: input.returnedHistory.length,
    returnedHistoryDigest: '',
    truncationReason: readOptionalHeaderString(input.truncationReason),
  };
}

function buildA2aTaskHistoryRetentionPayloadFromMetadata(
  metadata: A2aTaskHistoryRetentionMetadata
): A2aTaskHistoryRetentionPayload {
  return {
    kind: 'agentgram.a2a.task-history.retention-attestation-payload',
    taskId: metadata.taskId,
    taskVersion: metadata.taskVersion,
    cardVersion: metadata.cardVersion,
    requestedHistoryLength: metadata.requestedHistoryLength,
    returnedHistoryLength: metadata.returnedHistoryLength,
    returnedHistoryDigest: metadata.returnedHistoryDigest,
    truncationReason: metadata.truncationReason,
  };
}

function readAuthorizationState(
  value: unknown
): A2aExtendedAgentCardAuthorizationState | null {
  return value === 'public' || value === 'authenticated' || value === 'expired'
    ? value
    : null;
}

function readExtendedCapabilityMaterial(
  retrieval: A2aExtendedAgentCardAuthorizationTransitionInput
): unknown {
  if (retrieval.extendedCapabilities !== undefined) {
    return retrieval.extendedCapabilities;
  }
  if (retrieval.authenticatedExtendedCard !== undefined) {
    return retrieval.authenticatedExtendedCard;
  }
  if (retrieval.extendedAgentCard !== undefined) {
    return retrieval.extendedAgentCard;
  }
  if (isRecord(retrieval.agentCard)) {
    return (
      retrieval.agentCard.authenticatedExtendedCard ??
      retrieval.agentCard.extendedAgentCard ??
      retrieval.agentCard.extendedCapabilities
    );
  }
  return undefined;
}

function hasExtendedCapabilityMaterial(value: unknown): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (isRecord(value)) {
    return Object.keys(value).length > 0;
  }
  return true;
}

function parseIsoDate(value: unknown): Date | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseHttpsUrl(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function parseCacheMaxAgeSeconds(cacheControl: string | null): number | null {
  if (cacheControl === null) {
    return null;
  }
  const maxAge = cacheControl
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .find((part) => part.startsWith('max-age='));
  if (maxAge === undefined) {
    return null;
  }
  const seconds = Number(maxAge.slice('max-age='.length));
  return Number.isSafeInteger(seconds) && seconds >= 0 ? seconds : null;
}

function secondsBetween(later: Date, earlier: Date): number {
  return Math.floor((later.getTime() - earlier.getTime()) / 1000);
}

/**
 * Verify a signed A2A Agent Card and export retrieval freshness evidence. The
 * report binds ETag/Last-Modified/Cache-Control/fetch-time metadata to the
 * Ed25519-verified payload digest so discovery clients can reject valid-but-
 * stale cards before showing trust UI.
 */
export async function attestA2aAgentCardRetrievalFreshness(input: {
  agentCardUrl?: unknown;
  agentCard?: unknown;
  publicKey?: unknown;
  signature?: unknown;
  jws?: unknown;
  fetchedAt?: unknown;
  etag?: unknown;
  lastModified?: unknown;
  cacheControl?: unknown;
  signatureKeyVersion?: unknown;
  now?: Date;
  maxEvidenceAgeMs?: number;
}): Promise<A2aAgentCardRetrievalFreshnessVerdict> {
  const signature = await verifyA2aAgentCardSignature(input);
  if (!signature.ok) {
    return {
      ok: false,
      code: 'SIGNATURE_INVALID',
      message:
        'A2A Agent Card retrieval freshness requires a valid signed Agent Card',
      signature,
    };
  }

  const agentCardUrl = parseHttpsUrl(input.agentCardUrl);
  const fetchedAt = parseIsoDate(input.fetchedAt);
  if (agentCardUrl === null || fetchedAt === null) {
    return {
      ok: false,
      code: 'RETRIEVAL_METADATA_INVALID',
      message:
        'A2A Agent Card retrieval freshness requires an HTTPS agentCardUrl and ISO fetchedAt timestamp',
      signature,
    };
  }

  const now = input.now ?? new Date();
  const maxEvidenceAgeMs =
    typeof input.maxEvidenceAgeMs === 'number' && input.maxEvidenceAgeMs > 0
      ? input.maxEvidenceAgeMs
      : A2A_AGENT_CARD_RETRIEVAL_FRESHNESS_WINDOW_MS;
  const etag = readOptionalHeaderString(input.etag);
  const lastModified = readOptionalHeaderString(input.lastModified);
  const cacheControl = readOptionalHeaderString(input.cacheControl);
  const cacheMaxAgeSeconds = parseCacheMaxAgeSeconds(cacheControl);
  const fetchAgeSeconds = secondsBetween(now, fetchedAt);
  const lastModifiedAt = parseIsoDate(lastModified);
  const lastModifiedAgeSeconds =
    lastModifiedAt === null ? null : secondsBetween(now, lastModifiedAt);
  const maxEvidenceAgeSeconds = Math.floor(maxEvidenceAgeMs / 1000);
  const hasValidator = etag !== null || lastModified !== null;
  const reasons: string[] = [];

  if (fetchAgeSeconds < 0) {
    reasons.push('fetchedAt is in the future');
  }
  if (fetchAgeSeconds > maxEvidenceAgeSeconds) {
    reasons.push('retrieval evidence exceeds the freshness window');
  }
  if (cacheMaxAgeSeconds !== null && fetchAgeSeconds > cacheMaxAgeSeconds) {
    reasons.push('retrieval evidence exceeds Cache-Control max-age');
  }
  if (!hasValidator) {
    reasons.push('ETag or Last-Modified validator is required for cache replay');
  }
  if (lastModified !== null && lastModifiedAt === null) {
    reasons.push('Last-Modified header is not a parseable HTTP timestamp');
  }

  const stale = reasons.some(
    (reason) =>
      reason === 'retrieval evidence exceeds the freshness window' ||
      reason === 'retrieval evidence exceeds Cache-Control max-age'
  );
  const status: A2aAgentCardRetrievalFreshnessStatus = stale
    ? 'stale'
    : reasons.length > 0
      ? 'indeterminate'
      : 'fresh';
  const staleCacheVerdict: A2aAgentCardStaleCacheVerdict = stale
    ? 'reject'
    : status === 'fresh'
      ? 'accept'
      : 'review';

  const freshness: A2aAgentCardRetrievalFreshnessReport = {
    kind: 'agentgram.a2a.agent-card.retrieval-freshness',
    generatedAt: now.toISOString(),
    agentCardUrl,
    signedAgentCardPayloadDigest: signature.payloadDigest,
    retrieval: {
      fetchedAt: fetchedAt.toISOString(),
      etag,
      lastModified,
      cacheControl,
    },
    signature: {
      status: 'verified',
      signingAlgorithm: 'ed25519',
      publicKey: String(input.publicKey).toLowerCase(),
      keyVersion: readOptionalHeaderString(input.signatureKeyVersion),
    },
    freshness: {
      status,
      staleCacheVerdict,
      maxEvidenceAgeSeconds,
      fetchAgeSeconds: fetchAgeSeconds < 0 ? null : fetchAgeSeconds,
      cacheMaxAgeSeconds,
      lastModifiedAgeSeconds:
        lastModifiedAgeSeconds === null || lastModifiedAgeSeconds < 0
          ? null
          : lastModifiedAgeSeconds,
      validators: {
        etag: etag !== null,
        lastModified: lastModified !== null,
      },
      reasons,
    },
  };

  if (stale) {
    return {
      ok: false,
      code: 'AGENT_CARD_STALE',
      message:
        'A2A Agent Card retrieval evidence is stale and should not be trusted for discovery display',
      freshness,
      signature,
    };
  }

  return { ok: true, freshness, signature };
}

/**
 * Verify a signed A2A Agent Card and attest that every Card-declared MCP
 * service link resolves to the same MCP Registry namespace/server and HTTPS
 * remote endpoint authority. Linked, redirected, mismatched, and unregistered
 * verdicts are bound to the signed Agent Card payload digest for external
 * discovery evidence.
 */
export async function attestA2aAgentCardMcpServiceLink(input: {
  agentCard?: unknown;
  publicKey?: unknown;
  signature?: unknown;
  jws?: unknown;
  registryServers?: unknown;
  endpointObservations?: unknown;
  now?: Date;
}): Promise<A2aAgentCardMcpServiceLinkVerdict> {
  const signature = await verifyA2aAgentCardSignature(input);
  if (!signature.ok) {
    return {
      ok: false,
      code: 'SIGNATURE_INVALID',
      message:
        'A2A Agent Card MCP service-link attestation requires a valid signed Agent Card',
      signature,
    };
  }

  if (!isRecord(input.agentCard)) {
    return {
      ok: false,
      code: 'MCP_SERVICE_LINKS_INVALID',
      message:
        'A2A Agent Card MCP service-link attestation requires an Agent Card object',
      signature,
    };
  }

  const serviceLink = await buildA2aMcpServiceLinkReport({
    agentCard: input.agentCard,
    publicKey: input.publicKey,
    signature,
    registryServers: input.registryServers,
    endpointObservations: input.endpointObservations,
    now: input.now,
  });
  if ('invalid' in serviceLink) {
    return {
      ok: false,
      code: 'MCP_SERVICE_LINKS_INVALID',
      message: serviceLink.invalid.join('; '),
      signature,
    };
  }
  if (serviceLink.verdict.status === 'review-required') {
    return {
      ok: false,
      code: 'MCP_SERVICE_LINK_REVIEW_REQUIRED',
      message:
        'A2A Agent Card declares MCP service links that are redirected, mismatched, or unregistered in the MCP Registry evidence',
      serviceLink,
      signature,
    };
  }

  return { ok: true, serviceLink, signature };
}

/**
 * Verify a signed A2A Agent Card and attest each declared AgentExtension against
 * governance provenance. Each URI/version is bound to a canonical spec
 * URL/digest, promotion tier, observation time, and support-policy verdict so
 * discovery clients can lower confidence for unknown, unpromoted, or retired
 * extension claims instead of presenting them as core interoperable capability.
 */
export async function attestA2aAgentCardExtensionGovernance(input: {
  agentCard?: unknown;
  publicKey?: unknown;
  signature?: unknown;
  jws?: unknown;
  governanceRegistry?: unknown;
  now?: Date;
}): Promise<A2aExtensionGovernanceVerdict> {
  const signature = await verifyA2aAgentCardSignature(input);
  if (!signature.ok) {
    return {
      ok: false,
      code: 'SIGNATURE_INVALID',
      message:
        'A2A extension governance attestation requires a valid signed Agent Card',
      signature,
    };
  }

  if (!isRecord(input.agentCard)) {
    return {
      ok: false,
      code: 'EXTENSIONS_INVALID',
      message: 'A2A extension governance attestation requires an Agent Card object',
      signature,
    };
  }
  const normalizedExtensions = normalizeA2aExtensions(input.agentCard.extensions);
  if (!normalizedExtensions.ok) {
    return {
      ok: false,
      code: 'EXTENSIONS_INVALID',
      message: normalizedExtensions.reasons.join('; '),
      signature,
    };
  }

  const registry = new Map(
    normalizeA2aExtensionGovernanceRegistry(input.governanceRegistry).map((entry) =>
      [`${entry.extensionUri}\u0000${entry.version}`, entry] as const
    )
  );
  const probes = normalizedExtensions.extensions.map((extension) =>
    buildExtensionGovernanceProbe(extension, registry)
  );
  const loweredProbes = probes.filter(
    (probe) => probe.discoveryConfidence.status === 'lowered'
  );
  const requiredUnsupportedProbes = loweredProbes.filter((probe) => probe.required);
  const reasons = loweredProbes.flatMap((probe) =>
    probe.discoveryConfidence.reasons.map(
      (reason) => `extension ${probe.extensionUri}@${probe.version}: ${reason}`
    )
  );
  const verdictStatus: A2aExtensionGovernanceReport['verdict']['status'] =
    requiredUnsupportedProbes.length > 0
      ? 'unsupported-required'
      : loweredProbes.length > 0
        ? 'lowered-confidence'
        : 'supported';
  const payload = {
    kind: 'agentgram.a2a.agent-card.extension-governance-provenance-attestation-payload',
    signedAgentCardPayloadDigest: signature.payloadDigest,
    probes,
    verdictStatus,
  };
  const governance: A2aExtensionGovernanceReport = {
    kind: 'agentgram.a2a.agent-card.extension-governance-provenance-attestation',
    generatedAt: (input.now ?? new Date()).toISOString(),
    signedAgentCardPayloadDigest: signature.payloadDigest,
    extensionCount: probes.length,
    supportedCount: probes.length - loweredProbes.length,
    loweredCount: loweredProbes.length,
    requiredUnsupportedCount: requiredUnsupportedProbes.length,
    probes,
    verdict: {
      status: verdictStatus,
      reasons,
    },
    signature: {
      status: 'verified',
      signingAlgorithm: 'ed25519',
      signatureDomain: A2A_EXTENSION_GOVERNANCE_SIGNATURE_DOMAIN,
      publicKey: String(input.publicKey).toLowerCase(),
      payloadDigest: await sha256Hex(canonicalJson(payload)),
    },
  };

  if (requiredUnsupportedProbes.length > 0) {
    return {
      ok: false,
      code: 'EXTENSION_GOVERNANCE_UNSUPPORTED',
      message:
        'A2A Agent Card declares required extensions with unknown, unpromoted, or retired governance provenance',
      governance,
      signature,
    };
  }
  if (loweredProbes.length > 0) {
    return {
      ok: false,
      code: 'EXTENSION_GOVERNANCE_CONFIDENCE_LOWERED',
      message:
        'A2A Agent Card declares optional extensions with unknown, unpromoted, or retired governance provenance; discovery confidence was lowered',
      governance,
      signature,
    };
  }

  return { ok: true, governance, signature };
}

/**
 * Verify a signed base A2A Agent Card and attest that a discovery client clears
 * authenticated Extended Agent Card material when authorization weakens or a
 * session expires. The report binds every public/authenticated/public retrieval
 * transition to the same session id, card version, and disclosure digest so a
 * cached authenticated card cannot bleed privileged capabilities back into a
 * public discovery view.
 */
export async function attestA2aExtendedAgentCardAuthorizationDowngrade(input: {
  agentCard?: unknown;
  publicKey?: unknown;
  signature?: unknown;
  jws?: unknown;
  sessionId?: unknown;
  cardVersion?: unknown;
  disclosureDigest?: unknown;
  transitions?: unknown;
  now?: Date;
}): Promise<A2aExtendedAgentCardAuthorizationDowngradeVerdict> {
  const signature = await verifyA2aAgentCardSignature(input);
  if (!signature.ok) {
    return {
      ok: false,
      code: 'SIGNATURE_INVALID',
      message:
        'A2A Extended Agent Card authorization-downgrade clearance requires a valid signed base Agent Card',
      signature,
    };
  }

  const sessionId = readRequiredString(input.sessionId);
  const cardVersion = readRequiredString(input.cardVersion);
  const disclosureDigest = readRequiredString(input.disclosureDigest);
  if (
    sessionId === null ||
    cardVersion === null ||
    disclosureDigest === null ||
    !/^[0-9a-f]{64}$/i.test(disclosureDigest) ||
    !Array.isArray(input.transitions) ||
    input.transitions.length < 3
  ) {
    return {
      ok: false,
      code: 'AUTHORIZATION_TRANSITIONS_INVALID',
      message:
        'A2A Extended Agent Card clearance requires sessionId, cardVersion, 64-hex disclosureDigest, and at least public→authenticated→weakened transitions',
      signature,
    };
  }

  const reasons: string[] = [];
  let authenticatedDisclosureObserved = false;
  let authenticatedSeen = false;
  let weakenedAuthorizationObserved = false;

  const probes = await Promise.all(
    input.transitions.map(async (transition, index) => {
      const record = isRecord(transition) ? transition : {};
      const authorization = readAuthorizationState(record.authorization);
      const transitionSessionId = readRequiredString(record.sessionId);
      const transitionCardVersion = readRequiredString(record.cardVersion);
      const transitionDisclosureDigest = readOptionalHeaderString(
        record.disclosureDigest
      );
      const extendedMaterial = readExtendedCapabilityMaterial(record);
      const hasExtendedMaterial = hasExtendedCapabilityMaterial(extendedMaterial);

      if (authorization === null) {
        reasons.push(`transition[${index}] has invalid authorization state`);
      }
      if (transitionSessionId !== sessionId) {
        reasons.push(`transition[${index}] session id does not match`);
      }
      if (transitionCardVersion !== cardVersion) {
        reasons.push(`transition[${index}] card version does not match`);
      }
      if (authorization === 'authenticated') {
        authenticatedSeen = true;
        if (transitionDisclosureDigest === disclosureDigest && hasExtendedMaterial) {
          authenticatedDisclosureObserved = true;
        } else {
          reasons.push(
            `transition[${index}] authenticated retrieval is not bound to disclosure digest and extended capabilities`
          );
        }
      }
      if (
        authenticatedSeen &&
        (authorization === 'public' || authorization === 'expired')
      ) {
        weakenedAuthorizationObserved = true;
        if (transitionDisclosureDigest !== null) {
          reasons.push(
            `transition[${index}] weakened retrieval retained authenticated disclosure digest`
          );
        }
        if (hasExtendedMaterial) {
          reasons.push(
            `transition[${index}] weakened retrieval retained extended capabilities`
          );
        }
      }

      return {
        phase:
          readRequiredString(record.phase) ??
          `${authorization ?? 'invalid'}-${index}`,
        authorization: authorization ?? 'public',
        sessionId: transitionSessionId ?? '',
        cardVersion: transitionCardVersion ?? '',
        disclosureDigest: transitionDisclosureDigest,
        extendedCapabilitiesDigest: hasExtendedMaterial
          ? await sha256Hex(canonicalJson(extendedMaterial))
          : null,
        clearedExtendedCapabilities: !hasExtendedMaterial,
        fetchedAt: readOptionalHeaderString(record.fetchedAt),
      } satisfies A2aExtendedAgentCardAuthorizationTransitionProbe;
    })
  );

  if (!authenticatedDisclosureObserved) {
    reasons.push('authenticated extended disclosure was not observed');
  }
  if (!weakenedAuthorizationObserved) {
    reasons.push('no public or expired retrieval after authenticated disclosure');
  }

  const leaked = reasons.some(
    (reason) =>
      reason.includes('retained authenticated disclosure digest') ||
      reason.includes('retained extended capabilities')
  );
  const status =
    leaked ? 'leaked' : reasons.length > 0 ? 'indeterminate' : 'cleared';
  const clearance: A2aExtendedAgentCardAuthorizationDowngradeReport = {
    kind: 'agentgram.a2a.extended-agent-card.authorization-downgrade-cache-clearance',
    generatedAt: (input.now ?? new Date()).toISOString(),
    signedAgentCardPayloadDigest: signature.payloadDigest,
    sessionId,
    cardVersion,
    disclosureDigest: disclosureDigest.toLowerCase(),
    transitions: probes,
    downgrade: {
      status,
      authenticatedDisclosureObserved,
      weakenedAuthorizationObserved,
      reasons,
    },
  };

  if (status === 'leaked') {
    return {
      ok: false,
      code: 'EXTENDED_CAPABILITIES_CACHE_LEAK',
      message:
        'A2A Extended Agent Card cache retained authenticated capabilities after authorization weakened or expired',
      clearance,
      signature,
    };
  }
  if (status === 'indeterminate') {
    return {
      ok: false,
      code: 'AUTHORIZATION_TRANSITIONS_INVALID',
      message:
        'A2A Extended Agent Card authorization transitions do not prove public→authenticated→weakened cache clearance',
      clearance,
      signature,
    };
  }

  return { ok: true, clearance, signature };
}

/**
 * Verify a signed A2A Agent Card and attest that every declared Agent Card and
 * skill-level security requirement is satisfiable from the declared
 * securitySchemes. The verifier follows OpenAPI/A2A security semantics: each
 * requirement object is an AND of named schemes, the requirements array is an
 * OR list, and an empty requirement object is an explicit public alternative.
 */
export async function attestA2aSecurityRequirementSatisfiability(input: {
  agentCard?: unknown;
  publicKey?: unknown;
  signature?: unknown;
  jws?: unknown;
  now?: Date;
}): Promise<A2aSecurityRequirementSatisfiabilityVerdict> {
  const signature = await verifyA2aAgentCardSignature(input);
  if (!signature.ok) {
    return {
      ok: false,
      code: 'SIGNATURE_INVALID',
      message:
        'A2A security-requirement satisfiability requires a valid signed Agent Card',
      signature,
    };
  }

  if (!isRecord(input.agentCard)) {
    return {
      ok: false,
      code: 'SECURITY_REQUIREMENTS_INVALID',
      message:
        'A2A security-requirement satisfiability requires an Agent Card object',
      signature,
    };
  }

  const report = await buildSecurityRequirementReport({
    agentCard: input.agentCard,
    publicKey: input.publicKey,
    signature,
    now: input.now,
  });
  if ('invalid' in report) {
    return {
      ok: false,
      code: 'SECURITY_REQUIREMENTS_INVALID',
      message: report.invalid.join('; '),
      signature,
    };
  }
  if (report.satisfiability.status === 'unsatisfiable') {
    return {
      ok: false,
      code: 'SECURITY_REQUIREMENTS_UNSATISFIABLE',
      message:
        'A2A Agent Card declares security requirements that cannot be satisfied from its securitySchemes',
      satisfiability: report,
      signature,
    };
  }

  return { ok: true, satisfiability: report, signature };
}

async function buildA2aTaskHistoryRetentionMetadata(input: {
  taskId?: unknown;
  taskVersion?: unknown;
  cardVersion?: unknown;
  requestedHistoryLength?: unknown;
  returnedHistory?: unknown;
  truncationReason?: unknown;
}): Promise<A2aTaskHistoryRetentionMetadata | null> {
  const metadata = normalizeA2aTaskHistoryRetentionMetadata(input);
  if (metadata === null || !Array.isArray(input.returnedHistory)) {
    return null;
  }
  return {
    ...metadata,
    returnedHistoryDigest: await sha256Hex(canonicalJson(input.returnedHistory)),
  };
}

export async function buildA2aTaskHistoryRetentionVerifierFixture(): Promise<A2aTaskHistoryRetentionVerifierFixture> {
  const payload: A2aTaskHistoryRetentionPayload = {
    kind: 'agentgram.a2a.task-history.retention-attestation-payload',
    taskId: 'task-weather-42',
    taskVersion: 'task-v7',
    cardVersion: 'card-v3',
    requestedHistoryLength: 5,
    returnedHistoryLength: 3,
    returnedHistoryDigest: await sha256Hex(
      canonicalJson([
        { id: 'event-1', role: 'user', digest: 'a'.repeat(64) },
        { id: 'event-2', role: 'agent', digest: 'b'.repeat(64) },
        { id: 'event-3', role: 'tool', digest: 'c'.repeat(64) },
      ])
    ),
    truncationReason: 'server-retention-policy',
  };
  const fixtureCanonicalJson = canonicalJson(payload);
  return {
    name: 'a2a-task-history-retention-requested-vs-returned',
    canonicalJson: fixtureCanonicalJson,
    digestAlgorithm: 'sha256',
    digest: await sha256Hex(fixtureCanonicalJson),
    payload,
  };
}

export async function buildA2aTaskHistoryRetentionPayload(input: {
  taskId?: unknown;
  taskVersion?: unknown;
  cardVersion?: unknown;
  requestedHistoryLength?: unknown;
  returnedHistory?: unknown;
  truncationReason?: unknown;
}): Promise<A2aTaskHistoryRetentionPayload> {
  const metadata = await buildA2aTaskHistoryRetentionMetadata(input);
  if (metadata === null) {
    throw new Error(
      'A2A task-history retention attestation requires taskId, taskVersion, cardVersion, requestedHistoryLength, and returnedHistory[]'
    );
  }
  return buildA2aTaskHistoryRetentionPayloadFromMetadata(metadata);
}

export async function signA2aTaskHistoryRetentionAttestation(
  secretKeyHex: string,
  input: {
    taskId?: unknown;
    taskVersion?: unknown;
    cardVersion?: unknown;
    requestedHistoryLength?: unknown;
    returnedHistory?: unknown;
    truncationReason?: unknown;
  }
): Promise<string> {
  if (!SECRET_KEY_HEX_REGEX.test(secretKeyHex)) {
    throw new Error('Secret key must be 64 hex characters');
  }
  const payload = await buildA2aTaskHistoryRetentionPayload(input);
  const signature = await ed25519.signAsync(
    encodeMessage(A2A_TASK_HISTORY_RETENTION_SIGNATURE_DOMAIN, payload),
    ed25519.etc.hexToBytes(secretKeyHex)
  );
  return ed25519.etc.bytesToHex(signature);
}

/**
 * Verify a signed A2A task-history retention transcript. The report binds the
 * requested history length, returned history length/digest, task version, Agent
 * Card version, and truncation reason so clients can reject non-reproducible
 * audit trails instead of silently trusting shortened task history.
 */
export async function attestA2aTaskHistoryRetention(input: {
  agentCard?: unknown;
  publicKey?: unknown;
  signature?: unknown;
  jws?: unknown;
  taskId?: unknown;
  taskVersion?: unknown;
  cardVersion?: unknown;
  requestedHistoryLength?: unknown;
  returnedHistory?: unknown;
  truncationReason?: unknown;
  retentionSignature?: unknown;
  now?: Date;
}): Promise<A2aTaskHistoryRetentionVerdict> {
  const signature = await verifyA2aAgentCardSignature(input);
  if (!signature.ok) {
    return {
      ok: false,
      code: 'SIGNATURE_INVALID',
      message:
        'A2A task-history retention attestation requires a valid signed Agent Card',
      signature,
    };
  }

  const metadata = await buildA2aTaskHistoryRetentionMetadata(input);
  if (metadata === null) {
    return {
      ok: false,
      code: 'TASK_HISTORY_RETENTION_METADATA_INVALID',
      message:
        'A2A task-history retention attestation requires taskId, taskVersion, cardVersion, requestedHistoryLength, and returnedHistory[]',
      signature,
    };
  }

  const payload = buildA2aTaskHistoryRetentionPayloadFromMetadata(metadata);
  if (
    typeof input.retentionSignature !== 'string' ||
    !SIGNATURE_HEX_REGEX.test(input.retentionSignature)
  ) {
    return {
      ok: false,
      code: 'TASK_HISTORY_RETENTION_SIGNATURE_INVALID',
      message:
        'A2A task-history retention attestation requires a 128-hex Ed25519 retentionSignature',
      signature,
    };
  }

  let validRetentionSignature = false;
  try {
    validRetentionSignature = await ed25519.verifyAsync(
      ed25519.etc.hexToBytes(input.retentionSignature),
      encodeMessage(A2A_TASK_HISTORY_RETENTION_SIGNATURE_DOMAIN, payload),
      ed25519.etc.hexToBytes(String(input.publicKey))
    );
  } catch {
    validRetentionSignature = false;
  }

  if (!validRetentionSignature) {
    return {
      ok: false,
      code: 'TASK_HISTORY_RETENTION_SIGNATURE_INVALID',
      message:
        'A2A task-history retention signature does not match requested/returned history metadata',
      signature,
    };
  }

  const reasons: string[] = [];
  let requestedVsReturned: A2aTaskHistoryRetentionComparison = 'complete';
  if (metadata.returnedHistoryLength < metadata.requestedHistoryLength) {
    requestedVsReturned = 'truncated';
    if (metadata.truncationReason === null) {
      reasons.push('truncated history requires an explicit truncation reason');
    }
  }
  if (metadata.returnedHistoryLength > metadata.requestedHistoryLength) {
    requestedVsReturned = 'over-returned';
    reasons.push('returned history length exceeds requested history length');
  }

  const status: A2aTaskHistoryRetentionStatus =
    reasons.length > 0
      ? 'non-reproducible'
      : requestedVsReturned === 'truncated'
        ? 'truncated'
        : 'reproducible';
  const payloadCanonicalJson = canonicalJson(payload);
  const retention: A2aTaskHistoryRetentionReport = {
    kind: 'agentgram.a2a.task-history.retention-attestation',
    generatedAt: (input.now ?? new Date()).toISOString(),
    signedAgentCardPayloadDigest: signature.payloadDigest,
    taskId: metadata.taskId,
    taskVersion: metadata.taskVersion,
    cardVersion: metadata.cardVersion,
    request: {
      requestedHistoryLength: metadata.requestedHistoryLength,
    },
    response: {
      returnedHistoryLength: metadata.returnedHistoryLength,
      returnedHistoryDigest: metadata.returnedHistoryDigest,
      truncated: requestedVsReturned === 'truncated',
      truncationReason: metadata.truncationReason,
    },
    retention: {
      status,
      requestedVsReturned,
      reasons,
    },
    signature: {
      status: 'verified',
      signingAlgorithm: 'ed25519',
      signatureDomain: A2A_TASK_HISTORY_RETENTION_SIGNATURE_DOMAIN,
      publicKey: String(input.publicKey).toLowerCase(),
      payloadDigest: await sha256Hex(payloadCanonicalJson),
      verifierFixture: await buildA2aTaskHistoryRetentionVerifierFixture(),
    },
  };

  if (status === 'non-reproducible') {
    return {
      ok: false,
      code: 'TASK_HISTORY_RETENTION_NON_REPRODUCIBLE',
      message:
        'A2A task-history retention attestation is non-reproducible from requested versus returned history metadata',
      retention,
      signature,
    };
  }

  return { ok: true, retention, signature };
}

function encodeMessage(domain: string, payload: unknown): Uint8Array {
  return new TextEncoder().encode(domain + canonicalJson(payload));
}

/**
 * Generate a fresh Ed25519 keypair for an agent.
 */
export async function generateAgentKeypair(): Promise<AgentKeypair> {
  const { secretKey, publicKey } = await ed25519.keygenAsync();
  return {
    publicKey: ed25519.etc.bytesToHex(publicKey),
    secretKey: ed25519.etc.bytesToHex(secretKey),
  };
}

/**
 * Sign a JSON payload with a hex-encoded Ed25519 secret key.
 * The signed message is `SIGNATURE_DOMAIN + canonicalJson(payload)`.
 * Returns the signature as lowercase hex (128 chars).
 */
export async function signPayload(
  secretKeyHex: string,
  payload: unknown
): Promise<string> {
  if (!SECRET_KEY_HEX_REGEX.test(secretKeyHex)) {
    throw new Error('Secret key must be 64 hex characters');
  }
  const signature = await ed25519.signAsync(
    encodeMessage(SIGNATURE_DOMAIN, payload),
    ed25519.etc.hexToBytes(secretKeyHex)
  );
  return ed25519.etc.bytesToHex(signature);
}

/**
 * Verify a payload signature against a hex-encoded Ed25519 public key.
 * Never throws: malformed keys or signatures return false.
 */
export async function verifySignature(
  publicKeyHex: string,
  payload: unknown,
  signatureHex: string
): Promise<boolean> {
  if (
    !PUBLIC_KEY_HEX_REGEX.test(publicKeyHex) ||
    !SIGNATURE_HEX_REGEX.test(signatureHex)
  ) {
    return false;
  }
  try {
    return await ed25519.verifyAsync(
      ed25519.etc.hexToBytes(signatureHex),
      encodeMessage(SIGNATURE_DOMAIN, payload),
      ed25519.etc.hexToBytes(publicKeyHex)
    );
  } catch {
    return false;
  }
}

/**
 * Registration proof-of-possession payload.
 * The client signs this structure to prove control of the secret key
 * matching the `publicKey` it registers.
 */
export interface RegistrationProofPayload {
  action: 'register';
  name: string;
  publicKey: string;
  /** Unix epoch milliseconds at signing time. */
  timestamp: number;
}

/**
 * Build the canonical registration payload that must be signed when
 * registering with a public key. `name` is the agent name exactly as sent
 * in the registration request body.
 */
export function buildRegistrationPayload(
  name: string,
  publicKey: string,
  timestamp: number
): RegistrationProofPayload {
  return { action: 'register', name, publicKey, timestamp };
}

/**
 * Verify a registration proof-of-possession: checks timestamp freshness
 * (within SIGNATURE_FRESHNESS_WINDOW_MS of server time) and the Ed25519
 * signature over the canonical registration payload.
 */
export async function verifyRegistrationProof(
  proof: {
    name: string;
    publicKey: string;
    timestamp: number;
    signature: string;
  },
  nowMs: number = Date.now()
): Promise<SignatureVerdict> {
  if (
    !Number.isSafeInteger(proof.timestamp) ||
    Math.abs(nowMs - proof.timestamp) > SIGNATURE_FRESHNESS_WINDOW_MS
  ) {
    return {
      ok: false,
      code: 'SIGNATURE_EXPIRED',
      message:
        'Registration signature timestamp is outside the freshness window (5 minutes, epoch milliseconds)',
    };
  }

  const payload = buildRegistrationPayload(
    proof.name,
    proof.publicKey,
    proof.timestamp
  );
  const valid = await verifySignature(
    proof.publicKey,
    payload,
    proof.signature
  );
  if (!valid) {
    return {
      ok: false,
      code: 'SIGNATURE_INVALID',
      message:
        'Registration signature does not match the supplied public key',
    };
  }
  return { ok: true };
}
