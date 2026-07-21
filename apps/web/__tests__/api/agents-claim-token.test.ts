import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAgentSingle = vi.fn();
const mockAgentEq = vi.fn();
const mockAgentSelect = vi.fn();
const mockClaimTokenInsert = vi.fn();
const mockFrom = vi.fn();

vi.mock('@agentgram/db', () => ({
  getSupabaseServiceClient: () => ({
    from: mockFrom,
  }),
}));

vi.mock('@agentgram/auth', async () => {
  const actual = await vi.importActual<typeof import('@agentgram/auth')>(
    '@agentgram/auth'
  );

  return {
    ...actual,
    withAuth: (handler: unknown) => handler,
    withRateLimit: (_config: unknown, handler: unknown) => handler,
  };
});

vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn().mockResolvedValue('hashed-claim-token') },
}));

describe('POST /api/v1/agents/claim-token', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockAgentSingle.mockResolvedValue({
      data: { id: 'agent-1', name: 'sage-bot', status: 'active' },
      error: null,
    });
    mockAgentEq.mockReturnValue({ single: mockAgentSingle });
    mockAgentSelect.mockReturnValue({ eq: mockAgentEq });
    mockClaimTokenInsert.mockResolvedValue({ error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'agents') {
        return {
          select: mockAgentSelect,
        };
      }

      if (table === 'agent_claim_tokens') {
        return {
          insert: mockClaimTokenInsert,
        };
      }

      return {};
    });
  });

  async function createClaimToken(headers: Record<string, string> = {}) {
    const { POST } = await import('../../app/api/v1/agents/claim-token/route');
    const request = new Request('http://localhost/api/v1/agents/claim-token', {
      method: 'POST',
      headers,
    });

    return POST(request as Parameters<typeof POST>[0]);
  }

  it('returns a one-time claim token and stores only hash + prefix', async () => {
    const response = await createClaimToken({
      'x-agent-id': 'agent-1',
    });
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.agentName).toBe('sage-bot');
    expect(json.data.claimToken).toMatch(/^agclaim_[a-f0-9]{64}$/);
    expect(Date.parse(json.data.expiresAt)).not.toBeNaN();
    expect(json.data.trustProof).toEqual(
      expect.objectContaining({
        summary:
          'Claim-token minting is tied to authenticated agent identity, Ed25519 signed-route coverage, and hash-only token storage.',
        routeCoverage: expect.arrayContaining([
          {
            method: 'POST',
            path: '/api/v1/agents/claim-token',
            enforcement: 'withAuth + withAgentSignature',
            signaturePolicy:
              'optional headers; invalid signed attempts fail closed',
          },
        ]),
        claimTokenAudit: expect.objectContaining({
          rawTokenVisible: 'once',
          storedSecret: 'bcrypt_hash_only',
          storedLookup: 'token_prefix_only',
          expiresInSeconds: 3600,
          redeemPath: '/api/v1/developers/claim-agent',
        }),
      })
    );

    expect(mockFrom).toHaveBeenCalledWith('agents');
    expect(mockFrom).toHaveBeenCalledWith('agent_claim_tokens');
    expect(mockClaimTokenInsert).toHaveBeenCalledTimes(1);
    expect(mockClaimTokenInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        agent_id: 'agent-1',
        token_hash: 'hashed-claim-token',
        token_prefix: json.data.claimToken.substring(0, 16),
        expires_at: expect.any(String),
      })
    );
    const inserted = mockClaimTokenInsert.mock.calls[0][0];
    expect(inserted.token_hash).not.toBe(json.data.claimToken);
  });

  it('returns 401 when the authenticated agent id is missing', async () => {
    const response = await createClaimToken();
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('UNAUTHORIZED');
    expect(mockClaimTokenInsert).not.toHaveBeenCalled();
  });

  it('rejects malformed signed requests before minting a claim token', async () => {
    const response = await createClaimToken({
      'x-agent-id': 'agent-1',
      'x-agentgram-timestamp': String(Date.now()),
    });
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('SIGNATURE_INVALID');
    expect(mockFrom).not.toHaveBeenCalled();
    expect(mockClaimTokenInsert).not.toHaveBeenCalled();
  });

  it('returns 404 when the agent record does not exist', async () => {
    mockAgentSingle.mockResolvedValueOnce({ data: null, error: null });

    const response = await createClaimToken({
      'x-agent-id': 'missing-agent',
    });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('NOT_FOUND');
    expect(mockClaimTokenInsert).not.toHaveBeenCalled();
  });

  it('returns 403 when the agent is not active', async () => {
    mockAgentSingle.mockResolvedValueOnce({
      data: { id: 'agent-1', name: 'sage-bot', status: 'draft' },
      error: null,
    });

    const response = await createClaimToken({
      'x-agent-id': 'agent-1',
    });
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('AGENT_INACTIVE');
    expect(mockClaimTokenInsert).not.toHaveBeenCalled();
  });
});
