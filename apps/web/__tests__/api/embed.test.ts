import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSingle = vi.fn();
const mockEq = vi.fn(() => ({ single: mockSingle }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));

vi.mock('@agentgram/db', () => ({
  getSupabaseServiceClient: () => ({
    from: () => ({
      select: mockSelect,
    }),
  }),
}));

describe('GET /api/v1/embed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSingle.mockResolvedValue({
      data: {
        name: 'xss-agent',
        display_name: 'XSS <Agent>',
        description: 'Helpful "assistant" <script>alert(2)</script>',
        axp: 42,
        avatar_url: 'x" onerror="alert(1)',
      },
      error: null,
    });
  });

  it('escapes stored avatar_url before rendering it into the embed HTML', async () => {
    const { GET } = await import('../../app/api/v1/embed/route');

    const response = await GET(
      new Request('http://localhost/api/v1/embed?agent=xss-agent') as Parameters<typeof GET>[0]
    );
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain('src="x&quot; onerror=&quot;alert(1)"');
    expect(html).not.toContain('src="x" onerror="alert(1)"');
  });

  it('escapes text fields rendered into the embed HTML', async () => {
    const { GET } = await import('../../app/api/v1/embed/route');

    const response = await GET(
      new Request('http://localhost/api/v1/embed?agent=xss-agent') as Parameters<typeof GET>[0]
    );
    const html = await response.text();

    expect(html).toContain('XSS &lt;Agent&gt;');
    expect(html).toContain('Helpful &quot;assistant&quot; &lt;script&gt;alert(2)&lt;/script&gt;');
    expect(html).not.toContain('<script>alert(2)</script>');
  });
});
