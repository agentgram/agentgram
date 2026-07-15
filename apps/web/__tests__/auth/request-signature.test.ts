import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import {
  generateAgentKeypair,
  SIGNATURE_FRESHNESS_WINDOW_MS,
} from '@agentgram/auth/src/ed25519';
import {
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
  signRequest,
  verifyRequestSignature,
  withAgentSignature,
} from '@agentgram/auth/src/request-signature';

describe('signRequest / verifyRequestSignature', () => {
  const request = {
    method: 'GET',
    path: '/api/v1/agents/me',
    timestamp: '1750000000000',
    body: '',
  };
  const now = 1750000000000;

  it('roundtrips a signed request', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const signature = await signRequest(secretKey, request);
    expect(
      await verifyRequestSignature(publicKey, signature, request, now)
    ).toEqual({ ok: true });
  });

  it('rejects when method, path, or body is tampered', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const signature = await signRequest(secretKey, request);

    for (const tampered of [
      { ...request, method: 'POST' },
      { ...request, path: '/api/v1/agents/other' },
      { ...request, body: '{"evil":true}' },
    ]) {
      const verdict = await verifyRequestSignature(
        publicKey,
        signature,
        tampered,
        now
      );
      expect(verdict.ok).toBe(false);
      if (!verdict.ok) {
        expect(verdict.code).toBe('SIGNATURE_INVALID');
      }
    }
  });

  it('rejects timestamps outside the freshness window', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const signature = await signRequest(secretKey, request);
    const verdict = await verifyRequestSignature(
      publicKey,
      signature,
      request,
      now + SIGNATURE_FRESHNESS_WINDOW_MS + 1
    );
    expect(verdict.ok).toBe(false);
    if (!verdict.ok) {
      expect(verdict.code).toBe('SIGNATURE_EXPIRED');
    }
  });

  it('rejects non-integer timestamps', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const signature = await signRequest(secretKey, request);
    const verdict = await verifyRequestSignature(
      publicKey,
      signature,
      { ...request, timestamp: 'not-a-number' },
      now
    );
    expect(verdict.ok).toBe(false);
    if (!verdict.ok) {
      expect(verdict.code).toBe('SIGNATURE_INVALID');
    }
  });
});

describe('withAgentSignature middleware', () => {
  const AGENT_ID = 'agent-1';
  const URL_ME = 'http://localhost/api/v1/agents/me';

  let registeredPublicKey: string | null = null;

  const handler = vi.fn(async () =>
    Response.json({ success: true, data: {} })
  );
  const wrapped = withAgentSignature(handler);

  function makeRequest(headers: Record<string, string>): NextRequest {
    return new NextRequest(URL_ME, {
      method: 'GET',
      headers: { 'x-agent-id': AGENT_ID, ...headers },
    });
  }

  beforeEach(() => {
    handler.mockClear();
    registeredPublicKey = null;
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://supabase.local');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-key');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json([{ public_key: registeredPublicKey }])
      )
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('passes through untouched when no signature headers are sent', async () => {
    const res = await wrapped(makeRequest({}));
    expect(res.status).toBe(200);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('rejects when only one of the two headers is sent', async () => {
    const res = await wrapped(
      makeRequest({ [TIMESTAMP_HEADER]: String(Date.now()) })
    );
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.error.code).toBe('SIGNATURE_INVALID');
    expect(handler).not.toHaveBeenCalled();
  });

  it('rejects when the agent has no registered public key', async () => {
    const res = await wrapped(
      makeRequest({
        [SIGNATURE_HEADER]: 'ab'.repeat(64),
        [TIMESTAMP_HEADER]: String(Date.now()),
      })
    );
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.error.code).toBe('PUBLIC_KEY_NOT_REGISTERED');
    expect(handler).not.toHaveBeenCalled();
  });

  it('accepts a correctly signed request', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    registeredPublicKey = publicKey;
    const timestamp = String(Date.now());
    const signature = await signRequest(secretKey, {
      method: 'GET',
      path: '/api/v1/agents/me',
      timestamp,
      body: '',
    });

    const res = await wrapped(
      makeRequest({
        [SIGNATURE_HEADER]: signature,
        [TIMESTAMP_HEADER]: timestamp,
      })
    );
    expect(res.status).toBe(200);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('rejects a signature from a key that is not the registered one', async () => {
    const registered = await generateAgentKeypair();
    const attacker = await generateAgentKeypair();
    registeredPublicKey = registered.publicKey;
    const timestamp = String(Date.now());
    const signature = await signRequest(attacker.secretKey, {
      method: 'GET',
      path: '/api/v1/agents/me',
      timestamp,
      body: '',
    });

    const res = await wrapped(
      makeRequest({
        [SIGNATURE_HEADER]: signature,
        [TIMESTAMP_HEADER]: timestamp,
      })
    );
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.error.code).toBe('SIGNATURE_INVALID');
    expect(handler).not.toHaveBeenCalled();
  });

  it('rejects an expired timestamp', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    registeredPublicKey = publicKey;
    const timestamp = String(
      Date.now() - SIGNATURE_FRESHNESS_WINDOW_MS - 1000
    );
    const signature = await signRequest(secretKey, {
      method: 'GET',
      path: '/api/v1/agents/me',
      timestamp,
      body: '',
    });

    const res = await wrapped(
      makeRequest({
        [SIGNATURE_HEADER]: signature,
        [TIMESTAMP_HEADER]: timestamp,
      })
    );
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.error.code).toBe('SIGNATURE_EXPIRED');
    expect(handler).not.toHaveBeenCalled();
  });
});
