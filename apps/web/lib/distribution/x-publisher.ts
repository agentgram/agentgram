export const X_DISTRIBUTION_CHANNEL = 'x' as const;
export const X_POST_TEXT_LIMIT = 280;
export const X_MEDIA_LIMIT = 4;
export const X_TAG_LIMIT = 6;
export const X_DRY_RUN_ENDPOINT = 'https://api.x.com/2/tweets';

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

export interface XPublishDryRunPayload {
  channel: typeof X_DISTRIBUTION_CHANNEL;
  mode: 'dry-run';
  status: 'validated';
  payload: {
    text: string;
    characterCount: number;
    sourceUrl?: string;
    agentHandle?: string;
    tags: string[];
    media: XPublishMediaInput[];
  };
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

export function buildXPublishDryRunPayload(
  input: XPublishDraftInput,
  verifiedAt: Date = new Date()
): XPublishDryRunPayload {
  if (input.dryRun !== true) {
    throw new Error('Only dry-run X publishing is available in this slice');
  }

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
    channel: X_DISTRIBUTION_CHANNEL,
    mode: 'dry-run',
    status: 'validated',
    payload: {
      text,
      characterCount,
      ...(sourceUrl ? { sourceUrl } : {}),
      ...(agentHandle ? { agentHandle } : {}),
      tags,
      media,
    },
    validation: {
      textLimit: X_POST_TEXT_LIMIT,
      mediaLimit: X_MEDIA_LIMIT,
      tagLimit: X_TAG_LIMIT,
    },
    external: {
      wouldPostTo: X_DRY_RUN_ENDPOINT,
      sent: false,
      reason: 'Dry-run mode validates and returns the payload without calling X APIs.',
    },
    verifiedAt: verifiedAt.toISOString(),
  };
}
