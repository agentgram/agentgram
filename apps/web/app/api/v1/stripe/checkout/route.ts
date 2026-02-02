import { NextRequest, NextResponse } from 'next/server';
import { stripe, PLANS, isBillingEnabled } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { withDeveloperAuth } from '@/lib/auth/developer';
import { getBaseUrl } from '@/lib/env';
import type { PlanType } from '@/lib/stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const APP_URL = getBaseUrl();

/**
 * POST /api/v1/stripe/checkout
 *
 * Creates a Stripe Checkout Session for subscription billing.
 * Requires developer authentication (Supabase Auth session).
 *
 * Body: { plan: 'starter' | 'pro', billingPeriod?: 'monthly' | 'annual' }
 * Returns: { url: string } — redirect to Stripe Checkout
 */
export const POST = withDeveloperAuth(async function POST(req: NextRequest) {
  if (!isBillingEnabled()) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'BILLING_DISABLED',
          message: 'Billing is not yet available.',
        },
      },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const plan = body.plan as PlanType;
    const billingPeriod: 'monthly' | 'annual' = body.billingPeriod || 'monthly';

    // Validate plan
    if (!plan || !['starter', 'pro'].includes(plan)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PLAN',
            message: 'Plan must be "starter" or "pro".',
          },
        },
        { status: 400 }
      );
    }

    // Get developer_id from request (set by middleware or auth check)
    const developerId = req.headers.get('x-developer-id');
    if (!developerId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Developer authentication required.',
          },
        },
        { status: 401 }
      );
    }

    // Get developer from DB
    const { data: developer, error: devError } = await supabase
      .from('developers')
      .select(
        'id, billing_email, stripe_customer_id, plan, subscription_status'
      )
      .eq('id', developerId)
      .single();

    if (devError || !developer) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DEVELOPER_NOT_FOUND',
            message: 'Developer account not found.',
          },
        },
        { status: 404 }
      );
    }

    // Prevent creating checkout if already subscribed
    if (
      developer.subscription_status === 'active' &&
      developer.plan !== 'free'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ALREADY_SUBSCRIBED',
            message:
              'You already have an active subscription. Use the billing portal to manage it.',
          },
        },
        { status: 400 }
      );
    }

    // Resolve price ID
    const planConfig = PLANS[plan];
    if (!('priceIds' in planConfig)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PLAN',
            message: 'This plan is not available for checkout.',
          },
        },
        { status: 400 }
      );
    }

    const priceId = planConfig.priceIds[billingPeriod];
    if (!priceId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PRICE_NOT_CONFIGURED',
            message: `Price for ${plan} (${billingPeriod}) is not configured.`,
          },
        },
        { status: 500 }
      );
    }

    // Get or create Stripe customer
    let customerId = developer.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: developer.billing_email || undefined,
        metadata: {
          developer_id: developerId,
          platform: 'agentgram',
        },
      });
      customerId = customer.id;

      // Save customer ID to DB
      await supabase
        .from('developers')
        .update({ stripe_customer_id: customerId })
        .eq('id', developerId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/pricing/cancel`,
      allow_promotion_codes: true,
      metadata: {
        developer_id: developerId,
      },
      subscription_data: {
        metadata: {
          developer_id: developerId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { url: session.url },
    });
  } catch (err) {
    console.error('Checkout session creation error:', err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CHECKOUT_ERROR',
          message: 'Failed to create checkout session.',
        },
      },
      { status: 500 }
    );
  }
});
