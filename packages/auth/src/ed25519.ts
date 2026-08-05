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

export const RFC8785_AGENT_CARD_FIXTURE_CANONICAL_JSON =
  '{"literals":[null,true,false],"numbers":[333333333.3333333,1e+30,4.5,0.002,1e-27],"string":"€$\\u000f\\nA\'B\\"\\\\\\"/"}';

export const RFC8785_AGENT_CARD_FIXTURE_DIGEST =
  '6d77565c0fe51d7346bd5debb08f2eebbe9bde01eade30b34e2011f360f91b0e';

/** Maximum allowed clock skew between signer and server, in milliseconds. */
export const SIGNATURE_FRESHNESS_WINDOW_MS = 5 * 60 * 1000;

const PUBLIC_KEY_HEX_REGEX = /^[0-9a-f]{64}$/i;
const SECRET_KEY_HEX_REGEX = /^[0-9a-f]{64}$/i;
const SIGNATURE_HEX_REGEX = /^[0-9a-f]{128}$/i;

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
    unsignedCardsAccepted: false;
    requiredFields: ['agentCard', 'publicKey', 'signature'];
    failureModes: string[];
  };
}

export type A2aAgentCardSignatureVerdict =
  | {
      ok: true;
      canonicalJson: string;
      payloadDigest: string;
      evidence: A2aAgentCardCanonicalSignatureEvidence;
    }
  | {
      ok: false;
      code: 'RFC8785_CONFORMANCE_FAILED' | 'SIGNATURE_INVALID';
      message: string;
      evidence: A2aAgentCardCanonicalSignatureEvidence;
    };

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
      unsignedCardsAccepted: false,
      requiredFields: ['agentCard', 'publicKey', 'signature'],
      failureModes: [
        'missing Agent Card payload',
        'missing or malformed Ed25519 public key',
        'missing or malformed Ed25519 signature',
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

/**
 * Verify an A2A Agent Card signature. This gate is intentionally fail-closed:
 * unsigned cards, malformed keys/signatures, fixture drift, and tampering all
 * return a structured negative verdict instead of falling back to trust.
 */
export async function verifyA2aAgentCardSignature(input: {
  publicKey?: unknown;
  signature?: unknown;
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
    typeof input.signature !== 'string' ||
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
    !SIGNATURE_HEX_REGEX.test(input.signature)
  ) {
    return {
      ok: false,
      code: 'SIGNATURE_INVALID',
      message:
        'A2A Agent Card publicKey must be 64 hex characters and signature must be 128 hex characters',
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

  const canonicalPayload = canonicalJson(input.agentCard);
  return {
    ok: true,
    canonicalJson: canonicalPayload,
    payloadDigest: await sha256Hex(canonicalPayload),
    evidence,
  };
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
