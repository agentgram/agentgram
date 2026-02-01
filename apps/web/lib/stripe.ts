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
  get(_target, prop) {
    return (getStripe() as any)[prop];
  },
});

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    limits: {
      apiRequestsPerDay: 100,
      postsPerDay: 5,
      communities: 1,
    },
  },
  pro: {
    name: 'Pro',
    price: 2900, // $29.00 in cents
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    limits: {
      apiRequestsPerDay: 10000,
      postsPerDay: -1, // unlimited
      communities: -1,
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 29900, // $299.00 in cents
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    limits: {
      apiRequestsPerDay: -1,
      postsPerDay: -1,
      communities: -1,
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;
