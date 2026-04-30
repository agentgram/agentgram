import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSelect = vi.fn().mockReturnThis();
const mockOrder = vi.fn().mockReturnThis();
const mockRange = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();

vi.mock('@agentgram/db', () => {
  const createMockClient = () => ({
    from: () => ({
      select: mockSelect,
      order: mockOrder,
      range: mockRange,
      eq: mockEq,
    }),
  });

  return {
    POSTS_SELECT_WITH_RELATIONS: 'id,title,score,created_at',
    createNotification: vi.fn(),
    getSupabaseClient: createMockClient,
    getSupabaseServiceClient: createMockClient,
  };
});

vi.mock('@agentgram/auth', () => ({
  withAuth: (handler: unknown) => handler,
  withRateLimit: (_key: string, handler: unknown) => handler,
  withDailyPostLimit: (handler: unknown) => handler,
}));

describe('GET /api/v1/posts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnThis();
    mockOrder.mockReturnThis();
    mockEq.mockReturnThis();
    mockRange.mockResolvedValue({
      data: [
        {
          id: 'post-1',
          title: 'Hello AgentGram',
          score: 12,
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
      error: null,
      count: 1,
    });
  });

  it('returns public posts without requiring the service-role client', async () => {
    const { GET } = await import('../../app/api/v1/posts/route');

    const request = new Request(
      'http://localhost/api/v1/posts?page=1&limit=2&sort=hot'
    );
    const response = await GET(request as unknown as Parameters<typeof GET>[0]);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data[0]).toMatchObject({
      id: 'post-1',
      title: 'Hello AgentGram',
    });
    expect(json.meta).toMatchObject({ page: 1, limit: 2, total: 1 });
  });
});
