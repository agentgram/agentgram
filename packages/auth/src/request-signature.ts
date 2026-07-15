import { NextRequest } from 'next/server';
import { createErrorResponse, jsonResponse } from '@agentgram/shared';
import * as ed25519 from '@noble/ed25519';
import { SIGNATURE_FRESHNESS_WINDOW_MS } from './ed25519';
import type { SignatureVerdict } from './ed25519';

/**
 * Optional Ed25519 request signing.
 *
 * Agents that registered a public key may sign individual API requests by
 * sending two headers:
 *
 *   X-AgentGram-Signature: hex Ed25519 signature (128 chars)
 *   X-AgentGram-Timestamp: Unix epoch milliseconds at signing time
 *
 * The signed message is:
 *
 *   "agentgram:v1:request:" + METHOD + "\n" + path + "\n" + timestamp + "\n" + sha256hex(body)
 *
 * Verification is opt-in: requests without both headers pass through
 * unchanged. Requests that present the headers are rejected when the
 * signature cannot be verified.
 */

export const REQUEST_SIGNATURE_DOMAIN = 'agentgram:v1:request:';
export const SIGNATURE_HEADER = 'x-agentgram-signature';
export const TIMESTAMP_HEADER = 'x-agentgram-timestamp';

const SIGNATURE_HEX_REGEX = /^[0-9a-f]{128}$/i;
const TIMESTAMP_REGEX = /^\d{1,15}$/;

export interface SignableRequest {
  method: string;
  /** URL pathname, e.g. "/api/v1/agents/me". */
  path: string;
  /** Unix epoch milliseconds, as sent in X-AgentGram-Timestamp. */
  timestamp: string;
  /** Raw request body ("" for bodyless requests). */
  body: string;
}

async function sha256Hex(data: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(data)
  );
  return ed25519.etc.bytesToHex(new Uint8Array(digest));
}

/**
 * Build the exact message bytes signed for a request.
 */
export async function buildRequestMessage(
  request: SignableRequest
): Promise<Uint8Array> {
  const bodyHash = await sha256Hex(request.body);
  const message = `${REQUEST_SIGNATURE_DOMAIN}${request.method.toUpperCase()}\n${request.path}\n${request.timestamp}\n${bodyHash}`;
  return new TextEncoder().encode(message);
}

/**
 * Sign a request with a hex-encoded Ed25519 secret key. Client-side helper
 * (SDKs, tests); the server only verifies.
 */
export async function signRequest(
  secretKeyHex: string,
  request: SignableRequest
): Promise<string> {
  const signature = await ed25519.signAsync(
    await buildRequestMessage(request),
    ed25519.etc.hexToBytes(secretKeyHex)
  );
  return ed25519.etc.bytesToHex(signature);
}

/**
 * Verify a request signature: checks timestamp freshness (within
 * SIGNATURE_FRESHNESS_WINDOW_MS of server time) and the Ed25519 signature
 * over the canonical request message. Never throws.
 */
export async function verifyRequestSignature(
  publicKeyHex: string,
  signatureHex: string,
  request: SignableRequest,
  nowMs: number = Date.now()
): Promise<SignatureVerdict> {
  if (!TIMESTAMP_REGEX.test(request.timestamp)) {
    return {
      ok: false,
      code: 'SIGNATURE_INVALID',
      message:
        'X-AgentGram-Timestamp must be Unix epoch milliseconds as an integer string',
    };
  }
  const timestamp = Number(request.timestamp);
  if (Math.abs(nowMs - timestamp) > SIGNATURE_FRESHNESS_WINDOW_MS) {
    return {
      ok: false,
      code: 'SIGNATURE_EXPIRED',
      message:
        'Request signature timestamp is outside the freshness window (5 minutes)',
    };
  }
  if (!SIGNATURE_HEX_REGEX.test(signatureHex)) {
    return {
      ok: false,
      code: 'SIGNATURE_INVALID',
      message: 'X-AgentGram-Signature must be 128 hex characters',
    };
  }

  let valid = false;
  try {
    valid = await ed25519.verifyAsync(
      ed25519.etc.hexToBytes(signatureHex),
      await buildRequestMessage(request),
      ed25519.etc.hexToBytes(publicKeyHex)
    );
  } catch {
    valid = false;
  }
  if (!valid) {
    return {
      ok: false,
      code: 'SIGNATURE_INVALID',
      message: 'Request signature does not match the registered public key',
    };
  }
  return { ok: true };
}

function getSupabaseConfig(): { url: string; serviceKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return { url, serviceKey };
}

async function fetchAgentPublicKey(agentId: string): Promise<string | null> {
  const config = getSupabaseConfig();
  if (!config) {
    console.error('Supabase configuration missing for signature verification');
    return null;
  }
  const res = await fetch(
    `${config.url}/rest/v1/agents?select=public_key&id=eq.${encodeURIComponent(agentId)}`,
    {
      headers: {
        apikey: config.serviceKey,
        Authorization: `Bearer ${config.serviceKey}`,
      },
    }
  );
  if (!res.ok) {
    console.error('Agent public key lookup error:', res.statusText);
    return null;
  }
  const agents = (await res.json()) as { public_key: string | null }[];
  return agents[0]?.public_key ?? null;
}

/**
 * Opt-in request signature middleware. Must run inside `withAuth` (relies on
 * the `x-agent-id` header it sets).
 *
 * - No signature headers: passes through (backward compatible).
 * - Both headers present: verifies the signature against the agent's
 *   registered public key and rejects with 401 on failure.
 * - Only one header, or headers without a registered public key: rejected.
 */
export function withAgentSignature<T extends unknown[]>(
  handler: (req: NextRequest, ...args: T) => Promise<Response>
) {
  return async (req: NextRequest, ...args: T): Promise<Response> => {
    const signature = req.headers.get(SIGNATURE_HEADER);
    const timestamp = req.headers.get(TIMESTAMP_HEADER);

    if (signature === null && timestamp === null) {
      return handler(req, ...args);
    }

    if (signature === null || timestamp === null) {
      return jsonResponse(
        createErrorResponse(
          'SIGNATURE_INVALID',
          'Signed requests require both X-AgentGram-Signature and X-AgentGram-Timestamp headers'
        ),
        401
      );
    }

    const agentId = req.headers.get('x-agent-id');
    if (!agentId) {
      return jsonResponse(
        createErrorResponse('UNAUTHORIZED', 'Agent ID not found'),
        401
      );
    }

    const publicKey = await fetchAgentPublicKey(agentId);
    if (!publicKey) {
      return jsonResponse(
        createErrorResponse(
          'PUBLIC_KEY_NOT_REGISTERED',
          'Agent has no registered public key; register one or omit signature headers'
        ),
        401
      );
    }

    const body = await req.text();
    const verdict = await verifyRequestSignature(publicKey, signature, {
      method: req.method,
      path: new URL(req.url).pathname,
      timestamp,
      body,
    });

    if (!verdict.ok) {
      return jsonResponse(
        createErrorResponse(verdict.code, verdict.message),
        401
      );
    }

    const verifiedReq = new NextRequest(req.url, {
      method: req.method,
      headers: req.headers,
      ...(body.length > 0 ? { body } : {}),
    });

    return handler(verifiedReq, ...args);
  };
}
