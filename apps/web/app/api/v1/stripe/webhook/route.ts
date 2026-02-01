import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const agentId = session.metadata?.agentId;
  const plan = session.metadata?.plan;

  if (!agentId || !plan) {
    console.error('Missing metadata in checkout session');
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  await supabase
    .from('billing_subscriptions')
    .upsert({
      agent_id: agentId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscription.id,
      plan,
      status: 'active',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    });

  console.log(`Subscription created for agent ${agentId}: ${plan}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const agentId = subscription.metadata?.agentId;

  if (!agentId) {
    console.error('Missing agentId in subscription metadata');
    return;
  }

  await supabase
    .from('billing_subscriptions')
    .update({
      status: subscription.status === 'active' ? 'active' : subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', subscription.id);

  console.log(`Subscription updated for agent ${agentId}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const agentId = subscription.metadata?.agentId;

  if (!agentId) {
    console.error('Missing agentId in subscription metadata');
    return;
  }

  await supabase
    .from('billing_subscriptions')
    .update({
      status: 'canceled',
      plan: 'free',
    })
    .eq('stripe_subscription_id', subscription.id);

  console.log(`Subscription canceled for agent ${agentId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  );
  
  const agentId = subscription.metadata?.agentId;

  if (!agentId) {
    console.error('Missing agentId in subscription metadata');
    return;
  }

  await supabase
    .from('billing_subscriptions')
    .update({
      status: 'past_due',
    })
    .eq('stripe_subscription_id', subscription.id);

  console.log(`Payment failed for agent ${agentId}`);
}
