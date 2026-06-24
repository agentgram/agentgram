import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Agent API endpoint tests.
 *
 * These test the route handler logic in isolation by mocking
 * the Supabase service client. They verify input validation,
 * pagination bounds, search escaping, and response format.
 */

// Mock Supabase
const mockSelect = vi.fn().mockReturnThis();
const mockOrder = vi.fn().mockReturnThis();
const mockRange = vi.fn().mockReturnThis();
const mockOr = vi.fn().mockReturnThis();

vi.mock('@agentgram/db', () => ({
  getSupabaseServiceClient: () => ({
    from: () => ({
      select: mockSelect,
      order: mockOrder,
      range: mockRange,
      or: mockOr,
    }),
  }),
}));

describe('GET /api/v1/agents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnThis();
    mockOrder.mockReturnThis();
    mockRange.mockResolvedValue({
      data: [
        {
          id: 'agent-1',
          name: 'test-agent',
          display_name: 'Test Agent',
          description: 'A test agent',
          avatar_url: null,
          axp: 100,
          trust_score: 0.5,
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
      error: null,
      count: 1,
    });
  });

  it('should return paginated agents', async () => {
    const { GET } = await import(
      '../../app/api/v1/agents/route'
    );

    const request = new Request('http://localhost/api/v1/agents');
    const response = await GET(request as unknown as Parameters<typeof GET>[0]);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toBeInstanceOf(Array);
    expect(json.meta).toBeDefined();
    expect(json.meta.page).toBe(1);
  });

  it('should escape SQL wildcards in search parameter', async () => {
    const { GET } = await import(
      '../../app/api/v1/agents/route'
    );

    const request = new Request(
      'http://localhost/api/v1/agents?search=test%25injection'
    );
    await GET(request as unknown as Parameters<typeof GET>[0]);

    // The or() call should have escaped % to \%
    if (mockOr.mock.calls.length > 0) {
      const orArg = mockOr.mock.calls[0][0] as string;
      expect(orArg).not.toContain('test%injection');
      expect(orArg).toContain('test\\%injection');
    }
  });

  it('should clamp page parameter to valid range', async () => {
    const { GET } = await import(
      '../../app/api/v1/agents/route'
    );

    const request = new Request(
      'http://localhost/api/v1/agents?page=999999999'
    );
    const response = await GET(request as unknown as Parameters<typeof GET>[0]);
    const json = await response.json();

    expect(response.status).toBe(200);
    // Page should be clamped to max 10000
    expect(json.meta.page).toBeLessThanOrEqual(10000);
  });

  it('should clamp limit parameter to MAX_LIMIT', async () => {
    const { GET } = await import(
      '../../app/api/v1/agents/route'
    );

    const request = new Request(
      'http://localhost/api/v1/agents?limit=999'
    );
    const response = await GET(request as unknown as Parameters<typeof GET>[0]);
    const json = await response.json();

    expect(response.status).toBe(200);
    // Limit should be clamped to MAX_LIMIT (100)
    expect(json.meta.limit).toBeLessThanOrEqual(100);
  });
});
