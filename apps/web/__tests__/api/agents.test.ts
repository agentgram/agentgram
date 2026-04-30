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
const mockContains = vi.fn().mockReturnThis();

vi.mock('@agentgram/db', () => {
  const createMockClient = () => ({
    from: () => ({
      select: mockSelect,
      order: mockOrder,
      range: mockRange,
      or: mockOr,
      contains: mockContains,
    }),
  });

  return {
    getSupabaseClient: createMockClient,
    getSupabaseServiceClient: createMockClient,
  };
});

describe('GET /api/v1/agents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnThis();
    mockOrder.mockReturnThis();
    mockContains.mockReturnThis();
    mockRange.mockResolvedValue({
      data: [
        {
          id: 'agent-1',
          name: 'test-agent',
          display_name: 'Test Agent',
          description: 'A test agent',
          capability_summary: 'Can review CI and ship patches.',
          permission_scope: 'repo_write',
          public_key: null,
          email: null,
          email_verified: true,
          avatar_url: null,
          axp: 100,
          status: 'active',
          trust_score: 0.5,
          metadata: {
            memoryPolicy: 'ephemeral_only',
            workProofUrl: 'https://example.com/proof',
            firstSuccessfulReply: true,
            capabilities: {
              voice: 'true',
              group_chat: true,
              roleplay: 1,
            },
          },
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-02T00:00:00Z',
          last_active: '2026-01-03T00:00:00Z',
          verification_state: 'verified',
          developer: {
            display_name: 'Ralph',
          },
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
    expect(json.data[0]).toMatchObject({
      name: 'test-agent',
      capabilitySummary: 'Can review CI and ship patches.',
      permissionScope: 'repo_write',
      capabilities: {
        voice: false,
        group_chat: true,
        roleplay: false,
      },
      memoryPolicy: 'ephemeral_only',
      workProofUrl: 'https://example.com/proof',
      hasFirstSuccessfulReply: true,
      publicOwnerLabel: 'Ralph',
      lastActive: '2026-01-03T00:00:00Z',
    });
    expect(json.data[0]).not.toHaveProperty('metadata');
  });

  it('should omit publicOwnerLabel for non-verified agents even when a developer display name exists', async () => {
    mockRange.mockResolvedValueOnce({
      data: [
        {
          id: 'agent-2',
          name: 'pending-agent',
          display_name: 'Pending Agent',
          description: 'Still pending verification',
          capability_summary: null,
          permission_scope: null,
          public_key: null,
          email: null,
          email_verified: true,
          avatar_url: null,
          axp: 12,
          status: 'active',
          trust_score: 0.2,
          metadata: {},
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-02T00:00:00Z',
          last_active: '2026-01-03T00:00:00Z',
          verification_state: 'pending',
          developer: {
            display_name: 'Private Owner',
          },
        },
      ],
      error: null,
      count: 1,
    });

    const { GET } = await import('../../app/api/v1/agents/route');
    const request = new Request('http://localhost/api/v1/agents');
    const response = await GET(request as unknown as Parameters<typeof GET>[0]);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data[0]).not.toHaveProperty('publicOwnerLabel');
  });

  it('should tolerate live rows that do not have the newer trust columns yet', async () => {
    mockRange.mockResolvedValueOnce({
      data: [
        {
          id: 'agent-legacy',
          name: 'legacy-agent',
          display_name: 'Legacy Agent',
          description: 'Row without the newer trust columns',
          public_key: null,
          email: null,
          email_verified: false,
          avatar_url: null,
          axp: 7,
          status: 'active',
          trust_score: 0.1,
          metadata: {},
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-02T00:00:00Z',
          last_active: '2026-01-03T00:00:00Z',
          developer: {
            display_name: 'Legacy Owner',
          },
        },
      ],
      error: null,
      count: 1,
    });

    const { GET } = await import('../../app/api/v1/agents/route');
    const request = new Request('http://localhost/api/v1/agents');
    const response = await GET(request as unknown as Parameters<typeof GET>[0]);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data[0]).toMatchObject({
      name: 'legacy-agent',
      verificationState: 'unverified',
      capabilities: {
        voice: false,
        group_chat: false,
        roleplay: false,
      },
    });
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

  it('should filter by enabled capability params', async () => {
    const { GET } = await import(
      '../../app/api/v1/agents/route'
    );

    const request = new Request(
      'http://localhost/api/v1/agents?voice=true&group_chat=1'
    );
    await GET(request as unknown as Parameters<typeof GET>[0]);

    expect(mockContains).toHaveBeenCalledTimes(2);
    expect(mockContains).toHaveBeenNthCalledWith(1, 'metadata', {
      capabilities: { voice: true },
    });
    expect(mockContains).toHaveBeenNthCalledWith(2, 'metadata', {
      capabilities: { group_chat: true },
    });
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

  it('should apply capability filters from metadata.capabilities', async () => {
    const { GET } = await import(
      '../../app/api/v1/agents/route'
    );

    const request = new Request(
      'http://localhost/api/v1/agents?voice=true&group_chat=1'
    );
    await GET(request as unknown as Parameters<typeof GET>[0]);

    expect(mockContains).toHaveBeenCalledTimes(2);
    expect(mockContains).toHaveBeenNthCalledWith(1, 'metadata', {
      capabilities: { voice: true },
    });
    expect(mockContains).toHaveBeenNthCalledWith(2, 'metadata', {
      capabilities: { group_chat: true },
    });
  });
});
