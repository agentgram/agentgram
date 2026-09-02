import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function makeJwt(payload: Record<string, unknown>): string {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');

  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`;
}

describe('GET /api/v1/health', () => {
  const ORIGINAL_BILLING_ENABLED = process.env.NEXT_PUBLIC_ENABLE_BILLING;
  const ORIGINAL_API_KEY = process.env.LEMONSQUEEZY_API_KEY;

  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-02T00:00:00.000Z'));
    delete process.env.NEXT_PUBLIC_ENABLE_BILLING;
    delete process.env.LEMONSQUEEZY_API_KEY;
  });

  afterEach(() => {
    vi.useRealTimers();
    if (ORIGINAL_BILLING_ENABLED === undefined) {
      delete process.env.NEXT_PUBLIC_ENABLE_BILLING;
    } else {
      process.env.NEXT_PUBLIC_ENABLE_BILLING = ORIGINAL_BILLING_ENABLED;
    }

    if (ORIGINAL_API_KEY === undefined) {
      delete process.env.LEMONSQUEEZY_API_KEY;
    } else {
      process.env.LEMONSQUEEZY_API_KEY = ORIGINAL_API_KEY;
    }
  });

  it('returns the standardized public liveness contract', async () => {
    const { GET } = await import('../../app/api/v1/health/route');

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.status).toBe('ok');
  });

  it('exposes status, timestamp, and billing telemetry in data (no version field)', async () => {
    const { GET } = await import('../../app/api/v1/health/route');

    const response = await GET();
    const json = await response.json();

    expect(Object.keys(json.data).sort()).toEqual(['billing', 'status', 'timestamp']);
    expect(json.data).not.toHaveProperty('version');
    expect(json.data.billing).toEqual({
      enabled: false,
      apiKeyExpiresAt: null,
      apiKeyDaysLeft: null,
    });
  });

  it('returns a timestamp parseable as a valid ISO date', async () => {
    const { GET } = await import('../../app/api/v1/health/route');

    const response = await GET();
    const json = await response.json();

    const parsed = new Date(json.data.timestamp);
    expect(Number.isNaN(parsed.getTime())).toBe(false);
    expect(parsed.toISOString()).toBe(json.data.timestamp);
  });

  it('includes billing enabled state and Lemon Squeezy API key expiry telemetry', async () => {
    process.env.NEXT_PUBLIC_ENABLE_BILLING = 'true';
    process.env.LEMONSQUEEZY_API_KEY = makeJwt({
      exp: Date.parse('2026-09-04T00:00:00.000Z') / 1000,
    });
    const { GET } = await import('../../app/api/v1/health/route');

    const response = await GET();
    const json = await response.json();

    expect(json.data.billing).toEqual({
      enabled: true,
      apiKeyExpiresAt: '2026-09-04T00:00:00.000Z',
      apiKeyDaysLeft: 2,
    });
  });
});
