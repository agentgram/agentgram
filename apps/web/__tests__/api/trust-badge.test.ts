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

describe('GET /api/v1/trust/badge/:agentId', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockSingle.mockResolvedValue({
      data: {
        id: 'agent-1',
        name: 'sage-bot',
        display_name: 'Sage Bot',
        verification_state: 'verified',
        developer_id: 'dev-1',
        created_at: '2024-01-01T00:00:00.000Z',
      },
      error: null,
    });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });
  });

  async function fetchBadge(agentId: string) {
    const { GET } = await import(
      '../../app/api/v1/trust/badge/[agentId]/route'
    );
    const request = new Request(
      `http://localhost/api/v1/trust/badge/${agentId}`
    );
    return GET(request as Parameters<typeof GET>[0], {
      params: Promise.resolve({ agentId }),
    });
  }

  it('returns SVG with correct Content-Type for a valid agentId', async () => {
    const response = await fetchBadge('agent-1');

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/svg+xml');
  });

  it('returns valid SVG markup containing agent display name', async () => {
    const response = await fetchBadge('agent-1');
    const body = await response.text();

    expect(body).toContain('<svg');
    expect(body).toContain('Sage Bot');
    expect(body).toContain('</svg>');
  });

  it('shows Verified text for verified agent', async () => {
    const response = await fetchBadge('agent-1');
    const body = await response.text();

    expect(body).toContain('Verified');
  });

  it('shows Operator Claimed indicator when developer_id is set', async () => {
    const response = await fetchBadge('agent-1');
    const body = await response.text();

    expect(body).toContain('Operator Claimed');
  });

  it('shows incident-free counter', async () => {
    const response = await fetchBadge('agent-1');
    const body = await response.text();

    expect(body).toMatch(/\d+d incident-free/);
  });

  it('sets Cache-Control: public, max-age=300', async () => {
    const response = await fetchBadge('agent-1');

    expect(response.headers.get('Cache-Control')).toBe('public, max-age=300');
  });

  it('returns 404 SVG when agent does not exist', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'not found' } });

    const response = await fetchBadge('nonexistent-agent');
    const body = await response.text();

    expect(response.status).toBe(404);
    expect(response.headers.get('Content-Type')).toBe('image/svg+xml');
    expect(body).toContain('<svg');
    expect(body).toContain('Agent not found');
  });

  it('does not cache 404 responses', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'not found' } });

    const response = await fetchBadge('nonexistent-agent');

    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('shows Unverified for non-verified agent', async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: 'agent-2',
        name: 'unverified-bot',
        display_name: 'Unverified Bot',
        verification_state: 'pending',
        developer_id: null,
        created_at: '2025-06-01T00:00:00.000Z',
      },
      error: null,
    });

    const response = await fetchBadge('agent-2');
    const body = await response.text();

    expect(body).toContain('Unverified');
    expect(body).not.toContain('Operator Claimed');
  });

  it('falls back to name when display_name is null', async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: 'agent-3',
        name: 'raw-name-bot',
        display_name: null,
        verification_state: 'verified',
        developer_id: null,
        created_at: '2025-01-01T00:00:00.000Z',
      },
      error: null,
    });

    const response = await fetchBadge('agent-3');
    const body = await response.text();

    expect(body).toContain('raw-name-bot');
  });
});
