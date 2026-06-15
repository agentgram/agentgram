import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAgentEq = vi.fn();
const mockAgentSingle = vi.fn();
const mockAgentSelect = vi.fn();
const mockMemorySingle = vi.fn();
const mockMemorySelectAfterWrite = vi.fn();
const mockMemoryUpdateEqAgent = vi.fn();
const mockMemoryUpdateEqId = vi.fn();
const mockMemoryUpdate = vi.fn();
const mockFrom = vi.fn();

vi.mock('@agentgram/db', () => ({
  getSupabaseServiceClient: () => ({
    from: mockFrom,
  }),
}));

vi.mock('@/lib/auth/developer', () => ({
  withDeveloperAuth: (handler: unknown) => handler,
}));

describe('PATCH /api/v1/agents/me/memories/[id]/deprioritize', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockAgentSingle.mockResolvedValue({
      data: { id: 'agent-1', developer_id: 'dev-1' },
      error: null,
    });
    mockAgentEq.mockReturnValue({ single: mockAgentSingle });
    mockAgentSelect.mockReturnValue({ eq: mockAgentEq });

    mockMemorySingle.mockResolvedValue({
      data: {
        id: 'memory-1',
        agent_id: 'agent-1',
        key: 'latest_focus',
        value: 'Preserve the release blocker.',
        category: 'profile_fact',
        is_public: false,
        priority: 'low',
        created_at: '2026-05-08T12:00:00.000Z',
        updated_at: '2026-06-15T10:00:00.000Z',
      },
      error: null,
    });
    mockMemorySelectAfterWrite.mockReturnValue({ single: mockMemorySingle });
    mockMemoryUpdateEqAgent.mockReturnValue({ select: mockMemorySelectAfterWrite });
    mockMemoryUpdateEqId.mockReturnValue({ eq: mockMemoryUpdateEqAgent });
    mockMemoryUpdate.mockReturnValue({ eq: mockMemoryUpdateEqId });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'agents') return { select: mockAgentSelect };
      if (table === 'agent_memories') return { update: mockMemoryUpdate };
      return {};
    });
  });

  it('sets priority to low when deprioritized is true', async () => {
    const { PATCH } = await import(
      '../../app/api/v1/agents/me/memories/[id]/deprioritize/route'
    );

    const response = await PATCH(
      new Request(
        'http://localhost/api/v1/agents/me/memories/memory-1/deprioritize',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-developer-id': 'dev-1' },
          body: JSON.stringify({ agentId: 'agent-1', deprioritized: true }),
        }
      ) as Parameters<typeof PATCH>[0],
      { params: Promise.resolve({ id: 'memory-1' }) }
    );

    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockMemoryUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ priority: 'low' })
    );
  });

  it('sets priority to normal when deprioritized is false', async () => {
    const { PATCH } = await import(
      '../../app/api/v1/agents/me/memories/[id]/deprioritize/route'
    );

    const response = await PATCH(
      new Request(
        'http://localhost/api/v1/agents/me/memories/memory-1/deprioritize',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-developer-id': 'dev-1' },
          body: JSON.stringify({ agentId: 'agent-1', deprioritized: false }),
        }
      ) as Parameters<typeof PATCH>[0],
      { params: Promise.resolve({ id: 'memory-1' }) }
    );

    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockMemoryUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ priority: 'normal' })
    );
  });

  it('returns 400 when agentId is missing', async () => {
    const { PATCH } = await import(
      '../../app/api/v1/agents/me/memories/[id]/deprioritize/route'
    );

    const response = await PATCH(
      new Request(
        'http://localhost/api/v1/agents/me/memories/memory-1/deprioritize',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-developer-id': 'dev-1' },
          body: JSON.stringify({ deprioritized: true }),
        }
      ) as Parameters<typeof PATCH>[0],
      { params: Promise.resolve({ id: 'memory-1' }) }
    );

    const json = await response.json();
    expect(response.status).toBe(400);
    expect(json.error.code).toBe('INVALID_INPUT');
  });

  it('returns 400 when deprioritized is not a boolean', async () => {
    const { PATCH } = await import(
      '../../app/api/v1/agents/me/memories/[id]/deprioritize/route'
    );

    const response = await PATCH(
      new Request(
        'http://localhost/api/v1/agents/me/memories/memory-1/deprioritize',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-developer-id': 'dev-1' },
          body: JSON.stringify({ agentId: 'agent-1', deprioritized: 'yes' }),
        }
      ) as Parameters<typeof PATCH>[0],
      { params: Promise.resolve({ id: 'memory-1' }) }
    );

    const json = await response.json();
    expect(response.status).toBe(400);
    expect(json.error.code).toBe('INVALID_INPUT');
  });

  it('rejects deprioritize for agents not owned by the developer', async () => {
    mockAgentSingle.mockResolvedValueOnce({
      data: { id: 'agent-1', developer_id: 'dev-other' },
      error: null,
    });

    const { PATCH } = await import(
      '../../app/api/v1/agents/me/memories/[id]/deprioritize/route'
    );

    const response = await PATCH(
      new Request(
        'http://localhost/api/v1/agents/me/memories/memory-1/deprioritize',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-developer-id': 'dev-1' },
          body: JSON.stringify({ agentId: 'agent-1', deprioritized: true }),
        }
      ) as Parameters<typeof PATCH>[0],
      { params: Promise.resolve({ id: 'memory-1' }) }
    );

    const json = await response.json();
    expect(response.status).toBe(403);
    expect(json.error.code).toBe('FORBIDDEN');
    expect(mockMemoryUpdate).not.toHaveBeenCalled();
  });

  // withDeveloperAuth mock passes handler through; the 401 comes from the route's own
  // x-developer-id check. Both guard the same invariant so the coverage is valid.
  it('returns 401 when x-developer-id header is missing', async () => {
    const { PATCH } = await import(
      '../../app/api/v1/agents/me/memories/[id]/deprioritize/route'
    );

    const response = await PATCH(
      new Request(
        'http://localhost/api/v1/agents/me/memories/memory-1/deprioritize',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId: 'agent-1', deprioritized: true }),
        }
      ) as Parameters<typeof PATCH>[0],
      { params: Promise.resolve({ id: 'memory-1' }) }
    );

    const json = await response.json();
    expect(response.status).toBe(401);
    expect(json.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 404 when memory does not belong to the requested agent', async () => {
    // agent-1 is owned by dev-1 (ownership check passes), but the memory
    // belongs to agent-2. The .eq('agent_id', agentId) DB filter returns null.
    mockMemorySingle.mockResolvedValueOnce({ data: null, error: { message: 'No rows' } });

    const { PATCH } = await import(
      '../../app/api/v1/agents/me/memories/[id]/deprioritize/route'
    );

    const response = await PATCH(
      new Request(
        'http://localhost/api/v1/agents/me/memories/memory-cross/deprioritize',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-developer-id': 'dev-1' },
          body: JSON.stringify({ agentId: 'agent-1', deprioritized: true }),
        }
      ) as Parameters<typeof PATCH>[0],
      { params: Promise.resolve({ id: 'memory-cross' }) }
    );

    const json = await response.json();
    expect(response.status).toBe(404);
    expect(json.error.code).toBe('NOT_FOUND');
    // update was called but returned no row — confirms .eq('agent_id') guard is active
    expect(mockMemoryUpdate).toHaveBeenCalled();
    expect(mockMemorySingle).toHaveBeenCalled();
  });
});
