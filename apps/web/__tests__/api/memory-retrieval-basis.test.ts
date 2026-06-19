import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth/developer', () => ({
  withDeveloperAuth: (handler: unknown) => handler,
}));

describe('GET /api/v1/agents/me/memories/[id]/retrieval-basis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns correct shape with recency, relevance, diversity fields', async () => {
    const { GET } = await import(
      '../../app/api/v1/agents/me/memories/[id]/retrieval-basis/route'
    );

    const response = await GET(
      new Request('http://localhost/api/v1/agents/me/memories/mem-123/retrieval-basis', {
        headers: { 'x-developer-id': 'dev-1' },
      }) as Parameters<typeof GET>[0],
      { params: Promise.resolve({ id: 'mem-123' }) }
    );

    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.memoryId).toBe('mem-123');
    expect(['high', 'medium', 'low']).toContain(json.data.recency);
    expect(['high', 'medium', 'low']).toContain(json.data.relevance);
    expect(['high', 'medium', 'low']).toContain(json.data.diversity);
  });

  it('returns 401 when x-developer-id header is missing', async () => {
    const { GET } = await import(
      '../../app/api/v1/agents/me/memories/[id]/retrieval-basis/route'
    );

    const response = await GET(
      new Request('http://localhost/api/v1/agents/me/memories/mem-123/retrieval-basis') as Parameters<typeof GET>[0],
      { params: Promise.resolve({ id: 'mem-123' }) }
    );

    const json = await response.json();
    expect(response.status).toBe(401);
    expect(json.error.code).toBe('UNAUTHORIZED');
  });

  it('returns deterministic scores for the same memory id', async () => {
    const { GET } = await import(
      '../../app/api/v1/agents/me/memories/[id]/retrieval-basis/route'
    );

    const makeReq = (id: string) =>
      GET(
        new Request(`http://localhost/api/v1/agents/me/memories/${id}/retrieval-basis`, {
          headers: { 'x-developer-id': 'dev-1' },
        }) as Parameters<typeof GET>[0],
        { params: Promise.resolve({ id }) }
      );

    const [r1, r2] = await Promise.all([makeReq('stable-id'), makeReq('stable-id')]);
    const [j1, j2] = await Promise.all([r1.json(), r2.json()]);

    expect(j1.data.recency).toBe(j2.data.recency);
    expect(j1.data.relevance).toBe(j2.data.relevance);
    expect(j1.data.diversity).toBe(j2.data.diversity);
  });

  it('returns different scores for different memory ids', async () => {
    const { GET } = await import(
      '../../app/api/v1/agents/me/memories/[id]/retrieval-basis/route'
    );

    const makeReq = (id: string) =>
      GET(
        new Request(`http://localhost/api/v1/agents/me/memories/${id}/retrieval-basis`, {
          headers: { 'x-developer-id': 'dev-1' },
        }) as Parameters<typeof GET>[0],
        { params: Promise.resolve({ id }) }
      );

    // mem-1 → { recency:'low', relevance:'high', diversity:'medium' }
    // mem-2 → { recency:'high', relevance:'medium', diversity:'low' }
    const [rA, rB] = await Promise.all([makeReq('mem-1'), makeReq('mem-2')]);
    const [jA, jB] = await Promise.all([rA.json(), rB.json()]);

    // At least one factor should differ between very different ids
    const allSame =
      jA.data.recency === jB.data.recency &&
      jA.data.relevance === jB.data.relevance &&
      jA.data.diversity === jB.data.diversity;

    expect(allSame).toBe(false);
  });
});
