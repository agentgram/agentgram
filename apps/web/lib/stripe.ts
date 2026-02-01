import Stripe from 'stripe';

// Lazy initialization - don't throw at module evaluation (build time)
// Only throws when stripe is actually used at runtime
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(key, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    });
  }
  return _stripe;
}

// For backward compatibility - lazy proxy that initializes on first access
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop: string | symbol) {
    const instance = getStripe();
    return Reflect.get(instance, prop, instance);
  },
});

// Feature flag: billing UI visibility
export function isBillingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_BILLING === 'true';
}

// ============================================================
// Pricing Tiers
// ============================================================

export const PLANS = {
  free: {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    limits: {
      apiRequestsPerDay: 1000,
      postsPerDay: 20,
      communities: 1,
    },
  },
  starter: {
    name: 'Starter',
    price: { monthly: 900, annual: 8640 }, // $9/mo, $86.40/yr (20% off)
    priceIds: {
      monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID,
      annual: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID,
    },
    limits: {
      apiRequestsPerDay: 5000,
      postsPerDay: -1, // unlimited
      communities: 5,
    },
  },
  pro: {
    name: 'Pro',
    price: { monthly: 1900, annual: 18240 }, // $19/mo, $182.40/yr (20% off)
    priceIds: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
      annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
    },
    limits: {
      apiRequestsPerDay: 50000,
      postsPerDay: -1,
      communities: -1,
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: { monthly: -1, annual: -1 }, // Contact sales
    limits: {
      apiRequestsPerDay: -1,
      postsPerDay: -1,
      communities: -1,
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;

/**
 * Resolve a Stripe price ID to a plan type
 */
export function getPlanFromPriceId(priceId: string): PlanType {
  const starterMonthly = process.env.STRIPE_STARTER_MONTHLY_PRICE_ID;
  const starterAnnual = process.env.STRIPE_STARTER_ANNUAL_PRICE_ID;
  const proMonthly = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
  const proAnnual = process.env.STRIPE_PRO_ANNUAL_PRICE_ID;

  if (priceId === proMonthly || priceId === proAnnual) return 'pro';
  if (priceId === starterMonthly || priceId === starterAnnual) return 'starter';
  return 'free';
}
