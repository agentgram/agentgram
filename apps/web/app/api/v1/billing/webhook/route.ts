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
  if (signatureHeader.length !== 64) return false;

  const hmac = Buffer.from(
    crypto.createHmac('sha256', secret).update(rawBody).digest('hex'),
    'hex'
  );
  const signature = Buffer.from(signatureHeader, 'hex');

  if (hmac.length !== signature.length) return false;
  return crypto.timingSafeEqual(hmac, signature);
}

function validateStoreId(attrs: SubscriptionAttributes): boolean {
  const expectedStoreId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!expectedStoreId) return true;
  return attrs.store_id === Number(expectedStoreId);
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

/**
 * Throws if a Supabase update fails, so the webhook returns 500
 * and Lemon Squeezy retries the delivery.
 */
function assertUpdate(
  result: { error: { message: string; code: string } | null },
  context: string
): void {
  if (result.error) {
    throw new Error(
      `${context}: ${result.error.message} (${result.error.code})`
    );
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

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_PAYLOAD',
          message: 'Request body is not valid JSON',
        },
      },
      { status: 400 }
    );
  }

  const eventName = payload.meta.event_name;

  if (!validateStoreId(payload.data.attributes)) {
    console.warn(
      `Webhook store_id mismatch: received ${payload.data.attributes.store_id}`
    );
    return NextResponse.json({ received: true });
  }

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

  const result = await getSupabaseServiceClient()
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

  assertUpdate(result, 'subscription_created');
}

async function handleSubscriptionUpdated(payload: WebhookPayload) {
  const attrs = payload.data.attributes;
  const plan = getPlanFromSubscription({
    data: { attributes: attrs },
  } as never);

  const result = await getSupabaseServiceClient()
    .from('developers')
    .update({
      plan,
      payment_variant_id: String(attrs.variant_id),
      subscription_status: mapSubscriptionStatus(attrs.status),
      current_period_end: attrs.renews_at,
      updated_at: new Date().toISOString(),
    })
    .eq('payment_subscription_id', payload.data.id);

  assertUpdate(result, 'subscription_updated');
}

async function handleSubscriptionCancelled(payload: WebhookPayload) {
  const attrs = payload.data.attributes;

  const result = await getSupabaseServiceClient()
    .from('developers')
    .update({
      subscription_status: 'canceled',
      current_period_end: attrs.ends_at,
      updated_at: new Date().toISOString(),
    })
    .eq('payment_subscription_id', payload.data.id);

  assertUpdate(result, 'subscription_cancelled');
}

async function handleSubscriptionExpired(payload: WebhookPayload) {
  const result = await getSupabaseServiceClient()
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

  assertUpdate(result, 'subscription_expired');
}

async function handleSubscriptionPaused(payload: WebhookPayload) {
  const result = await getSupabaseServiceClient()
    .from('developers')
    .update({
      subscription_status: 'paused',
      updated_at: new Date().toISOString(),
    })
    .eq('payment_subscription_id', payload.data.id);

  assertUpdate(result, 'subscription_paused');
}

async function handleSubscriptionUnpaused(payload: WebhookPayload) {
  const attrs = payload.data.attributes;

  const result = await getSupabaseServiceClient()
    .from('developers')
    .update({
      subscription_status: mapSubscriptionStatus(attrs.status),
      updated_at: new Date().toISOString(),
    })
    .eq('payment_subscription_id', payload.data.id);

  assertUpdate(result, 'subscription_unpaused');
}

async function handlePaymentSuccess(payload: WebhookPayload) {
  const result = await getSupabaseServiceClient()
    .from('developers')
    .update({
      subscription_status: 'active',
      last_payment_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('payment_subscription_id', payload.data.id);

  assertUpdate(result, 'payment_success');
}

async function handlePaymentFailed(payload: WebhookPayload) {
  const result = await getSupabaseServiceClient()
    .from('developers')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('payment_subscription_id', payload.data.id);

  assertUpdate(result, 'payment_failed');
}
