import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const AGENT_ID = 'agent-test-123';

const mockSingle = vi.fn();
const mockSelect = vi.fn().mockReturnThis();
const mockInsert = vi.fn().mockReturnThis();
const mockUpdate = vi.fn().mockReturnThis();
const mockDelete = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();
const mockOrder = vi.fn();

vi.mock('@agentgram/db', () => ({
  getSupabaseServiceClient: () => ({
    from: () => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      order: mockOrder,
    }),
  }),
}));

vi.mock('@agentgram/auth', () => ({
  withAuth: <T extends (...args: never[]) => unknown>(handler: T) => handler,
}));

function makeReq(url: string, init?: RequestInit): NextRequest {
  const req = new NextRequest(url, init);
  req.headers.set('x-agent-id', AGENT_ID);
  return req;
}

describe('POST /api/v1/agents/me/memories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnThis();
    mockInsert.mockReturnThis();
    mockEq.mockReturnThis();
  });

  it('should reject missing category', async () => {
    const { POST } = await import('../../app/api/v1/agents/me/memories/route');

    const req = makeReq('http://localhost/api/v1/agents/me/memories', {
      method: 'POST',
      body: JSON.stringify({ key: 'k', value: 'v' }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.message).toContain('category');
  });

  it('should reject invalid category value', async () => {
    const { POST } = await import('../../app/api/v1/agents/me/memories/route');

    const req = makeReq('http://localhost/api/v1/agents/me/memories', {
      method: 'POST',
      body: JSON.stringify({
        key: 'k',
        value: 'v',
        category: 'invalid_cat',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.message).toContain('profile_fact');
    expect(json.error.message).toContain('relationship_context');
  });

  it('should accept profile_fact and pass to insert', async () => {
    const { POST } = await import('../../app/api/v1/agents/me/memories/route');

    mockSingle.mockResolvedValue({
      data: {
        id: 'mem-1',
        key: 'fav_color',
        value: 'blue',
        is_public: false,
        category: 'profile_fact',
      },
      error: null,
    });
    mockSelect.mockReturnValue({ single: mockSingle });

    const req = makeReq('http://localhost/api/v1/agents/me/memories', {
      method: 'POST',
      body: JSON.stringify({
        key: 'fav_color',
        value: 'blue',
        category: 'profile_fact',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'profile_fact' })
    );
  });

  it('should accept relationship_context', async () => {
    const { POST } = await import('../../app/api/v1/agents/me/memories/route');

    mockSingle.mockResolvedValue({
      data: {
        id: 'mem-2',
        key: 'ally',
        value: 'agent-x',
        is_public: true,
        category: 'relationship_context',
      },
      error: null,
    });
    mockSelect.mockReturnValue({ single: mockSingle });

    const req = makeReq('http://localhost/api/v1/agents/me/memories', {
      method: 'POST',
      body: JSON.stringify({
        key: 'ally',
        value: 'agent-x',
        isPublic: true,
        category: 'relationship_context',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'relationship_context',
        is_public: true,
      })
    );
  });
});

describe('GET /api/v1/agents/me/memories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnThis();
    mockEq.mockReturnThis();
  });

  it('should reject invalid category filter', async () => {
    const { GET } = await import('../../app/api/v1/agents/me/memories/route');

    const req = makeReq(
      'http://localhost/api/v1/agents/me/memories?category=bad'
    );

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.message).toContain('category');
  });

  it('should pass valid category filter to query', async () => {
    const { GET } = await import('../../app/api/v1/agents/me/memories/route');

    mockOrder.mockResolvedValue({ data: [], error: null });

    const req = makeReq(
      'http://localhost/api/v1/agents/me/memories?category=profile_fact'
    );

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    // eq called for agent_id + category
    expect(mockEq).toHaveBeenCalledWith('category', 'profile_fact');
  });

  it('should return all when no category filter', async () => {
    const { GET } = await import('../../app/api/v1/agents/me/memories/route');

    mockOrder.mockResolvedValue({ data: [], error: null });

    const req = makeReq('http://localhost/api/v1/agents/me/memories');

    const res = await GET(req);

    expect(res.status).toBe(200);
    // eq should only be called with agent_id, not category
    const categoryCalls = mockEq.mock.calls.filter(
      (c: unknown[]) => c[0] === 'category'
    );
    expect(categoryCalls).toHaveLength(0);
  });
});

describe('PATCH /api/v1/agents/me/memories/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdate.mockReturnThis();
    mockEq.mockReturnThis();
    mockSelect.mockReturnThis();
  });

  it('should reject invalid category on update', async () => {
    const { PATCH } =
      await import('../../app/api/v1/agents/me/memories/[id]/route');

    const req = makeReq('http://localhost/api/v1/agents/me/memories/mem-1', {
      method: 'PATCH',
      body: JSON.stringify({ category: 'wrong' }),
    });

    const res = await PATCH(req, {
      params: Promise.resolve({ id: 'mem-1' }),
    });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.message).toContain('category');
  });

  it('should accept valid category on update', async () => {
    const { PATCH } =
      await import('../../app/api/v1/agents/me/memories/[id]/route');

    mockSingle.mockResolvedValue({
      data: {
        id: 'mem-1',
        key: 'k',
        value: 'v',
        is_public: false,
        category: 'relationship_context',
      },
      error: null,
    });
    mockSelect.mockReturnValue({ single: mockSingle });

    const req = makeReq('http://localhost/api/v1/agents/me/memories/mem-1', {
      method: 'PATCH',
      body: JSON.stringify({ category: 'relationship_context' }),
    });

    const res = await PATCH(req, {
      params: Promise.resolve({ id: 'mem-1' }),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'relationship_context' })
    );
  });
});
