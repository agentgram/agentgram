import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const TEAM_ENV = [
  'LEMONSQUEEZY_TEAM_MONTHLY_VARIANT_ID',
  'LEMONSQUEEZY_TEAM_ANNUAL_VARIANT_ID',
  'LEMONSQUEEZY_STARTER_MONTHLY_VARIANT_ID',
  'LEMONSQUEEZY_STARTER_ANNUAL_VARIANT_ID',
  'LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID',
  'LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID',
] as const;

function clearVariantEnv() {
  for (const key of TEAM_ENV) delete process.env[key];
}

describe('lemonsqueezy variant mapping', () => {
  beforeEach(() => {
    vi.resetModules();
    clearVariantEnv();
  });

  afterEach(() => {
    clearVariantEnv();
  });

  it('maps new Team variant IDs to the team plan', async () => {
    process.env.LEMONSQUEEZY_TEAM_MONTHLY_VARIANT_ID = 'team-monthly';
    process.env.LEMONSQUEEZY_TEAM_ANNUAL_VARIANT_ID = 'team-annual';
    const { getPlanFromVariantId } = await import('@/lib/billing/lemonsqueezy');

    expect(getPlanFromVariantId('team-monthly')).toBe('team');
    expect(getPlanFromVariantId('team-annual')).toBe('team');
  });

  it('remaps legacy starter/pro variant IDs to the team plan (webhook regression safety)', async () => {
    process.env.LEMONSQUEEZY_STARTER_MONTHLY_VARIANT_ID = 'legacy-starter';
    process.env.LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID = 'legacy-pro';
    const { getPlanFromVariantId, getPlanFromSubscription } = await import(
      '@/lib/billing/lemonsqueezy'
    );

    expect(getPlanFromVariantId('legacy-starter')).toBe('team');
    expect(getPlanFromVariantId('legacy-pro')).toBe('team');
    expect(
      getPlanFromSubscription({ variant_id: 'legacy-pro' } as never)
    ).toBe('team');
  });

  it('returns null for unknown or unset variants so webhooks preserve current plan', async () => {
    const { getPlanFromVariantId } = await import('@/lib/billing/lemonsqueezy');

    expect(getPlanFromVariantId('nope')).toBeNull();
    // Must not match when env is unset (undefined === undefined guard).
    expect(getPlanFromVariantId('')).toBeNull();
  });

  it('resolves Team variantIds from new env, then legacy env as fallback', async () => {
    process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID = 'legacy-pro-monthly';
    let mod = await import('@/lib/billing/lemonsqueezy');
    // No team env yet → falls back to configured legacy pro variant.
    expect(mod.PLANS.team.variantIds.monthly).toBe('legacy-pro-monthly');

    vi.resetModules();
    process.env.LEMONSQUEEZY_TEAM_MONTHLY_VARIANT_ID = 'team-monthly';
    mod = await import('@/lib/billing/lemonsqueezy');
    // New team env takes precedence.
    expect(mod.PLANS.team.variantIds.monthly).toBe('team-monthly');
  });

  it('skips empty Team env and falls back to the first non-empty legacy env', async () => {
    process.env.LEMONSQUEEZY_TEAM_MONTHLY_VARIANT_ID = '   ';
    process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID = 'legacy-pro-monthly';
    const { PLANS } = await import('@/lib/billing/lemonsqueezy');

    expect(PLANS.team.variantIds.monthly).toBe('legacy-pro-monthly');
  });

  it('tolerates missing variant env without crashing', async () => {
    const { PLANS } = await import('@/lib/billing/lemonsqueezy');
    expect(PLANS.team.variantIds.monthly).toBeUndefined();
    expect(PLANS.team.variantIds.annual).toBeUndefined();
  });

  it('exposes Free / Team / Enterprise as the only plan tiers', async () => {
    const { PLANS } = await import('@/lib/billing/lemonsqueezy');
    expect(Object.keys(PLANS).sort()).toEqual(['enterprise', 'free', 'team']);
  });
});

// Mirror of the developers.plan CHECK constraint
// (supabase/migrations/20260721000000_add_team_plan_to_developers.sql).
// Guards against billing code writing a plan value the DB will reject at runtime.
const ALLOWED_DB_PLANS = ['free', 'starter', 'pro', 'team', 'enterprise'];

describe('plan values stay in sync with the developers.plan DB constraint', () => {
  beforeEach(() => {
    vi.resetModules();
    clearVariantEnv();
  });

  afterEach(() => {
    clearVariantEnv();
  });

  it('every PLANS key is an allowed developers.plan value', async () => {
    const { PLANS } = await import('@/lib/billing/lemonsqueezy');
    for (const key of Object.keys(PLANS)) {
      expect(ALLOWED_DB_PLANS).toContain(key);
    }
  });

  it('every plan the webhook can write is an allowed developers.plan value', async () => {
    process.env.LEMONSQUEEZY_TEAM_MONTHLY_VARIANT_ID = 'team-monthly';
    process.env.LEMONSQUEEZY_STARTER_ANNUAL_VARIANT_ID = 'legacy-starter';
    process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID = 'legacy-pro';
    const { getPlanFromVariantId } = await import('@/lib/billing/lemonsqueezy');

    for (const variant of ['team-monthly', 'legacy-starter', 'legacy-pro']) {
      expect(ALLOWED_DB_PLANS).toContain(getPlanFromVariantId(variant));
    }

    expect(getPlanFromVariantId('unknown')).toBeNull();
  });
});
