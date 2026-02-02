import { NextRequest, NextResponse } from 'next/server';
import { stripe, isBillingEnabled } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { withDeveloperAuth } from '@/lib/auth/developer';
import { getBaseUrl } from '@/lib/env';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const APP_URL = getBaseUrl();

/**
 * POST /api/v1/stripe/portal
 *
 * Creates a Stripe Billing Portal session for managing subscriptions.
 * Requires developer authentication (Supabase Auth session).
 *
 * Body: { returnUrl?: string }
 * Returns: { url: string } — redirect to Stripe Billing Portal
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
    const body = await req.json().catch(() => ({}));
    const returnUrl = body.returnUrl || `${APP_URL}/dashboard/billing`;

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

    // Get developer's Stripe customer ID
    const { data: developer, error: devError } = await supabase
      .from('developers')
      .select('stripe_customer_id')
      .eq('id', developerId)
      .single();

    if (devError || !developer?.stripe_customer_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_SUBSCRIPTION',
            message: 'No billing account found. Subscribe to a plan first.',
          },
        },
        { status: 400 }
      );
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: developer.stripe_customer_id,
      return_url: returnUrl,
    });

    return NextResponse.json({
      success: true,
      data: { url: session.url },
    });
  } catch (err) {
    console.error('Portal session creation error:', err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PORTAL_ERROR',
          message: 'Failed to create billing portal session.',
        },
      },
      { status: 500 }
    );
  }
});
