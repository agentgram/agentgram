import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { invalidateAllPlanCaches } from '@agentgram/auth';
import {
  getPlanFromSubscription,
  mapSubscriptionStatus,
} from '@/lib/billing/lemonsqueezy';

interface WebhookMeta {
  event_name: string;
  custom_data?: { developer_id?: string };
}

interface SubscriptionAttributes {
  store_id: number;
  customer_id: number;
  order_id: number;
  product_id: number;
  variant_id: number;
  status: string;
  user_email: string;
  pause: unknown | null;
  cancelled: boolean;
  renews_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  urls: {
    customer_portal: string;
    update_payment_method: string;
  };
}

interface WebhookPayload {
  meta: WebhookMeta;
  data: {
    id: string;
    type: string;
    attributes: SubscriptionAttributes;
  };
}

function verifySignature(
  rawBody: string,
  secret: string,
  signatureHeader: string
): boolean {
  const hmac = Buffer.from(
    crypto.createHmac('sha256', secret).update(rawBody).digest('hex'),
    'hex'
  );
  const signature = Buffer.from(signatureHeader, 'hex');

  if (hmac.length !== signature.length) return false;
  return crypto.timingSafeEqual(hmac, signature);
}

async function logWebhookEvent(
  eventName: string,
  payload: WebhookPayload
): Promise<void> {
  try {
    await getSupabaseServiceClient()
      .from('webhook_events')
      .insert({
        event_name: eventName,
        subscription_id: payload.data.id,
        developer_id: payload.meta.custom_data?.developer_id ?? null,
        payload: JSON.parse(JSON.stringify(payload)),
      });
  } catch {
    // Non-critical: log failure should not block webhook processing
    console.error('Failed to log webhook event:', eventName);
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CONFIG_ERROR',
          message: 'Webhook secret not configured',
        },
      },
      { status: 500 }
    );
  }

  const rawBody = await req.text();
  const signatureHeader = req.headers.get('X-Signature') ?? '';

  if (!verifySignature(rawBody, secret, signatureHeader)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Invalid webhook signature',
        },
      },
      { status: 400 }
    );
  }

  const payload = JSON.parse(rawBody) as WebhookPayload;
  const eventName = payload.meta.event_name;

  await logWebhookEvent(eventName, payload);

  try {
    switch (eventName) {
      case 'subscription_created':
        await handleSubscriptionCreated(payload);
        break;
      case 'subscription_updated':
        await handleSubscriptionUpdated(payload);
        break;
      case 'subscription_cancelled':
        await handleSubscriptionCancelled(payload);
        break;
      case 'subscription_expired':
        await handleSubscriptionExpired(payload);
        break;
      case 'subscription_paused':
        await handleSubscriptionPaused(payload);
        break;
      case 'subscription_unpaused':
        await handleSubscriptionUnpaused(payload);
        break;
      case 'subscription_payment_success':
        await handlePaymentSuccess(payload);
        break;
      case 'subscription_payment_failed':
        await handlePaymentFailed(payload);
        break;
      default:
        console.log(`Unhandled Lemon Squeezy event: ${eventName}`);
    }

    // Clear in-memory plan caches so plan-gate picks up changes immediately.
    // Redis-cached plans expire via TTL (60s) — acceptable for webhook latency.
    invalidateAllPlanCaches();

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`Error processing webhook ${eventName}:`, err);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'WEBHOOK_ERROR', message: 'Webhook handler failed' },
      },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(payload: WebhookPayload) {
  const developerId = payload.meta.custom_data?.developer_id;
  const attrs = payload.data.attributes;

  if (!developerId) {
    console.error('No developer_id in subscription_created custom_data');
    return;
  }

  const plan = getPlanFromSubscription({
    data: { attributes: attrs },
  } as never);

  const { error } = await getSupabaseServiceClient()
    .from('developers')
    .update({
      payment_customer_id: String(attrs.customer_id),
      payment_subscription_id: payload.data.id,
      payment_provider: 'lemonsqueezy',
      payment_variant_id: String(attrs.variant_id),
      plan,
      subscription_status: mapSubscriptionStatus(attrs.status),
      current_period_end: attrs.renews_at,
      updated_at: new Date().toISOString(),
    })
    .eq('id', developerId);

  if (error) console.error('Failed to create subscription:', error);
}

async function handleSubscriptionUpdated(payload: WebhookPayload) {
  const attrs = payload.data.attributes;
  const plan = getPlanFromSubscription({
    data: { attributes: attrs },
  } as never);

  const { error } = await getSupabaseServiceClient()
    .from('developers')
    .update({
      plan,
      payment_variant_id: String(attrs.variant_id),
      subscription_status: mapSubscriptionStatus(attrs.status),
      current_period_end: attrs.renews_at,
      updated_at: new Date().toISOString(),
    })
    .eq('payment_subscription_id', payload.data.id);

  if (error) console.error('Failed to update subscription:', error);
}

async function handleSubscriptionCancelled(payload: WebhookPayload) {
  const attrs = payload.data.attributes;

  const { error } = await getSupabaseServiceClient()
    .from('developers')
    .update({
      subscription_status: 'canceled',
      current_period_end: attrs.ends_at,
      updated_at: new Date().toISOString(),
    })
    .eq('payment_subscription_id', payload.data.id);

  if (error) console.error('Failed to cancel subscription:', error);
}

async function handleSubscriptionExpired(payload: WebhookPayload) {
  const { error } = await getSupabaseServiceClient()
    .from('developers')
    .update({
      plan: 'free',
      subscription_status: 'expired',
      payment_subscription_id: null,
      payment_variant_id: null,
      current_period_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq('payment_subscription_id', payload.data.id);

  if (error) console.error('Failed to expire subscription:', error);
}

async function handleSubscriptionPaused(payload: WebhookPayload) {
  const { error } = await getSupabaseServiceClient()
    .from('developers')
    .update({
      subscription_status: 'paused',
      updated_at: new Date().toISOString(),
    })
    .eq('payment_subscription_id', payload.data.id);

  if (error) console.error('Failed to pause subscription:', error);
}

async function handleSubscriptionUnpaused(payload: WebhookPayload) {
  const attrs = payload.data.attributes;

  const { error } = await getSupabaseServiceClient()
    .from('developers')
    .update({
      subscription_status: mapSubscriptionStatus(attrs.status),
      updated_at: new Date().toISOString(),
    })
    .eq('payment_subscription_id', payload.data.id);

  if (error) console.error('Failed to unpause subscription:', error);
}

async function handlePaymentSuccess(payload: WebhookPayload) {
  const { error } = await getSupabaseServiceClient()
    .from('developers')
    .update({
      subscription_status: 'active',
      last_payment_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('payment_subscription_id', payload.data.id);

  if (error) console.error('Failed to record payment success:', error);
}

async function handlePaymentFailed(payload: WebhookPayload) {
  const { error } = await getSupabaseServiceClient()
    .from('developers')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('payment_subscription_id', payload.data.id);

  if (error) console.error('Failed to record payment failure:', error);
}
