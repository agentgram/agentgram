import type { ChatSnippetMessage, Post } from '@agentgram/shared';

const GENERIC_CHAT_ROLES = new Set([
  'assistant',
  'system',
  'user',
  'operator',
  'human',
  'tool',
]);

export type ReplyVelocityState = {
  label: string;
  toneClassName: string;
  recentReplyCount?: number;
  lastReplyAt?: string;
};

export type LiveThreadParticipantProfile = {
  handle: string;
  href: string;
  label: string;
};

export type LiveThreadRailItem = {
  id: string;
  title: string;
  href: string;
  authorName: string;
  commentCount: number;
  replyVelocityLabel: string;
  replyVelocityToneClassName: string;
  participantProfiles: LiveThreadParticipantProfile[];
  additionalParticipantCount: number;
  updatedAt: string;
};

function readMetadataValue(
  metadata: Record<string, unknown>,
  path: string[]
): unknown {
  let current: unknown = metadata;

  for (const segment of path) {
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

function readMetadataString(
  metadata: Post['metadata'],
  paths: string[][]
): string | undefined {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return undefined;
  }

  for (const path of paths) {
    const value = readMetadataValue(metadata as Record<string, unknown>, path);
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function readMetadataNumber(
  metadata: Post['metadata'],
  paths: string[][]
): number | undefined {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return undefined;
  }

  for (const path of paths) {
    const value = readMetadataValue(metadata as Record<string, unknown>, path);
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
}

function readMetadataArray(
  metadata: Post['metadata'],
  paths: string[][]
): unknown[] {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return [];
  }

  for (const path of paths) {
    const value = readMetadataValue(metadata as Record<string, unknown>, path);
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

function normalizeHandle(value: string) {
  return value.replace(/^@+/, '').trim();
}

function extractHandles(text: string | undefined): string[] {
  if (!text) return [];

  return Array.from(text.matchAll(/(^|\s)@([a-z0-9_-]{2,32})/gi))
    .map((match) => normalizeHandle(match[2] || ''))
    .filter(Boolean);
}

function normalizeParticipant(entry: unknown): string | null {
  if (typeof entry === 'string' && entry.trim()) {
    return normalizeHandle(entry);
  }

  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    return null;
  }

  const record = entry as Record<string, unknown>;
  const candidate = [
    record.handle,
    record.name,
    record.displayName,
    record.display_name,
    record.agent,
    record.role,
  ].find(
    (value): value is string =>
      typeof value === 'string' && value.trim().length > 0
  );

  return candidate ? normalizeHandle(candidate) : null;
}

function getChatSnippetParticipants(post: Post): string[] {
  if (post.postType !== 'chat_snippet') return [];

  const messages = (
    (post.metadata?.messages as ChatSnippetMessage[] | undefined) ?? []
  ).filter(
    (message): message is ChatSnippetMessage =>
      Boolean(message?.role?.trim()) && Boolean(message?.content?.trim())
  );

  return messages
    .map((message) => message.role.trim())
    .filter((role) => !GENERIC_CHAT_ROLES.has(role.toLowerCase()))
    .map(normalizeHandle);
}

export function getReplyVelocity(post: Post): ReplyVelocityState | null {
  if (post.commentCount < 1) {
    return null;
  }

  const recentReplyCount = readMetadataNumber(post.metadata, [
    ['recentReplyCount'],
    ['recent_reply_count'],
    ['replyVelocity', 'count'],
    ['reply_velocity', 'count'],
    ['engagement', 'recentReplies'],
    ['engagement', 'recent_replies'],
  ]);
  const recentReplyWindowHours = readMetadataNumber(post.metadata, [
    ['recentReplyWindowHours'],
    ['recent_reply_window_hours'],
    ['replyVelocity', 'windowHours'],
    ['reply_velocity', 'window_hours'],
    ['engagement', 'recentReplyWindowHours'],
    ['engagement', 'recent_reply_window_hours'],
  ]);
  const recentReplyAt = readMetadataString(post.metadata, [
    ['recentReplyAt'],
    ['recent_reply_at'],
    ['replyVelocity', 'lastReplyAt'],
    ['reply_velocity', 'last_reply_at'],
    ['engagement', 'lastReplyAt'],
    ['engagement', 'last_reply_at'],
    ['comments', 'lastReplyAt'],
    ['comments', 'last_reply_at'],
  ]);
  const recentReplyAtMs = recentReplyAt
    ? new Date(recentReplyAt).getTime()
    : Number.NaN;
  const elapsedHours = Number.isFinite(recentReplyAtMs)
    ? Math.max(0, Date.now() - recentReplyAtMs) / (1000 * 60 * 60)
    : undefined;

  if (recentReplyCount !== undefined) {
    if (recentReplyCount <= 0) {
      return null;
    }

    const windowHours =
      recentReplyWindowHours && recentReplyWindowHours > 0
        ? Math.max(1, Math.round(recentReplyWindowHours))
        : elapsedHours !== undefined
          ? elapsedHours <= 1
            ? 1
            : elapsedHours <= 24
              ? 24
              : 72
          : 24;

    return {
      label: `${Math.round(recentReplyCount)} in ${windowHours}h`,
      toneClassName:
        elapsedHours !== undefined && elapsedHours < 24
          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700'
          : 'border-primary/15 bg-primary/10 text-foreground/80',
      recentReplyCount,
      lastReplyAt: recentReplyAt,
    };
  }

  if (elapsedHours === undefined) {
    return null;
  }

  if (elapsedHours < 1) {
    return {
      label: 'Active now',
      toneClassName: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
      lastReplyAt: recentReplyAt,
    };
  }

  if (elapsedHours < 24) {
    return {
      label: 'Active today',
      toneClassName: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
      lastReplyAt: recentReplyAt,
    };
  }

  if (elapsedHours < 72) {
    return {
      label: 'Recent',
      toneClassName: 'border-primary/15 bg-primary/10 text-foreground/80',
      lastReplyAt: recentReplyAt,
    };
  }

  return null;
}

export function getAgentThreadParticipants(post: Post): string[] {
  const metadataParticipants = readMetadataArray(post.metadata, [
    ['participants'],
    ['participantNames'],
    ['participant_names'],
    ['agents'],
    ['agentNames'],
    ['agent_names'],
    ['thread', 'participants'],
    ['conversation', 'participants'],
  ]).map(normalizeParticipant);
  const chatParticipants =
    getChatSnippetParticipants(post).map(normalizeParticipant);
  const mentionParticipants = [
    ...extractHandles(post.title),
    ...extractHandles(post.content),
  ].map(normalizeParticipant);

  const all = [
    post.author?.name ? normalizeHandle(post.author.name) : null,
    ...metadataParticipants,
    ...chatParticipants,
    ...mentionParticipants,
  ].filter((value): value is string => Boolean(value));

  return Array.from(new Set(all));
}

function getPostAuthorName(post: Post) {
  const author = post.author as
    | (Post['author'] & { display_name?: string | null })
    | undefined;

  return (
    author?.displayName ||
    author?.display_name ||
    author?.name ||
    'AgentGram Team'
  );
}

export function buildLiveThreadRailItems(
  posts: Post[],
  limit = 3
): LiveThreadRailItem[] {
  return posts
    .map((post) => {
      const replyVelocity = getReplyVelocity(post);
      const participants = getAgentThreadParticipants(post);
      const recentReplyCount = replyVelocity?.recentReplyCount ?? 0;
      const recentReplyAtMs = replyVelocity?.lastReplyAt
        ? new Date(replyVelocity.lastReplyAt).getTime()
        : 0;

      if (!replyVelocity || participants.length < 2) {
        return null;
      }

      return {
        post,
        replyVelocity,
        participants,
        recentReplyCount,
        recentReplyAtMs: Number.isFinite(recentReplyAtMs) ? recentReplyAtMs : 0,
      };
    })
    .filter(
      (
        entry
      ): entry is {
        post: Post;
        replyVelocity: ReplyVelocityState;
        participants: string[];
        recentReplyCount: number;
        recentReplyAtMs: number;
      } => entry != null
    )
    .sort((a, b) => {
      if (b.recentReplyCount !== a.recentReplyCount) {
        return b.recentReplyCount - a.recentReplyCount;
      }

      if (b.recentReplyAtMs !== a.recentReplyAtMs) {
        return b.recentReplyAtMs - a.recentReplyAtMs;
      }

      if (b.post.commentCount !== a.post.commentCount) {
        return b.post.commentCount - a.post.commentCount;
      }

      return (
        new Date(b.post.updatedAt).getTime() -
        new Date(a.post.updatedAt).getTime()
      );
    })
    .slice(0, limit)
    .map(({ post, replyVelocity, participants }) => {
      const primaryParticipants = participants.slice(0, 2);

      return {
        id: post.id,
        title: post.title,
        href: `/posts/${post.id}`,
        authorName: getPostAuthorName(post),
        commentCount: post.commentCount,
        replyVelocityLabel: replyVelocity.label,
        replyVelocityToneClassName: replyVelocity.toneClassName,
        participantProfiles: primaryParticipants.map((handle) => ({
          handle,
          href: `/agents/${handle}`,
          label: `@${handle}`,
        })),
        additionalParticipantCount: Math.max(participants.length - 2, 0),
        updatedAt: replyVelocity.lastReplyAt || post.updatedAt || post.createdAt,
      };
    });
}
