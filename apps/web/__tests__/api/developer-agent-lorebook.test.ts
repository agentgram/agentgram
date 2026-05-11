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

describe('/api/v1/developers/me/agent-lorebook', () => {
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
                lorebook: {
                  updatedAt: '2026-05-09T03:00:00.000Z',
                  people: [
                    {
                      id: 'person-1',
                      name: 'Mina Park',
                      role: 'Launch producer',
                      details: 'Keeps launch comms calm and timestamped.',
                    },
                  ],
                  places: [
                    {
                      id: 'place-1',
                      name: 'Night shift war room',
                      details: 'Late-night release channel with terse updates.',
                    },
                  ],
                  rules: [
                    {
                      id: 'rule-1',
                      title: 'Never fake a ship date',
                      details:
                        'If timing is uncertain, give the next checkpoint instead.',
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

  it('saves normalized lorebook fields on PUT', async () => {
    const { PUT } =
      await import('@/app/api/v1/developers/me/agent-lorebook/route');
    const request = new Request(
      'http://localhost/api/v1/developers/me/agent-lorebook',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-developer-id': 'dev-1',
        },
        body: JSON.stringify({
          agentId: 'agent-1',
          lorebook: {
            people: [
              {
                id: 'person-1',
                name: '  Mina Park  ',
                role: '  Launch producer  ',
                details: '  Keeps launch comms calm and timestamped.  ',
              },
              {
                id: 'person-2',
                name: '   ',
                role: 'Ignored',
                details: 'Ignored',
              },
            ],
            places: [
              {
                id: 'place-1',
                name: ' Night shift war room ',
                details: ' Late-night release channel with terse updates. ',
              },
            ],
            rules: [
              {
                id: 'rule-1',
                title: ' Never fake a ship date ',
                details:
                  ' If timing is uncertain, give the next checkpoint instead. ',
              },
            ],
          },
        }),
      }
    );

    const response = await PUT(request as Parameters<typeof PUT>[0]);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockUpdate.mock.calls[0][0]).toMatchObject({
      metadata: {
        tonePreset: 'brief',
        lorebook: {
          people: [
            {
              id: 'person-1',
              name: 'Mina Park',
              role: 'Launch producer',
              details: 'Keeps launch comms calm and timestamped.',
            },
          ],
          places: [
            {
              id: 'place-1',
              name: 'Night shift war room',
              details: 'Late-night release channel with terse updates.',
            },
          ],
          rules: [
            {
              id: 'rule-1',
              title: 'Never fake a ship date',
              details:
                'If timing is uncertain, give the next checkpoint instead.',
            },
          ],
        },
      },
    });
    expect(json).toEqual({
      success: true,
      data: {
        people: [
          {
            id: 'person-1',
            name: 'Mina Park',
            role: 'Launch producer',
            details: 'Keeps launch comms calm and timestamped.',
          },
        ],
        places: [
          {
            id: 'place-1',
            name: 'Night shift war room',
            details: 'Late-night release channel with terse updates.',
          },
        ],
        rules: [
          {
            id: 'rule-1',
            title: 'Never fake a ship date',
            details:
              'If timing is uncertain, give the next checkpoint instead.',
          },
        ],
        updatedAt: '2026-05-09T03:00:00.000Z',
      },
    });
  });

  it('returns 401 when developer context is missing', async () => {
    const { PUT } =
      await import('@/app/api/v1/developers/me/agent-lorebook/route');
    const request = new Request(
      'http://localhost/api/v1/developers/me/agent-lorebook',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: 'agent-1',
          lorebook: {
            people: [],
            places: [],
            rules: [],
          },
        }),
      }
    );

    const response = await PUT(request as Parameters<typeof PUT>[0]);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('UNAUTHORIZED');
  });
});
