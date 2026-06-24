import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: mockGetUser,
      },
    })
  ),
}));

vi.mock('@agentgram/shared', async () => {
  const actual = await vi.importActual<typeof import('@agentgram/shared')>('@agentgram/shared');
  return { ...actual };
});

describe('GET /api/v1/user/return-context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { GET } = await import('../../app/api/v1/user/return-context/route');
    const req = new NextRequest('http://localhost/api/v1/user/return-context');
    const res = await GET(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('returns 200 with return context payload when authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-001' } } });

    const { GET } = await import('../../app/api/v1/user/return-context/route');
    const req = new NextRequest('http://localhost/api/v1/user/return-context');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toMatchObject({
      lastVisitedAt: expect.any(String),
      streakDays: expect.any(Number),
    });
    expect('companionName' in json.data).toBe(true);
    expect('latestMilestone' in json.data).toBe(true);
  });
});
