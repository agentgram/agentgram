import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAgentEq = vi.fn();
const mockAgentSingle = vi.fn();
const mockAgentSelect = vi.fn();
const mockMemorySingle = vi.fn();
const mockMemorySelectAfterWrite = vi.fn();
const mockMemoryInsert = vi.fn();
const mockMemoryUpdateEqAgent = vi.fn();
const mockMemoryUpdateEqId = vi.fn();
const mockMemoryUpdate = vi.fn();
const mockMemoryDeleteEqAgent = vi.fn();
const mockMemoryDeleteEqId = vi.fn();
const mockMemoryDelete = vi.fn();
const mockFrom = vi.fn();

vi.mock('@agentgram/db', () => ({
  getSupabaseServiceClient: () => ({
    from: mockFrom,
  }),
}));

vi.mock('@/lib/auth/developer', () => ({
  withDeveloperAuth: (handler: unknown) => handler,
}));

describe('developer memory controls API', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockAgentSingle.mockResolvedValue({
      data: {
        id: 'agent-1',
        developer_id: 'dev-1',
      },
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
        category: 'relationship_context',
        is_public: false,
        created_at: '2026-05-08T12:00:00.000Z',
        updated_at: '2026-05-08T12:00:00.000Z',
      },
      error: null,
    });
    mockMemorySelectAfterWrite.mockReturnValue({ single: mockMemorySingle });
    mockMemoryInsert.mockReturnValue({ select: mockMemorySelectAfterWrite });

    mockMemoryUpdateEqAgent.mockReturnValue({
      select: mockMemorySelectAfterWrite,
    });
    mockMemoryUpdateEqId.mockReturnValue({ eq: mockMemoryUpdateEqAgent });
    mockMemoryUpdate.mockReturnValue({ eq: mockMemoryUpdateEqId });

    mockMemoryDeleteEqAgent.mockResolvedValue({ error: null });
    mockMemoryDeleteEqId.mockReturnValue({ eq: mockMemoryDeleteEqAgent });
    mockMemoryDelete.mockReturnValue({ eq: mockMemoryDeleteEqId });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'agents') {
        return {
          select: mockAgentSelect,
        };
      }

      if (table === 'agent_memories') {
        return {
          insert: mockMemoryInsert,
          update: mockMemoryUpdate,
          delete: mockMemoryDelete,
        };
      }

      return {};
    });
  });

  it('lets a developer remember a memory for an owned agent', async () => {
    const { POST } =
      await import('../../app/api/v1/developers/me/agent-memories/route');

    const response = await POST(
      new Request('http://localhost/api/v1/developers/me/agent-memories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-developer-id': 'dev-1',
        },
        body: JSON.stringify({
          agentId: 'agent-1',
          key: 'latest_focus',
          value: 'Preserve the release blocker.',
          category: 'relationship_context',
          isPublic: false,
        }),
      }) as Parameters<typeof POST>[0]
    );
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(mockMemoryInsert).toHaveBeenCalledWith({
      agent_id: 'agent-1',
      key: 'latest_focus',
      value: 'Preserve the release blocker.',
      category: 'relationship_context',
      is_public: false,
    });
  });

  it('rejects memory writes for agents outside the developer account', async () => {
    const { POST } =
      await import('../../app/api/v1/developers/me/agent-memories/route');

    mockAgentSingle.mockResolvedValueOnce({
      data: {
        id: 'agent-1',
        developer_id: 'dev-2',
      },
      error: null,
    });

    const response = await POST(
      new Request('http://localhost/api/v1/developers/me/agent-memories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-developer-id': 'dev-1',
        },
        body: JSON.stringify({
          agentId: 'agent-1',
          key: 'latest_focus',
          value: 'Preserve the release blocker.',
          category: 'relationship_context',
        }),
      }) as Parameters<typeof POST>[0]
    );
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error.code).toBe('FORBIDDEN');
    expect(mockMemoryInsert).not.toHaveBeenCalled();
  });

  it('edits a memory only after checking agent ownership', async () => {
    const { PATCH } =
      await import('../../app/api/v1/developers/me/agent-memories/[id]/route');

    const response = await PATCH(
      new Request(
        'http://localhost/api/v1/developers/me/agent-memories/memory-1',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-developer-id': 'dev-1',
          },
          body: JSON.stringify({
            agentId: 'agent-1',
            key: 'latest_focus',
            value: 'Preserve the updated release blocker.',
            category: 'relationship_context',
            isPublic: true,
          }),
        }
      ) as Parameters<typeof PATCH>[0],
      { params: Promise.resolve({ id: 'memory-1' }) }
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockMemoryUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'latest_focus',
        value: 'Preserve the updated release blocker.',
        category: 'relationship_context',
        is_public: true,
      })
    );
    expect(mockMemoryUpdateEqAgent).toHaveBeenCalledWith('agent_id', 'agent-1');
  });

  it('forgets a memory with both memory id and owned agent id constraints', async () => {
    const { DELETE } =
      await import('../../app/api/v1/developers/me/agent-memories/[id]/route');

    const response = await DELETE(
      new Request(
        'http://localhost/api/v1/developers/me/agent-memories/memory-1?agentId=agent-1',
        {
          method: 'DELETE',
          headers: {
            'x-developer-id': 'dev-1',
          },
        }
      ) as Parameters<typeof DELETE>[0],
      { params: Promise.resolve({ id: 'memory-1' }) }
    );

    expect(response.status).toBe(204);
    expect(mockMemoryDeleteEqAgent).toHaveBeenCalledWith('agent_id', 'agent-1');
  });
});
