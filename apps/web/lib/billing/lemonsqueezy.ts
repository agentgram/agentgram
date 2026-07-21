import {
  lemonSqueezySetup,
  type Subscription,
} from '@lemonsqueezy/lemonsqueezy.js';

let _configured = false;

function firstNonEmptyEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

export function configureLemonSqueezy(): void {
  if (_configured) return;

  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    throw new Error('LEMONSQUEEZY_API_KEY is not set');
  }

  lemonSqueezySetup({ apiKey });
  _configured = true;
}

export function getStoreId(): string {
  const id = process.env.LEMONSQUEEZY_STORE_ID;
  if (!id) throw new Error('LEMONSQUEEZY_STORE_ID is not set');
  return id;
}

export function isBillingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_BILLING === 'true';
}

/**
 * C-plan product tiers: Free (evaluation) → Team (paid governance plan) →
 * Enterprise (contact sales). The companion starter/pro SKUs are retired.
 *
 * Team resolves its Lemon Squeezy variant from the new
 * LEMONSQUEEZY_TEAM_* env vars, falling back to any legacy starter/pro
 * variant that is still configured so an existing store keeps a working
 * checkout until the CEO creates dedicated Team variants. Missing env is
 * tolerated: the fields become `undefined` and the checkout route reports
 * VARIANT_NOT_CONFIGURED instead of crashing.
 */
export const PLANS = {
  free: {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    limits: {
      apiRequestsPerDay: 1000,
      postsPerDay: 20,
      communities: 1,
    },
    ax: { scansPerMonth: 3, simulationsPerMonth: 0, generationsPerMonth: 0 },
  },
  team: {
    name: 'Team',
    price: { monthly: 4900, annual: 47040 },
    variantIds: {
      monthly: firstNonEmptyEnv(
        'LEMONSQUEEZY_TEAM_MONTHLY_VARIANT_ID',
        'LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID',
        'LEMONSQUEEZY_STARTER_MONTHLY_VARIANT_ID'
      ),
      annual: firstNonEmptyEnv(
        'LEMONSQUEEZY_TEAM_ANNUAL_VARIANT_ID',
        'LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID',
        'LEMONSQUEEZY_STARTER_ANNUAL_VARIANT_ID'
      ),
    },
    limits: {
      apiRequestsPerDay: 50000,
      postsPerDay: -1,
      communities: -1,
    },
    ax: { scansPerMonth: 200, simulationsPerMonth: 100, generationsPerMonth: 50 },
  },
  enterprise: {
    name: 'Enterprise',
    price: { monthly: -1, annual: -1 },
    limits: {
      apiRequestsPerDay: -1,
      postsPerDay: -1,
      communities: -1,
    },
    ax: { scansPerMonth: -1, simulationsPerMonth: -1, generationsPerMonth: -1 },
  },
} as const;

export type PlanType = keyof typeof PLANS;

/**
 * Resolve a Lemon Squeezy variant ID to a C-plan tier.
 *
 * New Team variants map to `team`. Legacy starter/pro variant IDs are still
 * recognized (webhook regression safety for any pre-existing subscription)
 * but are remapped to the `team` product — starter/pro are no longer sold.
 * Unknown or unset variants return null so webhook handlers can preserve the
 * current plan instead of silently downgrading paid customers to Free.
 */
export function getPlanFromVariantId(variantId: string): PlanType | null {
  const teamVariantIds = [
    process.env.LEMONSQUEEZY_TEAM_MONTHLY_VARIANT_ID,
    process.env.LEMONSQUEEZY_TEAM_ANNUAL_VARIANT_ID,
    // Legacy companion SKUs — remapped to Team, not removed.
    process.env.LEMONSQUEEZY_STARTER_MONTHLY_VARIANT_ID,
    process.env.LEMONSQUEEZY_STARTER_ANNUAL_VARIANT_ID,
    process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID,
    process.env.LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID,
  ];

  if (teamVariantIds.some((id) => id?.trim() && id.trim() === variantId)) {
    return 'team';
  }
  return null;
}

export function getPlanFromSubscription(
  attributes: Subscription['data']['attributes']
): PlanType | null {
  const variantId = String(attributes.variant_id);
  return getPlanFromVariantId(variantId);
}

/**
 * LS uses 'cancelled' (British), we store 'canceled' (American).
 * LS statuses: on_trial | active | paused | past_due | unpaid | cancelled | expired
 */
export function mapSubscriptionStatus(lsStatus: string): string {
  if (lsStatus === 'cancelled') return 'canceled';
  if (['active', 'on_trial', 'paused', 'past_due', 'unpaid', 'expired'].includes(lsStatus)) {
    return lsStatus;
  }
  return 'none';
}
