import { NextRequest, NextResponse } from 'next/server';
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withDeveloperAuth } from '@/lib/auth/developer';
import { getBaseUrl } from '@/lib/env';
import {
  configureLemonSqueezy,
  getStoreId,
  isBillingEnabled,
  PLANS,
} from '@/lib/billing/lemonsqueezy';
import type { PlanType } from '@/lib/billing/lemonsqueezy';

export const POST = withDeveloperAuth(async function POST(req: NextRequest) {
  if (!isBillingEnabled()) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'BILLING_DISABLED', message: 'Billing is not yet available.' },
      },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const plan = body.plan as PlanType;
    const billingPeriod: 'monthly' | 'annual' = body.billingPeriod || 'monthly';

    if (!plan || !['starter', 'pro'].includes(plan)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_PLAN', message: 'Plan must be "starter" or "pro".' },
        },
        { status: 400 }
      );
    }

    const developerId = req.headers.get('x-developer-id');
    if (!developerId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Developer authentication required.' },
        },
        { status: 401 }
      );
    }

    const APP_URL = getBaseUrl();
    const { data: developer, error: devError } = await getSupabaseServiceClient()
      .from('developers')
      .select('id, billing_email, plan, subscription_status')
      .eq('id', developerId)
      .single();

    if (devError || !developer) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'DEVELOPER_NOT_FOUND', message: 'Developer account not found.' },
        },
        { status: 404 }
      );
    }

    if (developer.subscription_status === 'active' && developer.plan !== 'free') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ALREADY_SUBSCRIBED',
            message: 'You already have an active subscription. Use the billing portal to manage it.',
          },
        },
        { status: 400 }
      );
    }

    const planConfig = PLANS[plan];
    if (!('variantIds' in planConfig)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_PLAN', message: 'This plan is not available for checkout.' },
        },
        { status: 400 }
      );
    }

    const variantId = planConfig.variantIds[billingPeriod];
    if (!variantId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VARIANT_NOT_CONFIGURED',
            message: `Variant for ${plan} (${billingPeriod}) is not configured.`,
          },
        },
        { status: 500 }
      );
    }

    configureLemonSqueezy();

    const { data: checkout, error: checkoutError } = await createCheckout(
      getStoreId(),
      variantId,
      {
        checkoutOptions: {
          embed: false,
          media: false,
          logo: true,
        },
        checkoutData: {
          email: developer.billing_email ?? undefined,
          custom: {
            developer_id: developerId,
          },
        },
        productOptions: {
          enabledVariants: [Number(variantId)],
          redirectUrl: `${APP_URL}/dashboard/billing`,
          receiptButtonText: 'Go to Dashboard',
          receiptThankYouNote: 'Thank you for subscribing to AgentGram!',
        },
      }
    );

    if (checkoutError) {
      console.error('Lemon Squeezy checkout error:', checkoutError);
      return NextResponse.json(
        {
          success: false,
          error: { code: 'CHECKOUT_ERROR', message: 'Failed to create checkout session.' },
        },
        { status: 500 }
      );
    }

    const url = checkout?.data.attributes.url;

    return NextResponse.json({
      success: true,
      data: { url },
    });
  } catch (err) {
    console.error('Checkout session creation error:', err);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'CHECKOUT_ERROR', message: 'Failed to create checkout session.' },
      },
      { status: 500 }
    );
  }
});
