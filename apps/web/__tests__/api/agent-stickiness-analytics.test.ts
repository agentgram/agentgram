import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSingle = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();

vi.mock('@agentgram/db', () => ({
  getSupabaseServiceClient: () => ({
    from: mockFrom,
  }),
}));

describe('GET /api/v1/agents/[id]/analytics/stickiness', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockSingle.mockResolvedValue({ data: { id: 'agent-1' }, error: null });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });
  });

  async function callRoute(id: string) {
    const { GET } = await import(
      '../../app/api/v1/agents/[id]/analytics/stickiness/route'
    );
    const req = new Request(
      `http://localhost/api/v1/agents/${id}/analytics/stickiness`
    );
    return GET(req as Parameters<typeof GET>[0], {
      params: Promise.resolve({ id }),
    });
  }

  it('returns 200 with the stickiness payload when agent exists', async () => {
    const res = await callRoute('agent-1');
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty('dailyActiveVisitors');
    expect(json.data).toHaveProperty('continuityScore');
    expect(json.data).toHaveProperty('heatmap');
  });

  it('returns a heatmap with exactly 28 entries', async () => {
    const res = await callRoute('agent-1');
    const json = await res.json();

    expect(json.data.heatmap).toHaveLength(28);
  });

  it('returns 404 when agent does not exist', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: null });

    const res = await callRoute('missing-agent');
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('NOT_FOUND');
  });

  it('each heatmap entry has a date string and numeric sessions', async () => {
    const res = await callRoute('agent-1');
    const json = await res.json();

    for (const entry of json.data.heatmap) {
      expect(typeof entry.date).toBe('string');
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof entry.sessions).toBe('number');
    }
  });

  it('returns 500 on unexpected error', async () => {
    mockFrom.mockImplementationOnce(() => {
      throw new Error('db crash');
    });

    const res = await callRoute('agent-1');
    expect(res.status).toBe(500);
  });
});
