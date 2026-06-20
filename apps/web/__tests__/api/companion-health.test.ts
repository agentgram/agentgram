import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockAgentSelect = vi.fn();
const mockAgentEq = vi.fn();
const mockAgentSingle = vi.fn();

const mockMemoryEq = vi.fn();
const mockMemorySelect = vi.fn();

const mockFrom = vi.fn();

vi.mock('@agentgram/db', () => ({
  getSupabaseServiceClient: () => ({
    from: mockFrom,
  }),
}));

vi.mock('@/lib/auth/developer', () => ({
  withDeveloperAuth: (handler: unknown) => handler,
}));

function makeRequest(agentId?: string) {
  const url = agentId
    ? `http://localhost/api/v1/user/companion-health?agentId=${agentId}`
    : 'http://localhost/api/v1/user/companion-health';

  const headers = new Headers();
  headers.set('x-developer-id', 'dev-1');
  return new NextRequest(url, { headers });
}

describe('GET /api/v1/user/companion-health', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // agent lookup
    mockAgentSingle.mockResolvedValue({
      data: { id: 'agent-1', last_active: '2026-06-15T12:00:00.000Z', developer_id: 'dev-1' },
      error: null,
    });
    mockAgentEq.mockReturnValue({ single: mockAgentSingle });
    mockAgentSelect.mockReturnValue({ eq: mockAgentEq });

    // memory count
    mockMemoryEq.mockResolvedValue({ count: 5, error: null });
    mockMemorySelect.mockReturnValue({ eq: mockMemoryEq });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'agents') return { select: mockAgentSelect };
      if (table === 'agent_memories') return { select: mockMemorySelect };
      return {};
    });
  });

  it('returns 400 when agentId is missing', async () => {
    const { GET } = await import(
      '@/app/api/v1/user/companion-health/route'
    );
    const req = makeRequest();
    // Remove agentId from URL
    const reqNoAgent = new NextRequest('http://localhost/api/v1/user/companion-health');
    const headers = new Headers(reqNoAgent.headers);
    headers.set('x-developer-id', 'dev-1');
    const authedReq = new NextRequest('http://localhost/api/v1/user/companion-health', { headers });

    const res = await GET(authedReq);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('BAD_REQUEST');
  });

  it('returns 401 when developer header is missing', async () => {
    const { GET } = await import(
      '@/app/api/v1/user/companion-health/route'
    );
    const req = new NextRequest('http://localhost/api/v1/user/companion-health?agentId=agent-1');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 404 when agent is not found', async () => {
    mockAgentSingle.mockResolvedValueOnce({ data: null, error: { message: 'not found' } });

    const { GET } = await import(
      '@/app/api/v1/user/companion-health/route'
    );
    const req = makeRequest('agent-999');
    const res = await GET(req);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('returns 403 when agent belongs to a different developer', async () => {
    mockAgentSingle.mockResolvedValueOnce({
      data: { id: 'agent-1', last_active: '2026-06-15T12:00:00.000Z', developer_id: 'dev-other' },
      error: null,
    });

    const { GET } = await import(
      '@/app/api/v1/user/companion-health/route'
    );
    const req = makeRequest('agent-1');
    const res = await GET(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('returns 200 with correct response shape', async () => {
    const { GET } = await import(
      '@/app/api/v1/user/companion-health/route'
    );
    const req = makeRequest('agent-1');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toMatchObject({
      agentId: 'agent-1',
      lastActiveAt: '2026-06-15T12:00:00.000Z',
    });
    expect(typeof body.data.frequencyScore).toBe('number');
    expect(typeof body.data.memoryDepth).toBe('number');
    expect(typeof body.data.milestoneCount).toBe('number');
  });

  it('frequencyScore is between 0 and 100', async () => {
    const { GET } = await import(
      '@/app/api/v1/user/companion-health/route'
    );
    const req = makeRequest('agent-1');
    const res = await GET(req);
    const body = await res.json();
    expect(body.data.frequencyScore).toBeGreaterThanOrEqual(0);
    expect(body.data.frequencyScore).toBeLessThanOrEqual(100);
  });
});
