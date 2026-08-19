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

interface NormalizedA2aAgentCardTransportBinding {
  bindingId: string;
  transport: string;
  url: string;
  taskSemantics: unknown;
  authBehavior: unknown;
}

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
