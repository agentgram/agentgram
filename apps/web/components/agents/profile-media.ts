import type { ChatSnippetMessage, Post, PostMedia } from '@agentgram/shared';

export interface ProfileGeneratedMediaItem {
  id: string;
  postId: string;
  url: string;
  title: string;
  alt: string;
  badgeLabel: 'Scene' | 'Selfie' | 'Generated';
  sourceLabel: string;
  personaLabel: string;
  summary: string;
  likes: number;
  commentCount: number;
  createdAt: string;
}

type MetadataCollection = {
  path: string[];
  fallbackBadge?: ProfileGeneratedMediaItem['badgeLabel'];
  requireGeneratedFlag: boolean;
};

type MediaCandidate = Partial<PostMedia> & {
  alt?: string;
  generated?: boolean;
  kind?: string;
  label?: string;
  persona?: unknown;
  personaLabel?: string;
  personaName?: string;
  prompt?: string;
  source?: string;
  title?: string;
};

const MEDIA_COLLECTIONS: readonly MetadataCollection[] = [
  { path: ['media'], requireGeneratedFlag: true },
  { path: ['generatedMedia'], requireGeneratedFlag: false },
  { path: ['generated_media'], requireGeneratedFlag: false },
  {
    path: ['sceneImages'],
    fallbackBadge: 'Scene',
    requireGeneratedFlag: false,
  },
  {
    path: ['scene_images'],
    fallbackBadge: 'Scene',
    requireGeneratedFlag: false,
  },
  {
    path: ['selfieImages'],
    fallbackBadge: 'Selfie',
    requireGeneratedFlag: false,
  },
  {
    path: ['selfie_images'],
    fallbackBadge: 'Selfie',
    requireGeneratedFlag: false,
  },
] as const;

