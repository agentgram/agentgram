import { describe, expect, it } from 'vitest';
import * as ed25519 from '@noble/ed25519';
import {
  SIGNATURE_DOMAIN,
  SIGNATURE_FRESHNESS_WINDOW_MS,
  canonicalJson,
  generateAgentKeypair,
  signPayload,
  verifySignature,
  buildRegistrationPayload,
  verifyRegistrationProof,
} from '@agentgram/auth/src/ed25519';

describe('generateAgentKeypair', () => {
  it('returns hex-encoded 32-byte public and secret keys', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    expect(publicKey).toMatch(/^[0-9a-f]{64}$/);
    expect(secretKey).toMatch(/^[0-9a-f]{64}$/);
  });

  it('generates unique keypairs on each call', async () => {
    const a = await generateAgentKeypair();
    const b = await generateAgentKeypair();
    expect(a.publicKey).not.toBe(b.publicKey);
    expect(a.secretKey).not.toBe(b.secretKey);
  });
});

describe('canonicalJson', () => {
  it('sorts object keys recursively', () => {
    expect(canonicalJson({ b: 2, a: { d: 4, c: 3 } })).toBe(
      '{"a":{"c":3,"d":4},"b":2}'
    );
  });

  it('omits undefined object values', () => {
    expect(canonicalJson({ a: 1, b: undefined })).toBe('{"a":1}');
  });

  it('handles arrays, strings, booleans, and null', () => {
    expect(canonicalJson([1, 'x', true, null])).toBe('[1,"x",true,null]');
  });

  it('rejects non-finite numbers', () => {
    expect(() => canonicalJson({ a: Infinity })).toThrow();
  });
});

describe('signPayload / verifySignature', () => {
  it('roundtrips: a signed payload verifies against the public key', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const payload = { action: 'register', name: 'my-agent', timestamp: 123 };
    const signature = await signPayload(secretKey, payload);
    expect(signature).toMatch(/^[0-9a-f]{128}$/);
    expect(await verifySignature(publicKey, payload, signature)).toBe(true);
  });

  it('verifies independently of object key order', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const signature = await signPayload(secretKey, { a: 1, b: 2 });
    expect(await verifySignature(publicKey, { b: 2, a: 1 }, signature)).toBe(
      true
    );
  });

  it('rejects a tampered payload', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const signature = await signPayload(secretKey, { name: 'my-agent' });
    expect(
      await verifySignature(publicKey, { name: 'evil-agent' }, signature)
    ).toBe(false);
  });

  it('rejects a signature from a different key', async () => {
    const alice = await generateAgentKeypair();
    const mallory = await generateAgentKeypair();
    const payload = { name: 'my-agent' };
    const signature = await signPayload(mallory.secretKey, payload);
    expect(await verifySignature(alice.publicKey, payload, signature)).toBe(
      false
    );
  });

  it('rejects malformed keys and signatures without throwing', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const payload = { name: 'my-agent' };
    const signature = await signPayload(secretKey, payload);
    expect(await verifySignature('not-hex', payload, signature)).toBe(false);
    expect(await verifySignature(publicKey, payload, 'deadbeef')).toBe(false);
  });

  it('enforces domain separation: raw signatures without the domain prefix fail', async () => {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const payload = { name: 'my-agent' };
    const rawSignature = ed25519.etc.bytesToHex(
      await ed25519.signAsync(
        new TextEncoder().encode(canonicalJson(payload)),
        ed25519.etc.hexToBytes(secretKey)
      )
    );
    expect(await verifySignature(publicKey, payload, rawSignature)).toBe(
      false
    );

    const domainSignature = ed25519.etc.bytesToHex(
      await ed25519.signAsync(
        new TextEncoder().encode(SIGNATURE_DOMAIN + canonicalJson(payload)),
        ed25519.etc.hexToBytes(secretKey)
      )
    );
    expect(await verifySignature(publicKey, payload, domainSignature)).toBe(
      true
    );
  });
});

describe('verifyRegistrationProof', () => {
  async function makeProof(timestamp: number) {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const name = 'my-agent';
    const signature = await signPayload(
      secretKey,
      buildRegistrationPayload(name, publicKey, timestamp)
    );
    return { name, publicKey, timestamp, signature };
  }

  it('accepts a fresh, valid proof', async () => {
    const now = Date.now();
    const proof = await makeProof(now);
    expect(await verifyRegistrationProof(proof, now)).toEqual({ ok: true });
  });

  it('rejects a stale timestamp with SIGNATURE_EXPIRED', async () => {
    const now = Date.now();
    const proof = await makeProof(now - SIGNATURE_FRESHNESS_WINDOW_MS - 1);
    const verdict = await verifyRegistrationProof(proof, now);
    expect(verdict.ok).toBe(false);
    if (!verdict.ok) {
      expect(verdict.code).toBe('SIGNATURE_EXPIRED');
    }
  });

  it('rejects a future timestamp beyond the window with SIGNATURE_EXPIRED', async () => {
    const now = Date.now();
    const proof = await makeProof(now + SIGNATURE_FRESHNESS_WINDOW_MS + 1);
    const verdict = await verifyRegistrationProof(proof, now);
    expect(verdict.ok).toBe(false);
    if (!verdict.ok) {
      expect(verdict.code).toBe('SIGNATURE_EXPIRED');
    }
  });

  it('rejects a proof signed for a different name with SIGNATURE_INVALID', async () => {
    const now = Date.now();
    const proof = await makeProof(now);
    const verdict = await verifyRegistrationProof(
      { ...proof, name: 'someone-else' },
      now
    );
    expect(verdict.ok).toBe(false);
    if (!verdict.ok) {
      expect(verdict.code).toBe('SIGNATURE_INVALID');
    }
  });
});
