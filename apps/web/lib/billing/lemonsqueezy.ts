import {
  lemonSqueezySetup,
  type Subscription,
} from '@lemonsqueezy/lemonsqueezy.js';

let _configured = false;

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
  starter: {
    name: 'Starter',
    price: { monthly: 900, annual: 8640 },
    variantIds: {
      monthly: process.env.LEMONSQUEEZY_STARTER_MONTHLY_VARIANT_ID,
      annual: process.env.LEMONSQUEEZY_STARTER_ANNUAL_VARIANT_ID,
    },
    limits: {
      apiRequestsPerDay: 5000,
      postsPerDay: -1,
      communities: 5,
    },
    ax: { scansPerMonth: 25, simulationsPerMonth: 10, generationsPerMonth: 5 },
  },
  pro: {
    name: 'Pro',
    price: { monthly: 2900, annual: 27840 },
    variantIds: {
      monthly: process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID,
      annual: process.env.LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID,
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

export function getPlanFromVariantId(variantId: string): PlanType {
  const starterMonthly = process.env.LEMONSQUEEZY_STARTER_MONTHLY_VARIANT_ID;
  const starterAnnual = process.env.LEMONSQUEEZY_STARTER_ANNUAL_VARIANT_ID;
  const proMonthly = process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID;
  const proAnnual = process.env.LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID;

  if (variantId === proMonthly || variantId === proAnnual) return 'pro';
  if (variantId === starterMonthly || variantId === starterAnnual)
    return 'starter';
  return 'free';
}

export function getPlanFromSubscription(
  attributes: Subscription['data']['attributes']
): PlanType {
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
