import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const DEVELOPER_ID = 'dev-test-001';
const AGENT_ID = 'agent-test-001';
const STORY_POST_ID = 'post-story-001';

const MOCK_AGENT = {
  id: AGENT_ID,
  name: 'aria',
  display_name: 'Aria — your story companion',
};

const MOCK_STORY_POST = {
  id: STORY_POST_ID,
  author_id: AGENT_ID,
  title: 'The Silver Realm Chronicles',
  metadata: {
    world_name: 'The Silver Realm Chronicles',
    world_slug: 'silver-realm',
    chapter_label: 'Chapter 12 · The Convergence',
  },
  created_at: new Date().toISOString(),
};

const mockPostsLimit = vi.fn();
const mockPostsOrder = vi.fn();
const mockPostsIn = vi.fn();
const mockPostsEq = vi.fn();
const mockPostsSelect = vi.fn();

const mockAgentsLimit = vi.fn();
const mockAgentsEq = vi.fn();
const mockAgentsSelect = vi.fn();

const mockFrom = vi.fn();

vi.mock('@agentgram/db', () => ({
  getSupabaseServiceClient: () => ({ from: mockFrom }),
}));

vi.mock('@/lib/auth/developer', () => ({
  withDeveloperAuth: (handler: unknown) => handler,
}));

function makeReq(developerId: string | null = DEVELOPER_ID): NextRequest {
  const req = new NextRequest('http://localhost/api/v1/sessions/last-story');
  if (developerId) req.headers.set('x-developer-id', developerId);
  return req;
}

function setupSuccess() {
  // agents query chain
  mockAgentsLimit.mockResolvedValue({
    data: [MOCK_AGENT],
    error: null,
  });
  mockAgentsEq.mockReturnValue({ limit: mockAgentsLimit });
  mockAgentsSelect.mockReturnValue({ eq: mockAgentsEq });

  // posts query chain
  mockPostsLimit.mockResolvedValue({
    data: [MOCK_STORY_POST],
    error: null,
  });
  mockPostsOrder.mockReturnValue({ limit: mockPostsLimit });
  mockPostsIn.mockReturnValue({ order: mockPostsOrder });
  mockPostsEq.mockReturnValue({ in: mockPostsIn });
  mockPostsSelect.mockReturnValue({ eq: mockPostsEq });

  mockFrom.mockImplementation((table: string) => {
    if (table === 'agents') return { select: mockAgentsSelect };
    if (table === 'posts') return { select: mockPostsSelect };
    return {};
  });
}

function setupNoAgents() {
  mockAgentsLimit.mockResolvedValue({ data: [], error: null });
  mockAgentsEq.mockReturnValue({ limit: mockAgentsLimit });
  mockAgentsSelect.mockReturnValue({ eq: mockAgentsEq });
  mockFrom.mockImplementation((table: string) => {
    if (table === 'agents') return { select: mockAgentsSelect };
    return {};
  });
}

function setupNoStories() {
  mockAgentsLimit.mockResolvedValue({ data: [MOCK_AGENT], error: null });
  mockAgentsEq.mockReturnValue({ limit: mockAgentsLimit });
  mockAgentsSelect.mockReturnValue({ eq: mockAgentsEq });

  mockPostsLimit.mockResolvedValue({ data: [], error: null });
  mockPostsOrder.mockReturnValue({ limit: mockPostsLimit });
  mockPostsIn.mockReturnValue({ order: mockPostsOrder });
  mockPostsEq.mockReturnValue({ in: mockPostsIn });
  mockPostsSelect.mockReturnValue({ eq: mockPostsEq });

  mockFrom.mockImplementation((table: string) => {
    if (table === 'agents') return { select: mockAgentsSelect };
    if (table === 'posts') return { select: mockPostsSelect };
    return {};
  });
}

describe('GET /api/v1/sessions/last-story', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when x-developer-id header is absent', async () => {
    const { GET } = await import(
      '../../app/api/v1/sessions/last-story/route'
    );
    const req = makeReq(null);
    const res = await GET(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 200 with null when developer has no agents', async () => {
    const { GET } = await import(
      '../../app/api/v1/sessions/last-story/route'
    );
    setupNoAgents();
    const res = await GET(makeReq());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toBeNull();
  });

  it('returns 200 with null when developer has agents but no story posts', async () => {
    const { GET } = await import(
      '../../app/api/v1/sessions/last-story/route'
    );
    setupNoStories();
    const res = await GET(makeReq());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toBeNull();
  });

  it('returns 200 with LastStorySessionPayload on success', async () => {
    const { GET } = await import(
      '../../app/api/v1/sessions/last-story/route'
    );
    setupSuccess();
    const res = await GET(makeReq());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toMatchObject({
      worldName: 'The Silver Realm Chronicles',
      agentName: 'Aria — your story companion',
      resumeHref: '/session/silver-realm',
      agentSlug: 'aria',
      worldSlug: 'silver-realm',
      chapterLabel: 'Chapter 12 · The Convergence',
    });
  });

  it('builds resumeHref from worldSlug', async () => {
    const { GET } = await import(
      '../../app/api/v1/sessions/last-story/route'
    );
    setupSuccess();
    const res = await GET(makeReq());
    const json = await res.json();
    expect(json.data.resumeHref).toBe('/session/silver-realm');
  });

  it('falls back to post id as worldSlug when metadata lacks world_slug', async () => {
    const { GET } = await import(
      '../../app/api/v1/sessions/last-story/route'
    );
    // Arrange: story post without world_slug in metadata
    mockAgentsLimit.mockResolvedValue({ data: [MOCK_AGENT], error: null });
    mockAgentsEq.mockReturnValue({ limit: mockAgentsLimit });
    mockAgentsSelect.mockReturnValue({ eq: mockAgentsEq });

    const postWithoutSlug = { ...MOCK_STORY_POST, metadata: {} };
    mockPostsLimit.mockResolvedValue({ data: [postWithoutSlug], error: null });
    mockPostsOrder.mockReturnValue({ limit: mockPostsLimit });
    mockPostsIn.mockReturnValue({ order: mockPostsOrder });
    mockPostsEq.mockReturnValue({ in: mockPostsIn });
    mockPostsSelect.mockReturnValue({ eq: mockPostsEq });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'agents') return { select: mockAgentsSelect };
      if (table === 'posts') return { select: mockPostsSelect };
      return {};
    });

    const res = await GET(makeReq());
    const json = await res.json();
    expect(json.data.worldSlug).toBe(STORY_POST_ID);
    expect(json.data.resumeHref).toBe(`/session/${STORY_POST_ID}`);
  });

  it('returns 500 when agents DB query fails', async () => {
    const { GET } = await import(
      '../../app/api/v1/sessions/last-story/route'
    );
    mockAgentsLimit.mockResolvedValue({ data: null, error: { code: 'DB_ERROR' } });
    mockAgentsEq.mockReturnValue({ limit: mockAgentsLimit });
    mockAgentsSelect.mockReturnValue({ eq: mockAgentsEq });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'agents') return { select: mockAgentsSelect };
      return {};
    });

    const res = await GET(makeReq());
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
  });
});
