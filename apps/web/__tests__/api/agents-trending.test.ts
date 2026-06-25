import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * Trending agents API endpoint tests.
 *
 * Tests the /api/v1/agents/trending route handler logic in isolation
 * by mocking the Supabase client against the trending_agents_aggregation view.
 * The view returns pre-ranked rows; the route just maps them to TrendingAgentEntry.
 */

const mockLimit = vi.fn();
const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });

const mockFrom = vi.fn((table: string) => {
  if (table === 'trending_agents_aggregation') {
    return { select: mockSelect };
  }
  return { select: vi.fn() };
});

vi.mock('@agentgram/db', () => ({
  getSupabaseClient: () => ({ from: mockFrom }),
  getSupabaseServiceClient: () => ({ from: mockFrom }),
}));

const VIEW_ROWS = [
  {
    slug: 'aria-companion',
    display_name: 'Aria',
    rank: 1,
    total_comment_count: 234,
    verification_state: 'verified',
  },
  {
    slug: 'muse-creative',
    display_name: 'Muse',
    rank: 2,
    total_comment_count: 187,
    verification_state: 'unverified',
  },
  {
    slug: 'sage-mentor',
    display_name: 'Sage',
    rank: 3,
    total_comment_count: 156,
    verification_state: 'verified',
  },
];

function makeRequest() {
  return new NextRequest('http://localhost/api/v1/agents/trending');
}

describe('GET /api/v1/agents/trending', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOrder.mockReturnValue({ limit: mockLimit });
    mockSelect.mockReturnValue({ order: mockOrder });
    mockLimit.mockResolvedValue({ data: VIEW_ROWS, error: null });
  });

  it('returns 200 with ranked trending agents from view', async () => {
    const { GET } = await import('../../app/api/v1/agents/trending/route');
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data).toHaveLength(3);
    expect(body.data[0].rank).toBe(1);
    expect(body.data[0].slug).toBe('aria-companion');
    expect(body.data[0].commentCount).toBe(234);
    expect(body.data[0].verified).toBe(true);
  });

  it('queries trending_agents_aggregation view ordered by rank with correct limit', async () => {
    const { GET } = await import('../../app/api/v1/agents/trending/route');
    await GET(makeRequest());

    expect(mockFrom).toHaveBeenCalledWith('trending_agents_aggregation');
    expect(mockSelect).toHaveBeenCalledWith(
      'slug, display_name, rank, total_comment_count, verification_state'
    );
    expect(mockOrder).toHaveBeenCalledWith('rank', { ascending: true });
    expect(mockLimit).toHaveBeenCalledWith(10);
  });

  it('ranks agents by ascending rank from view (highest comment count first)', async () => {
    const { GET } = await import('../../app/api/v1/agents/trending/route');
    const res = await GET(makeRequest());
    const body = await res.json();

    const slugs = body.data.map((a: { slug: string }) => a.slug);
    expect(slugs).toEqual(['aria-companion', 'muse-creative', 'sage-mentor']);
  });

  it('sets verified=true only for agents with verification_state=verified', async () => {
    const { GET } = await import('../../app/api/v1/agents/trending/route');
    const res = await GET(makeRequest());
    const body = await res.json();

    const ariaEntry = body.data.find((a: { slug: string }) => a.slug === 'aria-companion');
    const museEntry = body.data.find((a: { slug: string }) => a.slug === 'muse-creative');
    expect(ariaEntry?.verified).toBe(true);
    expect(museEntry?.verified).toBe(false);
  });

  it('returns empty array when view returns no rows', async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });

    const { GET } = await import('../../app/api/v1/agents/trending/route');
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data).toEqual([]);
  });

  it('returns empty array when view returns null data', async () => {
    mockLimit.mockResolvedValue({ data: null, error: null });

    const { GET } = await import('../../app/api/v1/agents/trending/route');
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data).toEqual([]);
  });

  it('returns 500 when view query fails', async () => {
    mockLimit.mockResolvedValue({ data: null, error: { message: 'view not found' } });

    const { GET } = await import('../../app/api/v1/agents/trending/route');
    const res = await GET(makeRequest());
    expect(res.status).toBe(500);
  });

  it('maps total_comment_count to commentCount as a number', async () => {
    mockLimit.mockResolvedValue({
      data: [
        {
          slug: 'bignum-agent',
          display_name: 'BigNum',
          rank: 1,
          total_comment_count: '9999',
          verification_state: 'verified',
        },
      ],
      error: null,
    });

    const { GET } = await import('../../app/api/v1/agents/trending/route');
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(body.data[0].commentCount).toBe(9999);
    expect(typeof body.data[0].commentCount).toBe('number');
  });
});
