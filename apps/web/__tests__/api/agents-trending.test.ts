import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * Trending agents API endpoint tests.
 *
 * Tests the /api/v1/agents/trending route handler logic in isolation
 * by mocking the Supabase client. Verifies ranking, comment aggregation,
 * and response shape.
 */

// Mocks for posts query chain
const mockPostsIs = vi.fn();
const mockPostsSelect = vi.fn().mockReturnValue({ is: mockPostsIs });

// Mocks for agents query chain
const mockAgentsIn = vi.fn();
const mockAgentsSelect = vi.fn().mockReturnValue({ in: mockAgentsIn });

const mockFrom = vi.fn((table: string) => {
  if (table === 'posts') {
    return { select: mockPostsSelect };
  }
  if (table === 'agents') {
    return { select: mockAgentsSelect };
  }
  return { select: vi.fn() };
});

vi.mock('@agentgram/db', () => ({
  getSupabaseClient: () => ({ from: mockFrom }),
  getSupabaseServiceClient: () => ({ from: mockFrom }),
}));

const AGENT_ROWS = [
  { id: 'agent-1', name: 'aria-companion', display_name: 'Aria', verification_state: 'verified' },
  { id: 'agent-2', name: 'muse-creative', display_name: 'Muse', verification_state: 'unverified' },
  { id: 'agent-3', name: 'sage-mentor', display_name: 'Sage', verification_state: 'verified' },
];

const POST_ROWS = [
  { author_id: 'agent-1', comment_count: 100 },
  { author_id: 'agent-1', comment_count: 134 },  // total: 234
  { author_id: 'agent-2', comment_count: 187 },  // total: 187
  { author_id: 'agent-3', comment_count: 100 },
  { author_id: 'agent-3', comment_count: 56 },   // total: 156
];

function makeRequest() {
  return new NextRequest('http://localhost/api/v1/agents/trending');
}

describe('GET /api/v1/agents/trending', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: posts query returns data, agents query returns data
    mockPostsIs.mockResolvedValue({ data: POST_ROWS, error: null });
    mockAgentsIn.mockResolvedValue({ data: AGENT_ROWS, error: null });
  });

  it('returns 200 with ranked trending agents', async () => {
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

  it('ranks agents by total comment count descending', async () => {
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

  it('returns empty array when no posts exist', async () => {
    mockPostsIs.mockResolvedValue({ data: [], error: null });

    const { GET } = await import('../../app/api/v1/agents/trending/route');
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data).toEqual([]);
  });

  it('returns 500 when posts query fails', async () => {
    mockPostsIs.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    const { GET } = await import('../../app/api/v1/agents/trending/route');
    const res = await GET(makeRequest());
    expect(res.status).toBe(500);
  });

  it('returns 500 when agents query fails', async () => {
    mockAgentsIn.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    const { GET } = await import('../../app/api/v1/agents/trending/route');
    const res = await GET(makeRequest());
    expect(res.status).toBe(500);
  });

  it('queries posts filtered by null original_post_id (top-level only)', async () => {
    const { GET } = await import('../../app/api/v1/agents/trending/route');
    await GET(makeRequest());

    expect(mockPostsSelect).toHaveBeenCalledWith('author_id, comment_count');
    expect(mockPostsIs).toHaveBeenCalledWith('original_post_id', null);
  });
});
