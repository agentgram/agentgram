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

describe('/api/v1/developers/me/proactive-controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockSingle.mockResolvedValue({
      data: {
        metadata: {
          proactiveControls: {
            optIn: false,
            dailyLimit: 2,
            weeklyLimit: 8,
            updatedAt: '2026-04-20T00:00:00.000Z',
          },
        },
      },
      error: null,
    });

    mockEq.mockReturnValue({ single: mockSingle });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: mockSingle,
        }),
      }),
    });
    mockFrom.mockImplementation(() => ({
      select: mockSelect,
      update: mockUpdate,
    }));
  });

  it('returns the saved settings on GET', async () => {
    const { GET } = await import('@/app/api/v1/developers/me/proactive-controls/route');
    const request = new Request('http://localhost/api/v1/developers/me/proactive-controls', {
      headers: {
        'x-developer-id': 'dev-1',
      },
    });

    const response = await GET(request as Parameters<typeof GET>[0]);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      data: {
        optIn: false,
        dailyLimit: 2,
        weeklyLimit: 8,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        updatedAt: '2026-04-20T00:00:00.000Z',
      },
    });
    expect(mockFrom).toHaveBeenCalledWith('developers');
    expect(mockSelect).toHaveBeenCalledWith('metadata');
    expect(mockEq).toHaveBeenCalledWith('id', 'dev-1');
  });

  it('saves normalized settings on PUT', async () => {
    const updateEq = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            metadata: {
              timezone: 'UTC',
              proactiveControls: {
                optIn: false,
                dailyLimit: 25,
                weeklyLimit: 25,
                quietHoursEnabled: true,
                quietHoursStart: '21:30',
                quietHoursEnd: '07:15',
                updatedAt: '2026-04-26T00:00:00.000Z',
              },
            },
          },
          error: null,
        }),
      }),
    });

    mockUpdate.mockReturnValue({ eq: updateEq });
    mockSingle.mockResolvedValueOnce({
      data: {
        metadata: {
          timezone: 'UTC',
          proactiveControls: {
            optIn: true,
            dailyLimit: 3,
            weeklyLimit: 9,
            updatedAt: '2026-04-20T00:00:00.000Z',
          },
        },
      },
      error: null,
    });

    const { PUT } = await import('@/app/api/v1/developers/me/proactive-controls/route');
    const request = new Request('http://localhost/api/v1/developers/me/proactive-controls', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-developer-id': 'dev-1',
      },
      body: JSON.stringify({
        optIn: false,
        dailyLimit: 30,
        weeklyLimit: 2,
        quietHoursEnabled: true,
        quietHoursStart: '21:30',
        quietHoursEnd: '07:15',
      }),
    });

    const response = await PUT(request as Parameters<typeof PUT>[0]);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockUpdate.mock.calls[0][0]).toMatchObject({
      metadata: {
        timezone: 'UTC',
        proactiveControls: {
          optIn: false,
          dailyLimit: 25,
          weeklyLimit: 25,
          quietHoursEnabled: true,
          quietHoursStart: '21:30',
          quietHoursEnd: '07:15',
        },
      },
    });
    expect(json).toEqual({
      success: true,
      data: {
        optIn: false,
        dailyLimit: 25,
        weeklyLimit: 25,
        quietHoursEnabled: true,
        quietHoursStart: '21:30',
        quietHoursEnd: '07:15',
        updatedAt: '2026-04-26T00:00:00.000Z',
      },
    });
    expect(updateEq).toHaveBeenCalledWith('id', 'dev-1');
  });

  it('rejects malformed JSON on PUT', async () => {
    const { PUT } = await import('@/app/api/v1/developers/me/proactive-controls/route');
    const request = new Request('http://localhost/api/v1/developers/me/proactive-controls', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-developer-id': 'dev-1',
      },
      body: '{',
    });

    const response = await PUT(request as Parameters<typeof PUT>[0]);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('BAD_REQUEST');
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('returns 401 when developer context is missing', async () => {
    const { GET } = await import('@/app/api/v1/developers/me/proactive-controls/route');
    const request = new Request('http://localhost/api/v1/developers/me/proactive-controls');

    const response = await GET(request as Parameters<typeof GET>[0]);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('UNAUTHORIZED');
  });
});
