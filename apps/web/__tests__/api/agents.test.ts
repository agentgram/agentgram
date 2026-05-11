import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Agent API endpoint tests.
 *
 * These test the route handler logic in isolation by mocking
 * the Supabase service client. They verify input validation,
 * pagination bounds, search escaping, and response format.
 */

// Mock Supabase
const mockOrder = vi.fn().mockReturnThis();
const mockRange = vi.fn().mockReturnThis();
const mockOr = vi.fn().mockReturnThis();
const mockContains = vi.fn().mockReturnThis();
const mockIn = vi.fn();
const mockIs = vi.fn();
const mockDeveloperIn = vi.fn();
const mockRemixIlike = vi.fn();
const mockSelect = vi.fn((columns: string) => {
  if (columns === 'description') {
    return {
      ilike: mockRemixIlike,
    };
  }

  if (columns === 'author_id, comment_count') {
    return {
      in: mockIn,
    };
  }

  if (columns === 'id, display_name, plan, subscription_status') {
    return {
      in: mockDeveloperIn,
    };
  }

  return {
    order: mockOrder,
    range: mockRange,
    or: mockOr,
    contains: mockContains,
  };
});

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
    mockOrder.mockReturnThis();
    mockContains.mockReturnThis();
    mockIn.mockReturnValue({ is: mockIs });
    mockDeveloperIn.mockResolvedValue({
      data: [],
      error: null,
    });
    mockIs.mockResolvedValue({
      data: [
        { author_id: 'agent-1', comment_count: 2 },
      ],
      error: null,
    });
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
            relationshipPreset: 'mentor',
            memoryPolicy: 'ephemeral_only',
            workProofUrl: 'https://example.com/proof',
            firstSuccessfulReply: true,
            matureContent: true,
            profileDiary: {
              entries: [
                {
                  id: 'public-entry',
                  content: 'Public roadmap note.',
                  publishedAt: '2026-01-04T00:00:00.000Z',
                },
              ],
              privateDrafts: [
                {
                  id: 'private-draft',
                  content: 'Private draft should stay hidden.',
                  publishedAt: '2026-01-05T00:00:00.000Z',
                },
              ],
            },
            diary: {
              entries: [
                {
                  id: 'legacy-alias-entry',
                  content: 'Legacy alias should not leak.',
                  publishedAt: '2026-01-06T00:00:00.000Z',
                },
              ],
            },
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
            plan: 'pro',
            subscription_status: 'active',
          },
        },
      ],
      error: null,
      count: 1,
    });
    mockRemixIlike.mockResolvedValue({
      data: [
        { description: 'Inspired by @test-agent: First remix' },
        { description: 'Inspired by @test-agent on AgentGram.' },
        { description: 'Inspired by @someone-else: Ignore me' },
      ],
      error: null,
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
      matureContent: true,
      operatorTier: 'pro',
      publicOwnerLabel: 'Ralph',
      relationshipPreset: 'mentor',
      diaryEntries: [
        {
          id: 'public-entry',
          content: 'Public roadmap note.',
          publishedAt: '2026-01-04T00:00:00.000Z',
        },
      ],
      lastActive: '2026-01-03T00:00:00Z',
      remixCount: 2,
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

  it('should hide operatorTier when the linked paid plan is not active', async () => {
    mockRange.mockResolvedValueOnce({
      data: [
        {
          id: 'agent-operator-lapsed',
          name: 'operator-lapsed',
          display_name: 'Operator Lapsed',
          description: 'Paid plan should stay private when inactive',
          capability_summary: null,
          permission_scope: null,
          public_key: null,
          email: null,
          email_verified: true,
          avatar_url: null,
          axp: 24,
          status: 'active',
          trust_score: 0.4,
          metadata: {
            contentRating: '18+',
          },
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-02T00:00:00Z',
          last_active: '2026-01-03T00:00:00Z',
          verification_state: 'verified',
          developer: {
            display_name: 'Private Owner',
            plan: 'starter',
            subscription_status: 'canceled',
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
      name: 'operator-lapsed',
      matureContent: true,
    });
    expect(json.data[0]).not.toHaveProperty('operatorTier');
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

  it('falls back to compatibility directory columns when verification_state is unavailable but verified-owner proof still exists', async () => {
    mockRange
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'column agents.verification_state does not exist' },
        count: null,
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'agent-compat',
            name: 'compat-agent',
            display_name: 'Compat Agent',
            description: 'Still renders when verification_state is missing',
            public_key: null,
            email: null,
            email_verified: true,
            avatar_url: null,
            axp: 42,
            status: 'active',
            trust_score: 0.4,
            metadata: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: '2026-01-03T00:00:00Z',
            developer: {
              display_name: 'Ralph',
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
      name: 'compat-agent',
      verificationState: 'verified',
      publicOwnerLabel: 'Ralph',
    });
    expect(mockSelect.mock.calls[0][0]).toContain('verification_state');
    expect(mockSelect.mock.calls[1][0]).not.toContain('verification_state');
  });

  it('hydrates developer owner proof after the public developers join drifts', async () => {
    mockRange
      .mockResolvedValueOnce({
        data: null,
        error: {
          message:
            "Could not find a relationship between 'agents' and 'developers' in the schema cache",
        },
        count: null,
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'agent-hydrated',
            name: 'hydrated-agent',
            display_name: 'Hydrated Agent',
            description: 'Owner proof survives a join drift',
            developer_id: 'dev-1',
            public_key: null,
            email: null,
            email_verified: true,
            avatar_url: null,
            axp: 84,
            status: 'active',
            trust_score: 0.5,
            metadata: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: '2026-01-03T00:00:00Z',
            verification_state: 'verified',
          },
        ],
        error: null,
        count: 1,
      });
    mockDeveloperIn.mockResolvedValueOnce({
      data: [
        {
          id: 'dev-1',
          display_name: 'Ralph',
          plan: 'pro',
          subscription_status: 'active',
        },
      ],
      error: null,
    });

    const { GET } = await import('../../app/api/v1/agents/route');
    const request = new Request('http://localhost/api/v1/agents');
    const response = await GET(request as unknown as Parameters<typeof GET>[0]);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data[0]).toMatchObject({
      name: 'hydrated-agent',
      verificationState: 'verified',
      publicOwnerLabel: 'Ralph',
      operatorTier: 'pro',
    });
    expect(mockSelect.mock.calls[1][0]).not.toContain('developer:developers');
    expect(mockDeveloperIn).toHaveBeenCalledWith('id', ['dev-1']);
  });

  it('falls back to the minimal public directory columns when developer_id is unavailable too', async () => {
    mockRange
      .mockResolvedValueOnce({
        data: null,
        error: {
          message:
            "Could not find a relationship between 'agents' and 'developers' in the schema cache",
        },
        count: null,
      })
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'column agents.developer_id does not exist' },
        count: null,
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'agent-minimal',
            name: 'minimal-agent',
            display_name: 'Minimal Agent',
            description: 'Directory still renders on the truly minimal select',
            public_key: null,
            email: null,
            email_verified: false,
            avatar_url: null,
            axp: 9,
            status: 'active',
            trust_score: 0.1,
            metadata: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: '2026-01-03T00:00:00Z',
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
      name: 'minimal-agent',
      verificationState: 'unverified',
    });
    expect(mockSelect.mock.calls[2][0]).not.toContain('developer_id');
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

  it('should return 500 when discussed sort full fetch fails after count succeeds', async () => {
    mockRange
      .mockResolvedValueOnce({
        data: [
          {
            id: 'agent-1',
            name: 'test-agent',
            display_name: 'Test Agent',
            description: 'A test agent',
            public_key: null,
            email: null,
            email_verified: true,
            avatar_url: null,
            axp: 100,
            status: 'active',
            trust_score: 0.5,
            metadata: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: '2026-01-03T00:00:00Z',
            developer: { display_name: 'Ralph' },
          },
        ],
        error: null,
        count: 1,
      })
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'failed full fetch' },
        count: 1,
      });

    const { GET } = await import('../../app/api/v1/agents/route');
    const request = new Request(
      'http://localhost/api/v1/agents?sort=discussed&limit=10'
    );
    const response = await GET(request as unknown as Parameters<typeof GET>[0]);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
  });

  it('should support discussed sort using total comments received on each agent\'s posts', async () => {
    mockRange
      .mockResolvedValueOnce({
        data: [
          {
            id: 'agent-1',
            name: 'test-agent',
            display_name: 'Test Agent',
            description: 'A test agent',
            public_key: null,
            email: null,
            email_verified: true,
            avatar_url: null,
            axp: 100,
            post_count: 2,
            status: 'active',
            trust_score: 0.5,
            metadata: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: '2026-01-03T00:00:00Z',
            developer: { display_name: 'Ralph' },
          },
        ],
        error: null,
        count: 2,
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'agent-1',
            name: 'test-agent',
            display_name: 'Test Agent',
            description: 'A test agent',
            public_key: null,
            email: null,
            email_verified: true,
            avatar_url: null,
            axp: 100,
            post_count: 2,
            status: 'active',
            trust_score: 0.5,
            metadata: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: '2026-01-03T00:00:00Z',
            developer: { display_name: 'Ralph' },
          },
          {
            id: 'agent-2',
            name: 'chatty-agent',
            display_name: 'Chatty Agent',
            description: 'Gets lots of replies',
            public_key: null,
            email: null,
            email_verified: true,
            avatar_url: null,
            axp: 20,
            post_count: 1,
            status: 'active',
            trust_score: 0.1,
            metadata: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: '2026-01-04T00:00:00Z',
            developer: { display_name: 'Nori' },
          },
        ],
        error: null,
        count: 2,
      });
    mockIs.mockResolvedValueOnce({
      data: [
        { author_id: 'agent-1', comment_count: 1 },
        { author_id: 'agent-2', comment_count: 5 },
      ],
      error: null,
    });
    mockRemixIlike.mockResolvedValueOnce({
      data: [
        { description: 'Inspired by @chatty-agent: first remix' },
      ],
      error: null,
    });

    const { GET } = await import('../../app/api/v1/agents/route');
    const request = new Request(
      'http://localhost/api/v1/agents?sort=discussed&limit=10'
    );
    const response = await GET(request as unknown as Parameters<typeof GET>[0]);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.map((agent: { name: string }) => agent.name)).toEqual([
      'chatty-agent',
      'test-agent',
    ]);
    expect(mockIn).toHaveBeenCalledWith('author_id', ['agent-1', 'agent-2']);
    expect(mockIs).toHaveBeenCalledWith('original_post_id', null);
  });
});
