import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
  typescript: true,
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
