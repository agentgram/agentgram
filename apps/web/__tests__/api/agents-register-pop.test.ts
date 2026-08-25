import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateAgentKeypair,
  signPayload,
  buildRegistrationPayload,
  SIGNATURE_FRESHNESS_WINDOW_MS,
} from '@agentgram/auth/src/ed25519';

/**
 * POST /api/v1/agents/register — Ed25519 proof-of-possession tests.
 *
 * When a publicKey is supplied, the caller must prove control of the
 * matching secret key with a fresh signature over the canonical
 * registration payload. Registration without a publicKey is unchanged.
 */

const mockAgentInsert = vi.fn();
const mockApiKeysInsert = vi.fn();
const mockSelectSingle = vi.fn();
const mockDeleteEq = vi.fn();

vi.mock('@agentgram/db', () => ({
  getSupabaseServiceClient: () => ({
    from: (table: string) => {
      if (table === 'agents') {
        return {
          select: () => ({
            eq: () => ({
              single: mockSelectSingle,
            }),
          }),
          insert: mockAgentInsert,
          delete: () => ({ eq: mockDeleteEq }),
        };
      }
      if (table === 'developers') {
        return {
          insert: () => ({
            select: () => ({
              single: vi.fn().mockResolvedValue({
                data: { id: 'dev-1' },
                error: null,
              }),
            }),
          }),
          delete: () => ({ eq: mockDeleteEq }),
        };
      }
      if (table === 'api_keys') {
        return {
          insert: mockApiKeysInsert,
        };
      }
      return {};
    },
  }),
}));

vi.mock('@agentgram/auth', async () => {
  const ed25519 = await vi.importActual<
    typeof import('@agentgram/auth/src/ed25519')
  >('@agentgram/auth/src/ed25519');
  return {
    generateApiKey: () => 'ag_test_key_123456',
    withRateLimit: (_type: unknown, handler: unknown) => handler,
    redis: null,
    verifyRegistrationProof: ed25519.verifyRegistrationProof,
  };
});

vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn().mockResolvedValue('hashed') },
}));

describe('POST /api/v1/agents/register — publicKey proof-of-possession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectSingle.mockResolvedValue({ data: null, error: null });
    mockAgentInsert.mockReturnValue({
      select: () => ({
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'agent-1',
            name: 'test-agent',
            display_name: 'test-agent',
            description: '',
            trust_score: 0.5,
            created_at: '2026-01-01T00:00:00Z',
          },
          error: null,
        }),
      }),
    });
    mockApiKeysInsert.mockResolvedValue({ error: null });
  });

  async function registerAgent(body: Record<string, unknown>) {
    const { POST } = await import('../../app/api/v1/agents/register/route');
    const request = new Request('http://localhost/api/v1/agents/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return POST(request as Parameters<typeof POST>[0]);
  }

  async function makeSignedBody(name: string, timestamp: number = Date.now()) {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const signature = await signPayload(
      secretKey,
      buildRegistrationPayload(name, publicKey, timestamp)
    );
    return { name, publicKey, signature, timestamp, secretKey };
  }

  async function makeMixedCaseSignedBody(name: string) {
    const { publicKey, secretKey } = await generateAgentKeypair();
    const mixedCasePublicKey = publicKey
      .split('')
      .map((char, index) => (index % 2 === 0 ? char.toUpperCase() : char))
      .join('');
    const timestamp = Date.now();
    const signature = await signPayload(
      secretKey,
      buildRegistrationPayload(name, publicKey, timestamp)
    );
    return { name, publicKey, mixedCasePublicKey, signature, timestamp };
  }

  it('still registers without a publicKey (backward compatible)', async () => {
    const response = await registerAgent({ name: 'test-agent' });
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(mockAgentInsert).toHaveBeenCalledWith(
      expect.objectContaining({ public_key: null })
    );
  });

  it('registers with a publicKey and a valid proof-of-possession', async () => {
    const { name, publicKey, signature, timestamp } =
      await makeSignedBody('test-agent');
    const response = await registerAgent({
      name,
      publicKey,
      signature,
      timestamp,
    });
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(mockAgentInsert).toHaveBeenCalledWith(
      expect.objectContaining({ public_key: publicKey })
    );
  });

  it('normalizes mixed-case publicKey values before proof verification and storage', async () => {
    const { name, publicKey, mixedCasePublicKey, signature, timestamp } =
      await makeMixedCaseSignedBody('test-agent');
    const response = await registerAgent({
      name,
      publicKey: mixedCasePublicKey,
      signature,
      timestamp,
    });
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(mockAgentInsert).toHaveBeenCalledWith(
      expect.objectContaining({ public_key: publicKey })
    );
  });

  it('rejects a publicKey without signature and timestamp (SIGNATURE_REQUIRED)', async () => {
    const { publicKey } = await generateAgentKeypair();
    const response = await registerAgent({
      name: 'test-agent',
      publicKey,
    });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error.code).toBe('SIGNATURE_REQUIRED');
    expect(mockAgentInsert).not.toHaveBeenCalled();
  });

  it('rejects a signature made by a different key (SIGNATURE_INVALID)', async () => {
    const victim = await generateAgentKeypair();
    const attacker = await generateAgentKeypair();
    const timestamp = Date.now();
    const signature = await signPayload(
      attacker.secretKey,
      buildRegistrationPayload('test-agent', victim.publicKey, timestamp)
    );

    const response = await registerAgent({
      name: 'test-agent',
      publicKey: victim.publicKey,
      signature,
      timestamp,
    });
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error.code).toBe('SIGNATURE_INVALID');
    expect(mockAgentInsert).not.toHaveBeenCalled();
  });

  it('rejects a signature over a different name (SIGNATURE_INVALID)', async () => {
    const { publicKey, signature, timestamp } =
      await makeSignedBody('test-agent');
    const response = await registerAgent({
      name: 'other-agent',
      publicKey,
      signature,
      timestamp,
    });
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error.code).toBe('SIGNATURE_INVALID');
    expect(mockAgentInsert).not.toHaveBeenCalled();
  });

  it('rejects a stale timestamp (SIGNATURE_EXPIRED)', async () => {
    const staleTimestamp = Date.now() - SIGNATURE_FRESHNESS_WINDOW_MS - 1000;
    const { name, publicKey, signature, timestamp } = await makeSignedBody(
      'test-agent',
      staleTimestamp
    );
    const response = await registerAgent({
      name,
      publicKey,
      signature,
      timestamp,
    });
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error.code).toBe('SIGNATURE_EXPIRED');
    expect(mockAgentInsert).not.toHaveBeenCalled();
  });
});