function getMetadataValue(metadata: Record<string, unknown>, path: string[]) {
  let current: unknown = metadata;

  for (const segment of path) {
    if (!current || typeof current !== 'object' || !(segment in current)) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

function readString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function readObjectString(value: unknown, key: string) {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  return readString((value as Record<string, unknown>)[key]);
}

function getChatMessages(post: Post) {
  return (
    (post.metadata?.messages as ChatSnippetMessage[] | undefined) ?? []
  ).filter(
    (message): message is ChatSnippetMessage =>
      Boolean(message?.role?.trim()) && Boolean(message?.content?.trim())
  );
}

function summarizePost(post: Post) {
  const explicitSummary = [post.content, post.title].find((value) =>
    value?.trim()
  );

  if (explicitSummary) {
    return explicitSummary;
  }

  const chatMessages = getChatMessages(post)
    .slice(0, 2)
    .map((message) => `${message.role}: ${message.content}`);

  return chatMessages.join(' · ') || 'Generated from a public chat moment.';
}

function normalizeBadgeLabel(
  value: string | undefined,
  fallbackBadge?: ProfileGeneratedMediaItem['badgeLabel']
): ProfileGeneratedMediaItem['badgeLabel'] {
  const normalized = value?.trim().toLowerCase();

  if (normalized?.includes('selfie')) {
    return 'Selfie';
  }

  if (normalized?.includes('scene')) {
    return 'Scene';
  }

  return fallbackBadge ?? 'Generated';
}

function isGeneratedCandidate(
  candidate: MediaCandidate,
  requireGeneratedFlag: boolean,
  fallbackBadge?: ProfileGeneratedMediaItem['badgeLabel']
) {
  if (candidate.generated === true) {
    return true;
  }

  const source = candidate.source?.trim().toLowerCase();
  if (source === 'generated' || source === 'ai' || source === 'public_chat') {
    return true;
  }

  const kind = candidate.kind?.trim().toLowerCase();
  const label = candidate.label?.trim().toLowerCase();
  if (
    kind === 'scene' ||
    kind === 'selfie' ||
    label?.includes('scene') ||
    label?.includes('selfie')
  ) {
    return true;
  }

  return !requireGeneratedFlag && Boolean(fallbackBadge);
}

function getPersonaLabel(
  post: Post,
  metadata: Record<string, unknown>,
  candidate: MediaCandidate
) {
  const candidatePersona = candidate.persona;
  const metadataPersona =
    getMetadataValue(metadata, ['persona']) ||
    getMetadataValue(metadata, ['activePersona']) ||
    getMetadataValue(metadata, ['active_persona']);

  return (
    readString(candidate.personaLabel) ||
    readString(candidate.personaName) ||
    readObjectString(candidatePersona, 'name') ||
    readObjectString(candidatePersona, 'label') ||
    readString(getMetadataValue(metadata, ['personaLabel'])) ||
    readString(getMetadataValue(metadata, ['personaName'])) ||
    readString(getMetadataValue(metadata, ['persona_label'])) ||
    readString(getMetadataValue(metadata, ['persona_name'])) ||
    readObjectString(metadataPersona, 'name') ||
    readObjectString(metadataPersona, 'label') ||
    post.author?.activePersona?.name ||
    'Core persona'
  );
}

function extractCandidates(
  post: Post,
  metadata: Record<string, unknown>,
  collection: MetadataCollection
) {
  const rawEntries = getMetadataValue(metadata, collection.path);
  if (!Array.isArray(rawEntries)) {
    return [];
  }

  return rawEntries
    .map((entry) => entry as MediaCandidate)
    .filter((entry) => typeof entry?.url === 'string' && entry.url.length > 0)
    .filter((entry) =>
      isGeneratedCandidate(
        entry,
        collection.requireGeneratedFlag,
        collection.fallbackBadge
      )
    )
    .map((entry, index) => ({ entry, index }));
}

export function extractGeneratedProfileMedia(
  posts: Post[]
): ProfileGeneratedMediaItem[] {
  const seen = new Set<string>();

  const mediaItems = posts.flatMap((post) => {
    const metadata =
      (post.metadata as Record<string, unknown> | undefined) ?? {};
    const chatMessages = getChatMessages(post);
    const sourceLabel =
      post.postType === 'chat_snippet' && chatMessages.length > 0
        ? `${chatMessages.length} public chat turns`
        : 'Published image post';
    const fallbackSummary = summarizePost(post);

    return MEDIA_COLLECTIONS.flatMap((collection) =>
      extractCandidates(post, metadata, collection).flatMap(
        ({ entry, index }) => {
          const dedupeKey = `${post.id}:${entry.url}`;
          if (seen.has(dedupeKey)) {
            return [];
          }

          seen.add(dedupeKey);

          const badgeLabel = normalizeBadgeLabel(
            entry.label || entry.kind,
            collection.fallbackBadge
          );

          return [
            {
              id: `${post.id}-${index}-${badgeLabel.toLowerCase()}`,
              postId: post.id,
              url: entry.url as string,
              title: entry.title?.trim() || post.title,
              alt:
                entry.alt?.trim() ||
                `${post.title || 'Generated image'} — ${badgeLabel.toLowerCase()}`,
              badgeLabel,
              sourceLabel,
              personaLabel: getPersonaLabel(post, metadata, entry),
              summary: entry.prompt?.trim() || fallbackSummary,
              likes: post.likes,
              commentCount: post.commentCount,
              createdAt: post.createdAt,
            },
          ];
        }
      )
    );
  });

  return mediaItems.sort((left, right) => {
    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();

    if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
      return left.id.localeCompare(right.id);
    }

    if (rightTime !== leftTime) {
      return rightTime - leftTime;
    }

    return left.id.localeCompare(right.id);
  });
}

export function getProfilePostImageUrl(post: Post) {
  const mediaUrl = (
    (post.metadata?.media as PostMedia[] | undefined) ?? []
  ).find(
    (entry) => typeof entry?.url === 'string' && entry.url.length > 0
  )?.url;

  return mediaUrl || post.url;
}
