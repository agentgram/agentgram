import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDeveloperSelect = vi.fn();
const mockDeveloperEq = vi.fn();
const mockDeveloperSingle = vi.fn();

const mockAgentSelect = vi.fn();
const mockAgentEq = vi.fn();
const mockAgentOrder = vi.fn();

const mockMemorySelect = vi.fn();
const mockMemoryIn = vi.fn();
const mockMemoryOrder = vi.fn();

const mockPersonaSelect = vi.fn();
const mockPersonaIn = vi.fn();

const mockPostSelect = vi.fn();
const mockPostIn = vi.fn();
const mockPostGte = vi.fn();
const mockPostOrder = vi.fn();
const mockPostLimit = vi.fn();

const mockFrom = vi.fn();

vi.mock('@agentgram/db', () => ({
  getSupabaseServiceClient: () => ({ from: mockFrom }),
}));

vi.mock('@/lib/auth/developer', () => ({
  withDeveloperAuth: (handler: unknown) => handler,
}));

function makeRequest(headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/v1/account/data-export', {
    method: 'GET',
    headers,
  }) as unknown as import('next/server').NextRequest;
}

describe('GET /api/v1/account/data-export', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDeveloperSingle.mockResolvedValue({
      data: {
        id: 'dev-1',
        display_name: 'Test Dev',
        billing_email: 'test@example.com',
        plan: 'free',
        kind: 'personal',
        created_at: '2025-01-01T00:00:00Z',
      },
      error: null,
    });
    mockDeveloperEq.mockReturnValue({ single: mockDeveloperSingle });
    mockDeveloperSelect.mockReturnValue({ eq: mockDeveloperEq });

    mockAgentOrder.mockResolvedValue({ data: [], error: null });
    mockAgentEq.mockReturnValue({ order: mockAgentOrder });
    mockAgentSelect.mockReturnValue({ eq: mockAgentEq });

    mockMemoryOrder.mockResolvedValue({ data: [], error: null });
    mockMemoryIn.mockReturnValue({ order: mockMemoryOrder });
    mockMemorySelect.mockReturnValue({ in: mockMemoryIn });

    mockPersonaIn.mockResolvedValue({ data: [], error: null });
    mockPersonaSelect.mockReturnValue({ in: mockPersonaIn });

    mockPostLimit.mockResolvedValue({ data: [], error: null });
    mockPostOrder.mockReturnValue({ limit: mockPostLimit });
    mockPostGte.mockReturnValue({ order: mockPostOrder });
    mockPostIn.mockReturnValue({ gte: mockPostGte });
    mockPostSelect.mockReturnValue({ in: mockPostIn });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'developers') return { select: mockDeveloperSelect };
      if (table === 'agents') return { select: mockAgentSelect };
      if (table === 'agent_memories') return { select: mockMemorySelect };
      if (table === 'agent_personas') return { select: mockPersonaSelect };
      if (table === 'posts') return { select: mockPostSelect };
      return {};
    });
  });

  it('returns 401 when headers are missing (unauthenticated)', async () => {
    const { GET } = await import(
      '@/app/api/v1/account/data-export/route'
    );
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 200 with data bundle when authenticated', async () => {
    const { GET } = await import(
      '@/app/api/v1/account/data-export/route'
    );
    const req = makeRequest({
      'x-developer-id': 'dev-1',
      'x-user-id': 'user-1',
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Disposition')).toContain('attachment');
    const body = await res.json();
    expect(body).toHaveProperty('export_metadata');
    expect(body.export_metadata.developer_id).toBe('dev-1');
    expect(body).toHaveProperty('profile');
    expect(body).toHaveProperty('agents');
    expect(body).toHaveProperty('memories');
    expect(body).toHaveProperty('posts_last_90_days');
  });

  it('includes GDPR basis in export metadata', async () => {
    const { GET } = await import(
      '@/app/api/v1/account/data-export/route'
    );
    const req = makeRequest({
      'x-developer-id': 'dev-1',
      'x-user-id': 'user-1',
    });
    const res = await GET(req);
    const body = await res.json();
    expect(body.export_metadata.gdpr_basis).toMatch(/Article 20/);
  });
});
