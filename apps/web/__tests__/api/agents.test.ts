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
const mockPostIn = vi.fn();
const mockPostGte = vi.fn();
const mockRecentPostsIs = vi.fn();
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

  if (columns === 'author_id') {
    return {
      in: mockPostIn,
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
    mockPostIn.mockReturnValue({ gte: mockPostGte });
    mockPostGte.mockReturnValue({ is: mockRecentPostsIs });
    mockDeveloperIn.mockResolvedValue({
      data: [],
      error: null,
    });
    mockIs.mockResolvedValue({
      data: [{ author_id: 'agent-1', comment_count: 2 }],
      error: null,
    });
    mockRecentPostsIs.mockResolvedValue({
      data: [{ author_id: 'agent-1' }],
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
          public_key: 'ag_secret_private_key',
          email: 'private-owner@example.com',
          email_verified: true,
          avatar_url: null,
          axp: 100,
          status: 'active',
          trust_score: 0.5,
          metadata: {
            relationshipPreset: 'mentor',
            discovery: {
              worldbuilding: 'fantasy',
            },
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
              video: true,
              image_reply: true,
              web_aware: true,
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
    const { GET } = await import('../../app/api/v1/agents/route');

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
        video: true,
        image: true,
        web: true,
      },
      memoryPolicy: 'ephemeral_only',
      workProofUrl: 'https://example.com/proof',
      hasFirstSuccessfulReply: true,
      matureContent: true,
      operatorTier: 'pro',
      publicOwnerLabel: 'Ralph',
      identityCard: {
        claimStatus: 'claimed_verified',
        apiSafeHandle: '@test-agent',
        apiSafeProfileUrl: 'https://agentgram.ai/agents/test-agent',
        ownerProofLabel: 'Ralph',
        ownerProofUrl: 'https://example.com/proof',
        ownerProofLinkLabel: 'View work proof',
      },
      relationshipPreset: 'mentor',
      relationshipGoal: 'guidance',
      worldbuilding: 'fantasy',
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
    expect(json.data[0]).not.toHaveProperty('email');
    expect(json.data[0]).not.toHaveProperty('publicKey');
    expect(JSON.stringify(json.data[0])).not.toContain(
      'private-owner@example.com'
    );
    expect(JSON.stringify(json.data[0])).not.toContain('ag_secret_private_key');
  });

  it('should publish a routable identity profile URL for names that are not slug handles', async () => {
    mockRange.mockResolvedValueOnce({
      data: [
        {
          id: 'agent-routable-name',
          name: 'my.bot 서울',
          display_name: 'My Bot Seoul',
          description: 'Uses a public name that is not the sanitized handle.',
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
          verification_state: 'verified',
          developer: {
            display_name: 'Routable Owner',
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
    expect(json.data[0].identityCard).toMatchObject({
      claimStatus: 'claimed_verified',
      apiSafeHandle: '@my-bot',
      apiSafeProfileUrl:
        'https://agentgram.ai/agents/my.bot%20%EC%84%9C%EC%9A%B8',
    });
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
    expect(json.data[0].identityCard).toMatchObject({
      claimStatus: 'pending_review',
      apiSafeHandle: '@pending-agent',
      apiSafeProfileUrl: 'https://agentgram.ai/agents/pending-agent',
    });
    expect(json.data[0].identityCard).not.toHaveProperty('ownerProofLabel');
    expect(JSON.stringify(json.data[0])).not.toContain('Private Owner');
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

  it('falls back to the public owner select when developer billing fields are unavailable', async () => {
    mockRange
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'column developers.plan does not exist' },
        count: null,
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'agent-fallback',
            name: 'fallback-agent',
            display_name: 'Fallback Agent',
            description: 'Still renders without paid plan metadata',
            public_key: null,
            email: null,
            email_verified: true,
            avatar_url: null,
            axp: 44,
            status: 'active',
            trust_score: 0.3,
            metadata: {},
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

    const { GET } = await import('../../app/api/v1/agents/route');
    const request = new Request('http://localhost/api/v1/agents');
    const response = await GET(request as unknown as Parameters<typeof GET>[0]);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data[0]).toMatchObject({
      name: 'fallback-agent',
      publicOwnerLabel: 'Ralph',
    });
    expect(json.data[0]).not.toHaveProperty('operatorTier');
    expect(mockSelect).toHaveBeenCalledTimes(3);
    expect(mockSelect.mock.calls[0][0]).toContain(
      'developer:developers(display_name, plan, subscription_status)'
    );
    expect(mockSelect.mock.calls[1][0]).toContain(
      'developer:developers(display_name)'
    );
  });

  it('falls back to compatibility directory columns when verification_state is unavailable on live agents rows', async () => {
    mockRange
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'column agents.verification_state does not exist' },
        count: null,
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'agent-legacy-fallback',
            name: 'legacy-fallback-agent',
            display_name: 'Legacy Fallback Agent',
            description: 'Still renders when verification_state is missing',
            email_verified: true,
            developer_id: 'dev-legacy',
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
      name: 'legacy-fallback-agent',
      verificationState: 'verified',
      publicOwnerLabel: 'Legacy Owner',
      capabilities: {
        voice: false,
        group_chat: false,
        roleplay: false,
      },
    });
    expect(mockSelect).toHaveBeenCalledTimes(3);
    expect(mockSelect.mock.calls[0][0]).toContain('verification_state');
    expect(mockSelect.mock.calls[1][0]).not.toContain('verification_state');
    expect(mockSelect.mock.calls[1][0]).toContain('email_verified');
    expect(mockSelect.mock.calls[1][0]).toContain(
      'developer:developers(display_name)'
    );
  });

  it('falls back to minimal directory columns when compatibility directory columns still drift', async () => {
    mockRange
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'column agents.verification_state does not exist' },
        count: null,
      })
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
            id: 'agent-minimal-fallback',
            name: 'minimal-fallback-agent',
            display_name: 'Minimal Fallback Agent',
            description: 'Still renders when compatibility owner joins drift',
            developer_id: 'dev-minimal',
            avatar_url: null,
            axp: 7,
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

    mockDeveloperIn.mockResolvedValueOnce({
      data: [
        {
          id: 'dev-minimal',
          display_name: 'Minimal Owner',
          plan: null,
          subscription_status: null,
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
      name: 'minimal-fallback-agent',
      verificationState: 'unverified',
      capabilities: {
        voice: false,
        group_chat: false,
        roleplay: false,
      },
    });
    expect(json.data[0]).not.toHaveProperty('publicOwnerLabel');
    expect(mockSelect).toHaveBeenCalledTimes(5);
    expect(mockSelect.mock.calls[0][0]).toContain('verification_state');
    expect(mockSelect.mock.calls[1][0]).not.toContain('verification_state');
    expect(mockSelect.mock.calls[1][0]).toContain(
      'developer:developers(display_name)'
    );
    expect(mockSelect.mock.calls[2][0]).not.toContain('verification_state');
    expect(mockSelect.mock.calls[2][0]).not.toContain('developer:developers(');
    expect(mockSelect.mock.calls[3][0]).toBe(
      'id, display_name, plan, subscription_status'
    );
  });

  it('falls back to legacy directory columns when the developer join still drifts after the billing retry', async () => {
    mockRange
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'column developers.plan does not exist' },
        count: null,
      })
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
            id: 'agent-joinless-fallback',
            name: 'joinless-fallback-agent',
            display_name: 'Joinless Fallback Agent',
            description: 'Still renders when the developers relation is stale',
            public_key: null,
            email: null,
            email_verified: true,
            avatar_url: null,
            axp: 19,
            status: 'active',
            trust_score: 0.2,
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
      name: 'joinless-fallback-agent',
      verificationState: 'unverified',
    });
    expect(mockSelect).toHaveBeenCalledTimes(4);
    expect(mockSelect.mock.calls[0][0]).toContain(
      'developer:developers(display_name, plan, subscription_status)'
    );
    expect(mockSelect.mock.calls[1][0]).toContain(
      'developer:developers(display_name)'
    );
    expect(mockSelect.mock.calls[2][0]).not.toContain('developer:developers(');
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
    const { GET } = await import('../../app/api/v1/agents/route');

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
    const { GET } = await import('../../app/api/v1/agents/route');

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

  it('should filter by relationship goal and worldbuilding facets', async () => {
    mockRange
      .mockResolvedValueOnce({
        data: [
          {
            id: 'agent-1',
            name: 'mentor-fantasy',
            display_name: 'Mentor Fantasy',
            description: 'A fantasy mentor',
            public_key: null,
            email: null,
            email_verified: true,
            avatar_url: null,
            axp: 100,
            status: 'active',
            trust_score: 0.5,
            metadata: {
              relationshipPreset: 'mentor',
              discovery: {
                worldbuilding: 'fantasy',
              },
            },
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
            name: 'mentor-fantasy',
            display_name: 'Mentor Fantasy',
            description: 'A fantasy mentor',
            public_key: null,
            email: null,
            email_verified: true,
            avatar_url: null,
            axp: 100,
            status: 'active',
            trust_score: 0.5,
            metadata: {
              relationshipPreset: 'mentor',
              discovery: {
                worldbuilding: 'fantasy',
              },
            },
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: '2026-01-03T00:00:00Z',
            developer: { display_name: 'Ralph' },
          },
          {
            id: 'agent-2',
            name: 'partner-grounded',
            display_name: 'Partner Grounded',
            description: 'A grounded partner',
            public_key: null,
            email: null,
            email_verified: true,
            avatar_url: null,
            axp: 95,
            status: 'active',
            trust_score: 0.4,
            metadata: {
              relationshipPreset: 'partner',
              worldType: 'grounded',
            },
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: '2026-01-03T00:00:00Z',
            developer: { display_name: 'Nori' },
          },
        ],
        error: null,
        count: 2,
      });

    const { GET } = await import('../../app/api/v1/agents/route');
    const request = new Request(
      'http://localhost/api/v1/agents?relationship_goal=guidance&worldbuilding=fantasy'
    );
    const response = await GET(request as unknown as Parameters<typeof GET>[0]);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.meta.total).toBe(1);
    expect(json.data).toHaveLength(1);
    expect(json.data[0]).toMatchObject({
      name: 'mentor-fantasy',
      relationshipGoal: 'guidance',
      worldbuilding: 'fantasy',
    });
  });

  it('should clamp page parameter to valid range', async () => {
    const { GET } = await import('../../app/api/v1/agents/route');

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
    const { GET } = await import('../../app/api/v1/agents/route');

    const request = new Request('http://localhost/api/v1/agents?limit=999');
    const response = await GET(request as unknown as Parameters<typeof GET>[0]);
    const json = await response.json();

    expect(response.status).toBe(200);
    // Limit should be clamped to MAX_LIMIT (100)
    expect(json.meta.limit).toBeLessThanOrEqual(100);
  });

  it('should apply capability filters from metadata.capabilities', async () => {
    const { GET } = await import('../../app/api/v1/agents/route');

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

  it("should support discussed sort using total comments received on each agent's posts", async () => {
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
      data: [{ description: 'Inspired by @chatty-agent: first remix' }],
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

  it('filters the verified_active directory to live-now agents without dropping the active sort context', async () => {
    const liveNow = new Date(Date.now() - 20 * 60 * 1000).toISOString();
    const stillLive = new Date(Date.now() - 45 * 60 * 1000).toISOString();
    const stale = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();

    mockRange
      .mockResolvedValueOnce({
        data: [
          {
            id: 'agent-count',
            name: 'count-probe',
            display_name: 'Count Probe',
            description: 'Count probe row',
            public_key: null,
            email: null,
            email_verified: true,
            avatar_url: null,
            axp: 1,
            status: 'active',
            trust_score: 0.1,
            metadata: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: liveNow,
            verification_state: 'verified',
            developer: { display_name: 'Count Owner' },
          },
        ],
        error: null,
        count: 3,
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'agent-2',
            name: 'network-ghost',
            display_name: 'Network Ghost',
            description: 'Unverified but live now',
            public_key: null,
            email: null,
            email_verified: false,
            avatar_url: null,
            axp: 900,
            status: 'active',
            trust_score: 0.2,
            metadata: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: stillLive,
            verification_state: 'unverified',
            developer: { display_name: 'Ghost' },
          },
          {
            id: 'agent-3',
            name: 'verified-builder',
            display_name: 'Verified Builder',
            description: 'Verified human-owned agent',
            public_key: null,
            email: null,
            email_verified: true,
            avatar_url: null,
            axp: 120,
            status: 'active',
            trust_score: 0.6,
            metadata: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: liveNow,
            verification_state: 'verified',
            developer: { display_name: 'Ralph' },
          },
          {
            id: 'agent-4',
            name: 'verified-older',
            display_name: 'Verified Older',
            description: 'Verified but not live now',
            public_key: null,
            email: null,
            email_verified: true,
            avatar_url: null,
            axp: 80,
            status: 'active',
            trust_score: 0.5,
            metadata: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: stale,
            verification_state: 'verified',
            developer: { display_name: 'Mina' },
          },
        ],
        error: null,
        count: 3,
      });

    const { GET } = await import('../../app/api/v1/agents/route');
    const request = new Request(
      'http://localhost/api/v1/agents?sort=verified_active&browse=live_now&limit=10'
    );
    const response = await GET(request as unknown as Parameters<typeof GET>[0]);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.map((agent: { name: string }) => agent.name)).toEqual([
      'verified-builder',
      'network-ghost',
    ]);
  });

  it('filters the verified_active directory to recently posted agents', async () => {
    mockRange
      .mockResolvedValueOnce({
        data: [
          {
            id: 'agent-count',
            name: 'count-probe',
            display_name: 'Count Probe',
            description: 'Count probe row',
            public_key: null,
            email: null,
            email_verified: true,
            avatar_url: null,
            axp: 1,
            status: 'active',
            trust_score: 0.1,
            metadata: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: '2026-01-03T00:00:00Z',
            verification_state: 'verified',
            developer: { display_name: 'Count Owner' },
          },
        ],
        error: null,
        count: 3,
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'agent-2',
            name: 'network-ghost',
            display_name: 'Network Ghost',
            description: 'Unverified but recently posted',
            public_key: null,
            email: null,
            email_verified: false,
            avatar_url: null,
            axp: 900,
            status: 'active',
            trust_score: 0.2,
            metadata: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: '2026-01-05T00:00:00Z',
            verification_state: 'unverified',
            developer: { display_name: 'Ghost' },
          },
          {
            id: 'agent-3',
            name: 'verified-builder',
            display_name: 'Verified Builder',
            description: 'Verified human-owned agent',
            public_key: null,
            email: null,
            email_verified: true,
            avatar_url: null,
            axp: 120,
            status: 'active',
            trust_score: 0.6,
            metadata: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: '2026-01-04T00:00:00Z',
            verification_state: 'verified',
            developer: { display_name: 'Ralph' },
          },
          {
            id: 'agent-4',
            name: 'verified-older',
            display_name: 'Verified Older',
            description: 'Verified but did not post recently',
            public_key: null,
            email: null,
            email_verified: true,
            avatar_url: null,
            axp: 80,
            status: 'active',
            trust_score: 0.5,
            metadata: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: '2026-01-02T00:00:00Z',
            verification_state: 'verified',
            developer: { display_name: 'Mina' },
          },
        ],
        error: null,
        count: 3,
      });
    mockRecentPostsIs.mockResolvedValueOnce({
      data: [{ author_id: 'agent-2' }, { author_id: 'agent-3' }],
      error: null,
    });

    const { GET } = await import('../../app/api/v1/agents/route');
    const request = new Request(
      'http://localhost/api/v1/agents?sort=verified_active&browse=recently_posted&limit=10'
    );
    const response = await GET(request as unknown as Parameters<typeof GET>[0]);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.map((agent: { name: string }) => agent.name)).toEqual([
      'verified-builder',
      'network-ghost',
    ]);
    expect(mockPostIn).toHaveBeenCalledWith('author_id', [
      'agent-2',
      'agent-3',
      'agent-4',
    ]);
    expect(mockPostGte).toHaveBeenCalledWith('created_at', expect.any(String));
    expect(mockRecentPostsIs).toHaveBeenCalledWith('original_post_id', null);
  });

  it('prioritizes verified human-owned agents by recent activity for verified_active sort', async () => {
    mockRange
      .mockResolvedValueOnce({
        data: [
          {
            id: 'agent-1',
            name: 'verified-builder',
            display_name: 'Verified Builder',
            description: 'Verified human-owned agent',
            public_key: null,
            email: null,
            email_verified: true,
            avatar_url: null,
            axp: 120,
            status: 'active',
            trust_score: 0.6,
            metadata: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: '2026-01-03T00:00:00Z',
            verification_state: 'verified',
            developer: { display_name: 'Ralph' },
          },
        ],
        error: null,
        count: 3,
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'agent-2',
            name: 'network-ghost',
            display_name: 'Network Ghost',
            description: 'Unverified but recently active',
            public_key: null,
            email: null,
            email_verified: false,
            avatar_url: null,
            axp: 900,
            status: 'active',
            trust_score: 0.2,
            metadata: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: '2026-01-05T00:00:00Z',
            verification_state: 'unverified',
            developer: { display_name: 'Ghost' },
          },
          {
            id: 'agent-3',
            name: 'verified-builder',
            display_name: 'Verified Builder',
            description: 'Verified human-owned agent',
            public_key: null,
            email: null,
            email_verified: true,
            avatar_url: null,
            axp: 120,
            status: 'active',
            trust_score: 0.6,
            metadata: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: '2026-01-04T00:00:00Z',
            verification_state: 'verified',
            developer: { display_name: 'Ralph' },
          },
          {
            id: 'agent-4',
            name: 'verified-older',
            display_name: 'Verified Older',
            description: 'Verified but less recent',
            public_key: null,
            email: null,
            email_verified: true,
            avatar_url: null,
            axp: 80,
            status: 'active',
            trust_score: 0.5,
            metadata: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: '2026-01-02T00:00:00Z',
            verification_state: 'verified',
            developer: { display_name: 'Mina' },
          },
        ],
        error: null,
        count: 3,
      });

    const { GET } = await import('../../app/api/v1/agents/route');
    const request = new Request(
      'http://localhost/api/v1/agents?sort=verified_active&limit=10'
    );
    const response = await GET(request as unknown as Parameters<typeof GET>[0]);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.map((agent: { name: string }) => agent.name)).toEqual([
      'verified-builder',
      'verified-older',
      'network-ghost',
    ]);
  });

  it('keeps verified_active sorting working when verification_state is missing but owner labels still exist', async () => {
    mockRange
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'column agents.verification_state does not exist' },
        count: null,
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'agent-compat-count',
            name: 'compat-count',
            display_name: 'Compat Count',
            description: 'Count probe row',
            email_verified: true,
            avatar_url: null,
            axp: 5,
            status: 'active',
            trust_score: 0.1,
            metadata: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: '2026-01-03T00:00:00Z',
            developer: { display_name: 'Compat Owner' },
          },
        ],
        error: null,
        count: 3,
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'agent-ghost',
            name: 'network-ghost',
            display_name: 'Network Ghost',
            description: 'Unverified but recently active',
            email_verified: false,
            avatar_url: null,
            axp: 900,
            status: 'active',
            trust_score: 0.2,
            metadata: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: '2026-01-05T00:00:00Z',
            developer: { display_name: 'Ghost' },
          },
          {
            id: 'agent-builder',
            name: 'verified-builder',
            display_name: 'Verified Builder',
            description: 'Verified human-owned agent',
            email_verified: true,
            avatar_url: null,
            axp: 120,
            status: 'active',
            trust_score: 0.6,
            metadata: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: '2026-01-04T00:00:00Z',
            developer: { display_name: 'Ralph' },
          },
          {
            id: 'agent-older',
            name: 'verified-older',
            display_name: 'Verified Older',
            description: 'Verified but less recent',
            email_verified: true,
            avatar_url: null,
            axp: 80,
            status: 'active',
            trust_score: 0.5,
            metadata: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            last_active: '2026-01-02T00:00:00Z',
            developer: { display_name: 'Mina' },
          },
        ],
        error: null,
        count: 3,
      });

    const { GET } = await import('../../app/api/v1/agents/route');
    const request = new Request(
      'http://localhost/api/v1/agents?sort=verified_active&limit=10'
    );
    const response = await GET(request as unknown as Parameters<typeof GET>[0]);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.map((agent: { name: string }) => agent.name)).toEqual([
      'verified-builder',
      'verified-older',
      'network-ghost',
    ]);
    expect(json.data[0]).toMatchObject({
      verificationState: 'verified',
      publicOwnerLabel: 'Ralph',
    });
    expect(mockSelect.mock.calls[1][0]).toContain(
      'developer:developers(display_name)'
    );
    expect(mockSelect.mock.calls[1][0]).not.toContain('verification_state');
  });
});
