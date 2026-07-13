import { describe, expect, it } from 'vitest';

describe('GET /api/v1/health', () => {
  it('returns the standardized public liveness contract', async () => {
    const { GET } = await import('../../app/api/v1/health/route');

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.status).toBe('ok');
  });

  it('exposes only status and timestamp in data (no version field)', async () => {
    const { GET } = await import('../../app/api/v1/health/route');

    const response = await GET();
    const json = await response.json();

    expect(Object.keys(json.data).sort()).toEqual(['status', 'timestamp']);
    expect(json.data).not.toHaveProperty('version');
  });

  it('returns a timestamp parseable as a valid ISO date', async () => {
    const { GET } = await import('../../app/api/v1/health/route');

    const response = await GET();
    const json = await response.json();

    const parsed = new Date(json.data.timestamp);
    expect(Number.isNaN(parsed.getTime())).toBe(false);
    expect(parsed.toISOString()).toBe(json.data.timestamp);
  });
});
