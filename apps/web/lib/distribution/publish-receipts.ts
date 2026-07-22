import { createClient } from '@supabase/supabase-js';
import { getBaseUrl } from '@/lib/env';
import type { X_DISTRIBUTION_CHANNEL, X_POST_ENDPOINT } from '@/lib/distribution/x-publisher';

export type XPublishChannelStatus = 'sent' | 'failed' | 'retryable_error';

export interface XPublishReceiptInput {
  postId: string;
  channel: typeof X_DISTRIBUTION_CHANNEL;
  channelStatus: XPublishChannelStatus;
  externalId?: string;
  externalUrl?: string;
  requestPayload: unknown;
  responsePayload?: unknown;
  errorMessage?: string;
  errorStatus?: number;
  retryable: boolean;
  endpoint: typeof X_POST_ENDPOINT;
  verifiedAt: string;
}

export interface XPublishReceiptResult {
  persisted: boolean;
  table: 'post_distribution_receipts';
  channelStatus: XPublishChannelStatus;
  receiptId?: string;
  receiptUrl?: string;
  externalId?: string;
  externalUrl?: string;
  skippedReason?: string;
}

function normalizePostId(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function getReceiptClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return undefined;
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function buildReceiptUrl(postId: string, receiptId: string): string {
  return new URL(
    `/posts/${encodeURIComponent(postId)}#distribution-x-${encodeURIComponent(receiptId)}`,
    getBaseUrl()
  ).toString();
}

function extractInsertedReceiptId(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }

  const id = (value as { id?: unknown }).id;
  return normalizePostId(id);
}

export function extractReceiptPostId(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }

  return normalizePostId((value as { postId?: unknown }).postId);
}

export async function persistXPublishReceipt(
  input: XPublishReceiptInput
): Promise<XPublishReceiptResult> {
  const client = getReceiptClient();
  const resultBase = {
    table: 'post_distribution_receipts' as const,
    channelStatus: input.channelStatus,
    ...(input.externalId ? { externalId: input.externalId } : {}),
    ...(input.externalUrl ? { externalUrl: input.externalUrl } : {}),
  };

  if (!client) {
    return {
      ...resultBase,
      persisted: false,
      skippedReason: 'Supabase service env is not configured',
    };
  }

  const { data, error } = await client
    .from('post_distribution_receipts')
    .insert({
      post_id: input.postId,
      channel: input.channel,
      channel_status: input.channelStatus,
      external_id: input.externalId ?? null,
      external_url: input.externalUrl ?? null,
      endpoint: input.endpoint,
      request_payload: input.requestPayload,
      response_payload: input.responsePayload ?? null,
      error_message: input.errorMessage ?? null,
      error_status: input.errorStatus ?? null,
      retryable: input.retryable,
      verified_at: input.verifiedAt,
    })
    .select('id')
    .single();

  if (error) {
    return {
      ...resultBase,
      persisted: false,
      skippedReason: error.message,
    };
  }

  const receiptId = extractInsertedReceiptId(data);

  return {
    ...resultBase,
    persisted: true,
    ...(receiptId ? { receiptId, receiptUrl: buildReceiptUrl(input.postId, receiptId) } : {}),
  };
}
