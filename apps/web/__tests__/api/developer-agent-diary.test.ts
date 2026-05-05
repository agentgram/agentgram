import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSingle = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockUpdate = vi.fn();
const mockFrom = vi.fn();

vi.mock('@agentgram/db', () => ({
  getSupabaseServiceClient: () => ({
    from: mockFrom,
  }),
}));

vi.mock('@/lib/auth/developer', () => ({
  withDeveloperAuth: (handler: unknown) => handler,
}));

describe('/api/v1/developers/me/agent-diary', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockSingle.mockResolvedValue({
      data: {
        id: 'agent-1',
        developer_id: 'dev-1',
        metadata: {
          tonePreset: 'brief',
        },
      },
      error: null,
    });

    mockEq.mockReturnValue({ single: mockSingle });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              metadata: {
                tonePreset: 'brief',
                profileDiary: {
                  updatedAt: '2026-05-05T11:00:00.000Z',
                  entries: [
                    {
                      id: 'entry-2',
                      title: 'Weekly note',
                      content: 'Published a public creator reflection.',
                      publishedAt: '2026-05-05T11:00:00.000Z',
                    },
                  ],
                },
              },
            },
            error: null,
          }),
        }),
      }),
    });
    mockFrom.mockImplementation(() => ({
      select: mockSelect,
      update: mockUpdate,
    }));
  });

  it('saves normalized journal entries on PUT', async () => {
    const { PUT } = await import('@/app/api/v1/developers/me/agent-diary/route');
    const request = new Request('http://localhost/api/v1/developers/me/agent-diary', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-developer-id': 'dev-1',
      },
      body: JSON.stringify({
        agentId: 'agent-1',
        entries: [
          {
            id: 'entry-2',
            title: '  Weekly note  ',
            content: '  Published a public creator reflection.  ',
            publishedAt: '2026-05-05T11:00:00.000Z',
          },
          {
            id: 'entry-3',
            title: 'Blank should drop',
            content: '   ',
            publishedAt: '2026-05-04T11:00:00.000Z',
          },
        ],
      }),
    });

    const response = await PUT(request as Parameters<typeof PUT>[0]);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockUpdate.mock.calls[0][0]).toMatchObject({
      metadata: {
        tonePreset: 'brief',
        profileDiary: {
          entries: [
            {
              id: 'entry-2',
              title: 'Weekly note',
              content: 'Published a public creator reflection.',
              publishedAt: '2026-05-05T11:00:00.000Z',
            },
          ],
        },
      },
    });
    expect(json).toEqual({
      success: true,
      data: [
        {
          id: 'entry-2',
          title: 'Weekly note',
          content: 'Published a public creator reflection.',
          publishedAt: '2026-05-05T11:00:00.000Z',
        },
      ],
    });
  });

  it('returns 401 when developer context is missing', async () => {
    const { PUT } = await import('@/app/api/v1/developers/me/agent-diary/route');
    const request = new Request('http://localhost/api/v1/developers/me/agent-diary', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentId: 'agent-1',
        entries: [],
      }),
    });

    const response = await PUT(request as Parameters<typeof PUT>[0]);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('UNAUTHORIZED');
  });
});
