import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockClaimTokenIs = vi.fn();
const mockClaimTokenEq = vi.fn();
const mockClaimTokenSelect = vi.fn();
const mockClaimTokenUpdateEq = vi.fn();
const mockClaimTokenUpdate = vi.fn();
const mockAgentUpdateEq = vi.fn();
const mockAgentUpdate = vi.fn();
const mockAgentSingle = vi.fn();
const mockAgentEq = vi.fn();
const mockAgentSelect = vi.fn();
const mockFrom = vi.fn();
const mockCompare = vi.fn();

vi.mock('@agentgram/db', () => ({
  getSupabaseServiceClient: () => ({
    from: mockFrom,
  }),
}));

vi.mock('@agentgram/auth', () => ({
  withRateLimit: (_config: unknown, handler: unknown) => handler,
}));

vi.mock('@/lib/auth/developer', () => ({
  withDeveloperAuth: (handler: unknown) => handler,
}));

vi.mock('bcryptjs', () => ({
  default: { compare: mockCompare },
}));

describe('POST /api/v1/developers/claim-agent', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockClaimTokenIs.mockResolvedValue({
      data: [
        {
          id: 'token-1',
          agent_id: 'agent-1',
          token_hash: 'stored-hash',
          expires_at: '2099-01-01T00:00:00.000Z',
          redeemed_at: null,
        },
      ],
      error: null,
    });
    mockClaimTokenEq.mockReturnValue({ is: mockClaimTokenIs });
    mockClaimTokenSelect.mockReturnValue({ eq: mockClaimTokenEq });
    mockClaimTokenUpdateEq.mockResolvedValue({ error: null });
    mockClaimTokenUpdate.mockReturnValue({ eq: mockClaimTokenUpdateEq });

    mockAgentUpdateEq.mockResolvedValue({ error: null });
    mockAgentUpdate.mockReturnValue({ eq: mockAgentUpdateEq });
    mockAgentSingle.mockResolvedValue({
      data: {
        id: 'agent-1',
        name: 'sage-bot',
        display_name: 'Sage Bot',
      },
      error: null,
    });
    mockAgentEq.mockReturnValue({ single: mockAgentSingle });
    mockAgentSelect.mockReturnValue({ eq: mockAgentEq });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'agent_claim_tokens') {
        return {
          select: mockClaimTokenSelect,
          update: mockClaimTokenUpdate,
        };
      }

      if (table === 'agents') {
        return {
          update: mockAgentUpdate,
          select: mockAgentSelect,
        };
      }

      return {};
    });

    mockCompare.mockResolvedValue(true);
  });

  async function claimAgent(
    body: Record<string, unknown> = { claimToken: 'agclaim_1234567890abcdef' },
    headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-developer-id': 'dev-1',
      'x-user-id': 'user-1',
    }
  ) {
    const { POST } = await import('../../app/api/v1/developers/claim-agent/route');
    const request = new Request('http://localhost/api/v1/developers/claim-agent', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    return POST(request as Parameters<typeof POST>[0]);
  }

  it('redeems a valid claim token and transfers ownership', async () => {
    const response = await claimAgent();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      data: {
        agentId: 'agent-1',
        agentName: 'sage-bot',
        agentDisplayName: 'Sage Bot',
        developerId: 'dev-1',
        claimedAt: expect.any(String),
      },
    });

    expect(mockClaimTokenEq).toHaveBeenCalledWith('token_prefix', 'agclaim_12345678');
    expect(mockAgentUpdate).toHaveBeenCalledWith({ developer_id: 'dev-1' });
    expect(mockAgentUpdateEq).toHaveBeenCalledWith('id', 'agent-1');
    expect(mockClaimTokenUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        redeemed_at: expect.any(String),
        redeemed_by_user_id: 'user-1',
      })
    );
    expect(mockClaimTokenUpdateEq).toHaveBeenCalledWith('id', 'token-1');
  });

  it('returns 401 when developer auth context is missing', async () => {
    const response = await claimAgent(
      { claimToken: 'agclaim_1234567890abcdef' },
      { 'Content-Type': 'application/json' }
    );
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('UNAUTHORIZED');
    expect(mockAgentUpdate).not.toHaveBeenCalled();
  });

  it('returns 400 when claimToken is missing from the request body', async () => {
    const response = await claimAgent({});
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('INVALID_INPUT');
    expect(mockCompare).not.toHaveBeenCalled();
  });

  it('returns 400 when the token prefix lookup finds no active candidates', async () => {
    mockClaimTokenIs.mockResolvedValueOnce({ data: [], error: null });

    const response = await claimAgent();
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('INVALID_CLAIM_TOKEN');
    expect(mockAgentUpdate).not.toHaveBeenCalled();
  });

  it('returns 400 when no stored hash matches the provided claim token', async () => {
    mockCompare.mockResolvedValueOnce(false);

    const response = await claimAgent();
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('INVALID_CLAIM_TOKEN');
    expect(mockAgentUpdate).not.toHaveBeenCalled();
  });

  it('returns 400 when the matched token is expired', async () => {
    mockClaimTokenIs.mockResolvedValueOnce({
      data: [
        {
          id: 'token-1',
          agent_id: 'agent-1',
          token_hash: 'stored-hash',
          expires_at: '2000-01-01T00:00:00.000Z',
          redeemed_at: null,
        },
      ],
      error: null,
    });

    const response = await claimAgent();
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('CLAIM_TOKEN_EXPIRED');
    expect(mockAgentUpdate).not.toHaveBeenCalled();
  });
});
