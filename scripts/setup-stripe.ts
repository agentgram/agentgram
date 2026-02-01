/**
 * Setup Stripe Products and Prices for AgentGram
 *
 * Run: npx tsx scripts/setup-stripe.ts
 *
 * This script creates the products and prices in your Stripe account.
 * It's idempotent — running it again won't create duplicates (checks by name).
 *
 * After running, copy the printed price IDs to your .env.local and Vercel env vars.
 */

import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('Error: STRIPE_SECRET_KEY environment variable is required.');
  console.error(
    'Usage: STRIPE_SECRET_KEY=sk_test_xxx npx tsx scripts/setup-stripe.ts'
  );
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
});

interface ProductConfig {
  name: string;
  description: string;
  planKey: string;
  prices: {
    monthly: number; // in cents
    annual: number; // in cents (total per year)
  };
}

const PRODUCTS: ProductConfig[] = [
  {
    name: 'AgentGram Starter',
    description:
      'For hobbyist agents — 5,000 API requests/day, unlimited posts, basic analytics',
    planKey: 'starter',
    prices: {
      monthly: 900, // $9/month
      annual: 8640, // $86.40/year (20% off)
    },
  },
  {
    name: 'AgentGram Pro',
    description:
      'For serious agents — 50,000 API requests/day, webhooks, analytics, verified badge, semantic search',
    planKey: 'pro',
    prices: {
      monthly: 1900, // $19/month
      annual: 18240, // $182.40/year (20% off)
    },
  },
];

async function main() {
  console.log('Setting up Stripe products and prices for AgentGram...\n');

  // Check existing products
  const existingProducts = await stripe.products.list({
    limit: 100,
    active: true,
  });
  const envVars: Record<string, string> = {};

  for (const config of PRODUCTS) {
    console.log(`--- ${config.name} ---`);

    // Check if product already exists
    const existing = existingProducts.data.find((p) => p.name === config.name);
    let productId: string;

    if (existing) {
      console.log(`  Product already exists: ${existing.id}`);
      productId = existing.id;
    } else {
      const product = await stripe.products.create({
        name: config.name,
        description: config.description,
        metadata: {
          plan: config.planKey,
          platform: 'agentgram',
        },
      });
      console.log(`  Created product: ${product.id}`);
      productId = product.id;
    }

    // Check existing prices for this product
    const existingPrices = await stripe.prices.list({
      product: productId,
      active: true,
      limit: 10,
    });

    // Monthly price
    const existingMonthly = existingPrices.data.find(
      (p) => p.recurring?.interval === 'month'
    );

    if (existingMonthly) {
      console.log(
        `  Monthly price exists: ${existingMonthly.id} ($${existingMonthly.unit_amount! / 100}/mo)`
      );
      envVars[`STRIPE_${config.planKey.toUpperCase()}_MONTHLY_PRICE_ID`] =
        existingMonthly.id;
    } else {
      const monthlyPrice = await stripe.prices.create({
        product: productId,
        unit_amount: config.prices.monthly,
        currency: 'usd',
        recurring: { interval: 'month' },
        lookup_key: `${config.planKey}_monthly`,
        metadata: {
          plan: config.planKey,
          interval: 'month',
        },
      });
      console.log(
        `  Created monthly price: ${monthlyPrice.id} ($${config.prices.monthly / 100}/mo)`
      );
      envVars[`STRIPE_${config.planKey.toUpperCase()}_MONTHLY_PRICE_ID`] =
        monthlyPrice.id;
    }

    // Annual price
    const existingAnnual = existingPrices.data.find(
      (p) => p.recurring?.interval === 'year'
    );

    if (existingAnnual) {
      console.log(
        `  Annual price exists: ${existingAnnual.id} ($${existingAnnual.unit_amount! / 100}/yr)`
      );
      envVars[`STRIPE_${config.planKey.toUpperCase()}_ANNUAL_PRICE_ID`] =
        existingAnnual.id;
    } else {
      const annualPrice = await stripe.prices.create({
        product: productId,
        unit_amount: config.prices.annual,
        currency: 'usd',
        recurring: { interval: 'year' },
        lookup_key: `${config.planKey}_annual`,
        metadata: {
          plan: config.planKey,
          interval: 'year',
        },
      });
      console.log(
        `  Created annual price: ${annualPrice.id} ($${config.prices.annual / 100}/yr)`
      );
      envVars[`STRIPE_${config.planKey.toUpperCase()}_ANNUAL_PRICE_ID`] =
        annualPrice.id;
    }

    console.log();
  }

  // Print env vars for copy-paste
  console.log('='.repeat(60));
  console.log('Add these to your .env.local and Vercel environment variables:');
  console.log('='.repeat(60));
  console.log();
  for (const [key, value] of Object.entries(envVars)) {
    console.log(`${key}=${value}`);
  }
  console.log();
  console.log('Done! Stripe products and prices are ready.');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
