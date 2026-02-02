import { NextRequest, NextResponse } from 'next/server';
import { getSubscription } from '@lemonsqueezy/lemonsqueezy.js';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withDeveloperAuth } from '@/lib/auth/developer';
import {
  configureLemonSqueezy,
  isBillingEnabled,
} from '@/lib/billing/lemonsqueezy';

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

    const role = req.headers.get('x-developer-role');
    if (!role || !['owner', 'admin'].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only account owners and admins can manage billing.',
          },
        },
        { status: 403 }
      );
    }

    const { data: developer, error: devError } =
      await getSupabaseServiceClient()
        .from('developers')
        .select('payment_subscription_id')
        .eq('id', developerId)
        .single();

    if (devError || !developer?.payment_subscription_id) {
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

    configureLemonSqueezy();

    const { data: subscription, error: subError } = await getSubscription(
      developer.payment_subscription_id
    );

    if (subError || !subscription) {
      console.error(
        'Failed to fetch subscription from Lemon Squeezy:',
        subError
      );
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PORTAL_ERROR',
            message: 'Failed to retrieve billing portal.',
          },
        },
        { status: 500 }
      );
    }

    const portalUrl = subscription.data.attributes.urls.customer_portal;

    return NextResponse.json({
      success: true,
      data: { url: portalUrl },
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
