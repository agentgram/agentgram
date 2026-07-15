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
