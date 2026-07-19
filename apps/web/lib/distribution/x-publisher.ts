export const X_DISTRIBUTION_CHANNEL = 'x' as const;
export const X_POST_TEXT_LIMIT = 280;
export const X_MEDIA_LIMIT = 4;
export const X_TAG_LIMIT = 6;
export const X_POST_ENDPOINT = 'https://api.x.com/2/tweets';
export const X_DRY_RUN_ENDPOINT = X_POST_ENDPOINT;

export interface XPublishMediaInput {
  url: string;
  altText?: string;
}

export interface XPublishDraftInput {
  text: string;
  sourceUrl?: string;
  agentHandle?: string;
  tags?: string[];
  media?: XPublishMediaInput[];
  dryRun: boolean;
}

interface XPublishValidatedPayload {
  text: string;
  characterCount: number;
  sourceUrl?: string;
  agentHandle?: string;
  tags: string[];
  media: XPublishMediaInput[];
}

export interface XPublishDryRunPayload {
  channel: typeof X_DISTRIBUTION_CHANNEL;
  mode: 'dry-run';
  status: 'validated';
  payload: XPublishValidatedPayload;
  validation: {
    textLimit: number;
    mediaLimit: number;
    tagLimit: number;
  };
  external: {
    wouldPostTo: typeof X_DRY_RUN_ENDPOINT;
    sent: false;
    reason: string;
  };
  verifiedAt: string;
}

export interface XPublishLivePayload {
  channel: typeof X_DISTRIBUTION_CHANNEL;
  mode: 'live';
  status: 'sent';
  payload: XPublishValidatedPayload;
  validation: {
    textLimit: number;
    mediaLimit: number;
    tagLimit: number;
  };
  external: {
    postedTo: typeof X_POST_ENDPOINT;
    sent: true;
    tweetId: string;
    text: string;
    editHistoryTweetIds: string[];
  };
  verifiedAt: string;
}

export class XPublishConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'XPublishConfigurationError';
  }
}

export class XPublishTransportError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'XPublishTransportError';
    this.status = status;
  }
}

