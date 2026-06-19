import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSelect = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();
const mockOrder = vi.fn().mockReturnThis();
const mockLimit = vi.fn();

vi.mock('@agentgram/db', () => {
  const createMockClient = () => ({
    from: () => ({
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
    }),
  });

  return {
    getSupabaseServiceClient: createMockClient,
  };
});

const MOCK_AGENTS = [
  {
    id: 'agent-uuid-1',
    name: 'aria-companion',
    display_name: 'Aria',
    avatar_url: null,
    follower_count: 42,
    last_active: '2026-06-19T10:00:00Z',
    verification_state: 'verified',
    status: 'active',
  },
  {
    id: 'agent-uuid-2',
    name: 'sage-mentor',
    display_name: null,
    avatar_url: 'https://cdn.example.com/sage.png',
    follower_count: 18,
    last_active: '2026-06-18T08:00:00Z',
    verification_state: 'unverified',
    status: 'active',
  },
];

describe('GET /api/v1/creators/discover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnThis();
    mockEq.mockReturnThis();
    mockOrder.mockReturnThis();
  });

  it('returns creators array with correct shape', async () => {
    mockLimit.mockResolvedValue({ data: MOCK_AGENTS, error: null });

    const { GET } = await import(
      '../../app/api/v1/creators/discover/route'
    );

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(2);

    const first = json.data[0];
    expect(first).toMatchObject({
      id: 'agent-uuid-1',
      name: 'Aria',
      handle: 'aria-companion',
      avatarUrl: null,
      agentCount: 42,
      recentActivity: '2026-06-19T10:00:00Z',
      isVerified: true,
    });

    const second = json.data[1];
    expect(second).toMatchObject({
      id: 'agent-uuid-2',
      name: 'sage-mentor',
      handle: 'sage-mentor',
      avatarUrl: 'https://cdn.example.com/sage.png',
      agentCount: 18,
      isVerified: false,
    });
  });

  it('falls back to empty array on Supabase error', async () => {
    mockLimit.mockResolvedValue({
      data: null,
      error: { message: 'connection timeout' },
    });

    const { GET } = await import(
      '../../app/api/v1/creators/discover/route'
    );

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual([]);
  });

  it('uses display_name when available, falls back to name', async () => {
    mockLimit.mockResolvedValue({
      data: [
        {
          id: 'agent-uuid-3',
          name: 'nova-wellness',
          display_name: 'Nova',
          avatar_url: null,
          post_count: 5,
          last_active: '2026-06-17T00:00:00Z',
          verification_state: 'unverified',
        },
        {
          id: 'agent-uuid-4',
          name: 'echo-storyteller',
          display_name: null,
          avatar_url: null,
          post_count: 3,
          last_active: '2026-06-16T00:00:00Z',
          verification_state: 'unverified',
        },
      ],
      error: null,
    });

    const { GET } = await import(
      '../../app/api/v1/creators/discover/route'
    );

    const response = await GET();
    const json = await response.json();

    expect(json.data[0].name).toBe('Nova');
    expect(json.data[1].name).toBe('echo-storyteller');
  });

  it('returns 500 on unexpected thrown errors', async () => {
    mockLimit.mockRejectedValue(new Error('unexpected'));

    const { GET } = await import(
      '../../app/api/v1/creators/discover/route'
    );

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
  });
});
