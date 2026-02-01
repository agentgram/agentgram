import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Supabase admin client for webhook processing
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      // ═══════════════════════════════════════
      // CHECKOUT
      // ═══════════════════════════════════════
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      // ═══════════════════════════════════════
      // SUBSCRIPTIONS
      // ═══════════════════════════════════════
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
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

      case 'customer.subscription.paused': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionPaused(subscription);
        break;
      }

      case 'customer.subscription.resumed': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionResumed(subscription);
        break;
      }

      // ═══════════════════════════════════════
      // INVOICES
      // ═══════════════════════════════════════
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error(`Error processing webhook ${event.type}:`, err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════
// HANDLER FUNCTIONS
// ═══════════════════════════════════════════════

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const agentId = session.metadata?.agent_id;
  const customerId = session.customer as string;

  if (!agentId) {
    console.error('No agent_id in checkout session metadata');
    return;
  }

  // Link Stripe customer to agent
  const { error } = await supabase
    .from('agents')
    .update({
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', agentId);

  if (error) {
    console.error('Failed to update agent with customer ID:', error);
  }

  console.log(`✅ Checkout completed: agent=${agentId}, customer=${customerId}`);
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const plan = getPlanFromSubscription(subscription);

  const { error } = await supabase
    .from('agents')
    .update({
      plan,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Failed to update subscription:', error);
  }

  console.log(`✅ Subscription created: customer=${customerId}, plan=${plan}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const plan = getPlanFromSubscription(subscription);

  const { error } = await supabase
    .from('agents')
    .update({
      plan,
      subscription_status: subscription.status,
      current_period_end: subscription.items.data[0]?.current_period_end
        ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Failed to update subscription:', error);
  }

  console.log(`✅ Subscription updated: customer=${customerId}, plan=${plan}, status=${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Downgrade to free plan
  const { error } = await supabase
    .from('agents')
    .update({
      plan: 'free',
      subscription_status: 'canceled',
      stripe_subscription_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Failed to cancel subscription:', error);
  }

  console.log(`✅ Subscription deleted: customer=${customerId} → free plan`);
}

async function handleSubscriptionPaused(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const { error } = await supabase
    .from('agents')
    .update({
      subscription_status: 'paused',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Failed to pause subscription:', error);
  }

  console.log(`⏸️ Subscription paused: customer=${customerId}`);
}

async function handleSubscriptionResumed(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const { error } = await supabase
    .from('agents')
    .update({
      subscription_status: subscription.status,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Failed to resume subscription:', error);
  }

  console.log(`▶️ Subscription resumed: customer=${customerId}`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Update last payment info
  const { error } = await supabase
    .from('agents')
    .update({
      subscription_status: 'active',
      last_payment_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Failed to update payment status:', error);
  }

  console.log(`💰 Invoice paid: customer=${customerId}, amount=${invoice.amount_paid}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const { error } = await supabase
    .from('agents')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Failed to update failed payment:', error);
  }

  console.log(`❌ Invoice payment failed: customer=${customerId}`);
}

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════

function getPlanFromSubscription(subscription: Stripe.Subscription): string {
  const priceId = subscription.items.data[0]?.price?.id;

  if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) return 'enterprise';
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro';
  return 'free';
}
