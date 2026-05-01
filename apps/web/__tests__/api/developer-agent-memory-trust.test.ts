import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAgentEq = vi.fn();
const mockAgentSingle = vi.fn();
const mockAgentUpdateEq = vi.fn();
const mockAgentUpdate = vi.fn();
const mockAgentSelect = vi.fn();
const mockPersonaSingle = vi.fn();
const mockPersonaEqActive = vi.fn();
const mockPersonaEqAgent = vi.fn();
const mockPersonaSelect = vi.fn();
const mockPersonaUpdateEq = vi.fn();
const mockPersonaUpdate = vi.fn();
const mockFrom = vi.fn();

vi.mock('@agentgram/db', () => ({
  getSupabaseServiceClient: () => ({
    from: mockFrom,
  }),
}));

vi.mock('@/lib/auth/developer', () => ({
  withDeveloperAuth: (handler: unknown) => handler,
}));

describe('PUT /api/v1/developers/me/agent-memory-trust', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockAgentSingle.mockResolvedValue({
      data: {
        id: 'agent-1',
        developer_id: 'dev-1',
        display_name: 'Sage Bot',
        description: 'Keeps release notes precise.',
      },
      error: null,
    });
    mockAgentEq.mockReturnValue({ single: mockAgentSingle });
    mockAgentSelect.mockReturnValue({ eq: mockAgentEq });
    mockAgentUpdateEq.mockResolvedValue({ error: null });
    mockAgentUpdate.mockReturnValue({ eq: mockAgentUpdateEq });

    mockPersonaSingle.mockResolvedValue({
      data: {
        id: 'persona-1',
        backstory: 'Old backstory',
      },
      error: null,
    });
    mockPersonaEqActive.mockReturnValue({ single: mockPersonaSingle });
    mockPersonaEqAgent.mockReturnValue({ eq: mockPersonaEqActive });
    mockPersonaSelect.mockReturnValue({ eq: mockPersonaEqAgent });
    mockPersonaUpdateEq.mockResolvedValue({ error: null });
    mockPersonaUpdate.mockReturnValue({ eq: mockPersonaUpdateEq });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'agents') {
        return {
          select: mockAgentSelect,
          update: mockAgentUpdate,
        };
      }

      if (table === 'agent_personas') {
        return {
          select: mockPersonaSelect,
          update: mockPersonaUpdate,
        };
      }

      return {};
    });
  });

  async function save(headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-developer-id': 'dev-1',
  }) {
    const { PUT } = await import(
      '../../app/api/v1/developers/me/agent-memory-trust/route'
    );

    const request = new Request(
      'http://localhost/api/v1/developers/me/agent-memory-trust',
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          agentId: 'agent-1',
          displayName: 'Sage Ops',
          description: 'Keeps release notes precise and audit-ready.',
          backstory: 'New backstory',
        }),
      }
    );

    return PUT(request as Parameters<typeof PUT>[0]);
  }

  it('returns a digest and rollback snapshot for owned agents', async () => {
    const response = await save();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.snapshot).toEqual({
      displayName: 'Sage Ops',
      description: 'Keeps release notes precise and audit-ready.',
      backstory: 'New backstory',
    });
    expect(json.data.rollbackSnapshot).toEqual({
      displayName: 'Sage Bot',
      description: 'Keeps release notes precise.',
      backstory: 'Old backstory',
    });
    expect(json.data.digest.changedFields).toHaveLength(3);

    expect(mockAgentUpdate).toHaveBeenCalledWith({
      display_name: 'Sage Ops',
      description: 'Keeps release notes precise and audit-ready.',
    });
    expect(mockPersonaUpdate).toHaveBeenCalledWith({
      backstory: 'New backstory',
    });
  });

  it('rolls back public profile fields if persona save fails', async () => {
    mockPersonaUpdateEq.mockResolvedValueOnce({
      error: { message: 'persona write failed' },
    });
    mockAgentUpdateEq
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: null });

    const response = await save();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error.message).toBe('Failed to save active backstory');
    expect(mockAgentUpdate).toHaveBeenNthCalledWith(1, {
      display_name: 'Sage Ops',
      description: 'Keeps release notes precise and audit-ready.',
    });
    expect(mockAgentUpdate).toHaveBeenNthCalledWith(2, {
      display_name: 'Sage Bot',
      description: 'Keeps release notes precise.',
    });
  });

  it('rejects edits for agents outside the developer account', async () => {
    mockAgentSingle.mockResolvedValueOnce({
      data: {
        id: 'agent-1',
        developer_id: 'dev-2',
        display_name: 'Sage Bot',
        description: 'Keeps release notes precise.',
      },
      error: null,
    });

    const response = await save();
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('FORBIDDEN');
    expect(mockAgentUpdate).not.toHaveBeenCalled();
    expect(mockPersonaUpdate).not.toHaveBeenCalled();
  });
});
