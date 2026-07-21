import crypto from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const webhookInserts: Record<string, unknown>[] = [];
const webhookProcessedIds: string[] = [];
const developerUpdates: Record<string, unknown>[] = [];
const existingWebhookRows: Array<{ id: string } | null> = [];
let insertedRowCounter = 0;

function createQuery(table: string) {
  const query = {
    insert(payload: Record<string, unknown>) {
      if (table === 'webhook_events') webhookInserts.push(payload);
      return query;
    },
    update(payload: Record<string, unknown>) {
      if (table === 'developers') developerUpdates.push(payload);
      return query;
    },
    select() {
      return query;
    },
    eq(column: string, value: unknown) {
      if (
        table === 'webhook_events' &&
        column === 'id' &&
        typeof value === 'string'
      ) {
        webhookProcessedIds.push(value);
      }
      return query;
    },
    neq() {
      return query;
    },
    not() {
      return query;
    },
    limit() {
      return query;
    },
    async single() {
      insertedRowCounter += 1;
      return { data: { id: `webhook-row-${insertedRowCounter}` }, error: null };
    },
    async maybeSingle() {
      return { data: existingWebhookRows.shift() ?? null, error: null };
    },
    async or() {
      return { error: null };
    },
  };

  return query;
}

vi.mock('@agentgram/db', () => ({
  getSupabaseServiceClient: () => ({
    from: createQuery,
  }),
}));

const invalidateAllPlanCaches = vi.fn();
vi.mock('@agentgram/auth', () => ({
  invalidateAllPlanCaches,
}));

function sign(rawBody: string) {
  return crypto
    .createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? '')
    .update(rawBody)
    .digest('hex');
}

function subscriptionPayload(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    meta: {
      event_name: 'subscription_created',
      webhook_id: 'ls-webhook-1',
      custom_data: { developer_id: 'developer-1' },
    },
    data: {
      id: 'subscription-1',
      type: 'subscriptions',
      attributes: {
        store_id: 123,
        customer_id: 456,
        order_id: 789,
        product_id: 111,
        variant_id: 222,
        status: 'active',
        user_email: 'buyer@example.com',
        pause: null,
        cancelled: false,
        renews_at: '2026-08-21T00:00:00.000Z',
        ends_at: null,
        created_at: '2026-07-21T00:00:00.000Z',
        updated_at: '2026-07-21T00:00:00.000Z',
        urls: {
          customer_portal: 'https://example.com/portal',
          update_payment_method: 'https://example.com/payment',
        },
        ...overrides,
      },
    },
  };
}

function requestFor(payload: unknown) {
  const rawBody = JSON.stringify(payload);
  return new NextRequest('http://localhost/api/v1/billing/webhook', {
    method: 'POST',
    body: rawBody,
    headers: {
      'X-Signature': sign(rawBody),
    },
  });
}

describe('billing webhook lifecycle', () => {
  beforeEach(() => {
    vi.resetModules();
    webhookInserts.length = 0;
    webhookProcessedIds.length = 0;
    developerUpdates.length = 0;
    existingWebhookRows.length = 0;
    insertedRowCounter = 0;
    invalidateAllPlanCaches.mockClear();
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET = 'test-webhook-secret';
    process.env.LEMONSQUEEZY_STORE_ID = '123';
    process.env.LEMONSQUEEZY_TEAM_MONTHLY_VARIANT_ID = '222';
  });

  it('logs an unprocessed row, runs the handler, marks only that row processed, then dedups a duplicate delivery', async () => {
    const { POST } = await import('../../app/api/v1/billing/webhook/route');
    const payload = subscriptionPayload();

    existingWebhookRows.push(null);
    const first = await POST(requestFor(payload));

    expect(first.status).toBe(200);
    expect(await first.json()).toEqual({ received: true });
    expect(webhookInserts).toHaveLength(1);
    expect(webhookInserts[0]).toMatchObject({
      event_name: 'subscription_created',
      subscription_id: 'subscription-1',
      developer_id: 'developer-1',
      processed_at: null,
    });
    expect(developerUpdates).toHaveLength(1);
    expect(developerUpdates[0]).toMatchObject({
      payment_subscription_id: 'subscription-1',
      payment_variant_id: '222',
      plan: 'team',
      subscription_status: 'active',
    });
    expect(webhookProcessedIds).toContain('webhook-row-1');
    expect(invalidateAllPlanCaches).toHaveBeenCalledTimes(1);

    existingWebhookRows.push({ id: 'webhook-row-1' });
    const duplicate = await POST(requestFor(payload));

    expect(duplicate.status).toBe(200);
    expect(await duplicate.json()).toEqual({
      received: true,
      deduplicated: true,
    });
    expect(webhookInserts).toHaveLength(2);
    expect(webhookInserts[1]).toMatchObject({ processed_at: null });
    expect(developerUpdates).toHaveLength(1);
    expect(webhookProcessedIds).not.toContain('webhook-row-2');
  });
});