export interface PublishXPostOptions {
  bearerToken?: string;
  fetcher?: typeof fetch;
  verifiedAt?: Date;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertHttpUrl(value: string, fieldName: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${fieldName} must be a valid http(s) URL`);
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error(`${fieldName} must be a valid http(s) URL`);
  }

  return parsed.toString();
}

function normalizeOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }

  const normalized = tags
    .map((tag) => normalizeOptionalString(tag)?.replace(/^#/, '').toLowerCase())
    .filter((tag): tag is string => Boolean(tag))
    .filter((tag) => /^[a-z0-9_]{1,30}$/.test(tag));

  return Array.from(new Set(normalized)).slice(0, X_TAG_LIMIT);
}

function normalizeMedia(media: unknown): XPublishMediaInput[] {
  if (!Array.isArray(media)) {
    return [];
  }

  return media.slice(0, X_MEDIA_LIMIT).map((item, index) => {
    if (!isRecord(item) || typeof item.url !== 'string') {
      throw new Error(`media[${index}].url is required`);
    }

    const normalized: XPublishMediaInput = {
      url: assertHttpUrl(item.url, `media[${index}].url`),
    };
    const altText = normalizeOptionalString(item.altText);
    if (altText) {
      normalized.altText = altText.slice(0, 1000);
    }

    return normalized;
  });
}

function buildValidationMetadata() {
  return {
    textLimit: X_POST_TEXT_LIMIT,
    mediaLimit: X_MEDIA_LIMIT,
    tagLimit: X_TAG_LIMIT,
  };
}

function buildValidatedPayload(input: XPublishDraftInput): XPublishValidatedPayload {
  const text = normalizeOptionalString(input.text);
  if (!text) {
    throw new Error('text is required');
  }

  const characterCount = Array.from(text).length;
  if (characterCount > X_POST_TEXT_LIMIT) {
    throw new Error(`text must be ${X_POST_TEXT_LIMIT} characters or fewer`);
  }

  const sourceUrl = input.sourceUrl
    ? assertHttpUrl(input.sourceUrl, 'sourceUrl')
    : undefined;
  const agentHandle = normalizeOptionalString(input.agentHandle)?.replace(/^@/, '');
  const tags = normalizeTags(input.tags);
  const media = normalizeMedia(input.media);

  return {
    text,
    characterCount,
    ...(sourceUrl ? { sourceUrl } : {}),
    ...(agentHandle ? { agentHandle } : {}),
    tags,
    media,
  };
}

function parseXPostResponse(value: unknown): {
  tweetId: string;
  text: string;
  editHistoryTweetIds: string[];
} {
  if (!isRecord(value) || !isRecord(value.data)) {
    throw new XPublishTransportError('X publish response did not include data', 502);
  }

  const tweetId = value.data.id;
  const text = value.data.text;
  const editHistoryTweetIds = value.data.edit_history_tweet_ids;

  if (typeof tweetId !== 'string' || tweetId.trim().length === 0) {
    throw new XPublishTransportError('X publish response did not include a tweet id', 502);
  }

  return {
    tweetId,
    text: typeof text === 'string' ? text : '',
    editHistoryTweetIds: Array.isArray(editHistoryTweetIds)
      ? editHistoryTweetIds.filter((id): id is string => typeof id === 'string')
      : [],
  };
}

async function readErrorText(response: Response): Promise<string> {
  try {
    return (await response.text()).slice(0, 500);
  } catch {
    return '';
  }
}

export function buildXPublishDryRunPayload(
  input: XPublishDraftInput,
  verifiedAt: Date = new Date()
): XPublishDryRunPayload {
  if (input.dryRun !== true) {
    throw new Error('Set dryRun=true to validate without sending, or use publishXPost for live X publishing');
  }

  return {
    channel: X_DISTRIBUTION_CHANNEL,
    mode: 'dry-run',
    status: 'validated',
    payload: buildValidatedPayload(input),
    validation: buildValidationMetadata(),
    external: {
      wouldPostTo: X_DRY_RUN_ENDPOINT,
      sent: false,
      reason: 'Dry-run mode validates and returns the payload without calling X APIs.',
    },
    verifiedAt: verifiedAt.toISOString(),
  };
}

export async function publishXPost(
  input: XPublishDraftInput,
  options: PublishXPostOptions = {}
): Promise<XPublishLivePayload> {
  if (input.dryRun !== false) {
    throw new Error('Set dryRun=false to publish to X');
  }

  const payload = buildValidatedPayload(input);
  if (payload.media.length > 0) {
    throw new Error('Live X publishing currently supports text-only posts');
  }

  const bearerToken = normalizeOptionalString(options.bearerToken);
  if (!bearerToken) {
    throw new XPublishConfigurationError('X_BEARER_TOKEN is not configured');
  }

  const fetcher = options.fetcher ?? fetch;
  const response = await fetcher(X_POST_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: payload.text }),
  });

  if (!response.ok) {
    const errorText = await readErrorText(response);
    throw new XPublishTransportError(
      `X publish failed with status ${response.status}${errorText ? `: ${errorText}` : ''}`,
      response.status
    );
  }

  const parsed = parseXPostResponse(await response.json());

  return {
    channel: X_DISTRIBUTION_CHANNEL,
    mode: 'live',
    status: 'sent',
    payload,
    validation: buildValidationMetadata(),
    external: {
      postedTo: X_POST_ENDPOINT,
      sent: true,
      tweetId: parsed.tweetId,
      text: parsed.text,
      editHistoryTweetIds: parsed.editHistoryTweetIds,
    },
    verifiedAt: (options.verifiedAt ?? new Date()).toISOString(),
  };
}
