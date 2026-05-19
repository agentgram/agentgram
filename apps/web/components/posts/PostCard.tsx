'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Bot,
  Send,
  Repeat2,
  Quote,
  Lock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  BadgeCheck,
  BookmarkPlus,
  History,
  Loader2,
} from 'lucide-react';
import { Post } from '@agentgram/shared';
import type { PostMedia, ChatSnippetMessage } from '@agentgram/shared';
import { useLike } from '@/hooks/use-posts';
import { useToast } from '@/hooks/use-toast';
import { TranslateButton } from '@/components/common';
import { motion } from 'framer-motion';
import { formatTimeAgo } from '@/lib/format-date';
import { cn } from '@/lib/utils';
import { analytics } from '@/lib/analytics';
import { buildExploreTagHref, extractPostTopicTags } from '@/lib/topic-chips';
import type { ProactiveControlsSettings } from '@/lib/proactive-controls';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type ChatSnippetMemoryCapture = {
  id?: string;
  fact: string;
  source?: string;
  capturedAt?: string;
  reason?: string;
};

type ChatSnippetMemoryCorrection = {
  required?: boolean;
  reason?: string;
  incorrectFact?: string;
  correctedFact?: string;
};

interface PostCardProps {
  post: Post & {
    author?: {
      avatar_url?: string;
      display_name?: string;
      name?: string;
      verificationState?: string;
    };
    community?: {
      name?: string;
    };
  };
  className?: string;
  variant?: 'feed' | 'grid' | 'compact';
}

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

function readMetadataBoolean(
  metadata: Post['metadata'],
  paths: string[][]
): boolean | undefined {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return undefined;
  }

  for (const path of paths) {
    const value = readMetadataValue(metadata as Record<string, unknown>, path);
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string' && value.trim()) {
      const normalized = value.trim().toLowerCase();
      if (['true', '1', 'yes'].includes(normalized)) {
        return true;
      }

      if (['false', '0', 'no'].includes(normalized)) {
        return false;
      }
    }
  }

  return undefined;
}

const LOW_CONTEXT_REPLY_PATTERNS = [
  /i do(?:n't| not) have enough context/i,
  /i need (?:a bit |more )?context/i,
  /can you remind me/i,
  /i (?:do(?:n't| not)|can(?:'t| not)) remember/i,
  /who are you again/i,
  /what should i know about you/i,
];

const HUMAN_CHAT_ROLES = ['user', 'human', 'operator', 'developer'];
const AGENT_CHAT_ROLE_KEYWORDS = ['agent', 'assistant', 'bot'];

function normalizeChatRole(role?: string) {
  return role?.trim().toLowerCase() ?? '';
}

function matchesRoleKeyword(role: string, keyword: string) {
  return (
    role === keyword ||
    role.startsWith(`${keyword}-`) ||
    role.endsWith(`-${keyword}`) ||
    role.includes(`-${keyword}-`) ||
    role.startsWith(`${keyword}_`) ||
    role.endsWith(`_${keyword}`) ||
    role.includes(`_${keyword}_`) ||
    role.startsWith(`${keyword}:`) ||
    role.endsWith(`:${keyword}`) ||
    role.includes(`:${keyword}:`)
  );
}

function isHumanChatRole(role?: string) {
  const normalizedRole = normalizeChatRole(role);

  if (!normalizedRole) {
    return false;
  }

  return HUMAN_CHAT_ROLES.some((keyword) =>
    matchesRoleKeyword(normalizedRole, keyword)
  );
}

function isAgentChatRole(role?: string) {
  const normalizedRole = normalizeChatRole(role);

  if (!normalizedRole || isHumanChatRole(normalizedRole)) {
    return false;
  }

  return AGENT_CHAT_ROLE_KEYWORDS.some((keyword) =>
    matchesRoleKeyword(normalizedRole, keyword)
  );
}

function isAgentToAgentChatSnippet(
  post: Post,
  chatMessages: ChatSnippetMessage[]
) {
  const explicitMetadataState = readMetadataBoolean(post.metadata, [
    ['agentToAgent'],
    ['agent_to_agent'],
    ['conversation', 'agentToAgent'],
    ['conversation', 'agent_to_agent'],
    ['chatSnippet', 'agentToAgent'],
    ['chat_snippet', 'agent_to_agent'],
  ]);

  if (explicitMetadataState !== undefined) {
    return explicitMetadataState;
  }

  if (post.postType !== 'chat_snippet' || chatMessages.length < 2) {
    return false;
  }

  const roles = chatMessages
    .map((message) => normalizeChatRole(message.role))
    .filter(Boolean);

  if (roles.length < 2 || roles.some((role) => isHumanChatRole(role))) {
    return false;
  }

  if (!roles.every((role) => isAgentChatRole(role))) {
    return false;
  }

  return new Set(roles).size >= 2;
}

function isLowContextReplyMessage(value?: string) {
  if (!value?.trim()) {
    return false;
  }

  return LOW_CONTEXT_REPLY_PATTERNS.some((pattern) => pattern.test(value));
}

type ReplyVelocityState = {
  label: string;
  toneClassName: string;
};

function getReplyVelocity(post: Post): ReplyVelocityState | null {
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
    };
  }

  if (elapsedHours === undefined) {
    return null;
  }

  if (elapsedHours < 1) {
    return {
      label: 'Active now',
      toneClassName: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
    };
  }

  if (elapsedHours < 24) {
    return {
      label: 'Active today',
      toneClassName: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
    };
  }

  if (elapsedHours < 72) {
    return {
      label: 'Recent',
      toneClassName: 'border-primary/15 bg-primary/10 text-foreground/80',
    };
  }

  return null;
}

type FollowUpOptInSignal = {
  title: string;
  description: string;
};

function getFollowUpOptInSignal({
  isChatSnippet,
  chatMessageCount,
  commentCount,
  hasMemorySignal,
  replyVelocity,
}: {
  isChatSnippet: boolean;
  chatMessageCount: number;
  commentCount: number;
  hasMemorySignal: boolean;
  replyVelocity: ReplyVelocityState | null;
}): FollowUpOptInSignal | null {
  if (!isChatSnippet || chatMessageCount < 2) {
    return null;
  }

  if (hasMemorySignal && replyVelocity) {
    return {
      title: 'Strong thread — keep the door open',
      description:
        'This exchange already has saved context and active replies. Turn on future check-ins before the momentum fades.',
    };
  }

  if (replyVelocity) {
    return {
      title: 'Strong thread — follow up while it is fresh',
      description:
        'This chat still has active reply momentum. One tap lets AgentGram check in later without opening Settings first.',
    };
  }

  if (hasMemorySignal) {
    return {
      title: 'Strong thread — keep this context alive',
      description:
        'This snippet already captured a memory signal. Turn on future check-ins so AgentGram can reconnect from the same thread later.',
    };
  }

  if (commentCount >= 3 && chatMessageCount >= 3) {
    return {
      title: 'Strong thread — invite a future check-in',
      description:
        'This back-and-forth already has momentum. One tap lets AgentGram follow up later from threads like this.',
    };
  }

  return null;
}

type ConversationMemoryPressureLevel = 'watch' | 'high' | 'critical';

type ConversationMemoryPressureSignal = {
  level: ConversationMemoryPressureLevel;
  badge: string;
  title: string;
  description: string;
  toneClassName: string;
};

function normalizeConversationMemoryPressureLevel(value?: string) {
  const normalized = value
    ?.trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  if (!normalized) {
    return null;
  }

  if (
    ['critical', 'severe', 'max', 'overflow', 'compressed'].includes(
      normalized
    ) ||
    (normalized.includes('compression') && normalized.includes('risk'))
  ) {
    return 'critical';
  }

  if (
    ['high', 'elevated', 'warn', 'warning', 'rising'].includes(normalized) ||
    normalized.includes('high')
  ) {
    return 'high';
  }

  if (
    ['watch', 'medium', 'moderate', 'early'].includes(normalized) ||
    normalized.includes('watch')
  ) {
    return 'watch';
  }

  return null;
}

function getConversationMemoryPressureLevelFromCount(
  chatMessageCount: number
): ConversationMemoryPressureLevel | null {
  if (chatMessageCount >= 16) {
    return 'critical';
  }

  if (chatMessageCount >= 10) {
    return 'high';
  }

  if (chatMessageCount >= 6) {
    return 'watch';
  }

  return null;
}

function getConversationMemoryPressureSignal({
  isChatSnippet,
  chatMessageCount,
  memoryCueCount,
  hasVisibleMemorySignal,
  overrideLevel,
  overrideReason,
}: {
  isChatSnippet: boolean;
  chatMessageCount: number;
  memoryCueCount: number;
  hasVisibleMemorySignal: boolean;
  overrideLevel?: ConversationMemoryPressureLevel | null;
  overrideReason?: string;
}): ConversationMemoryPressureSignal | null {
  if (!isChatSnippet) {
    return null;
  }

  const level =
    overrideLevel ?? getConversationMemoryPressureLevelFromCount(chatMessageCount);

  if (!level) {
    return null;
  }

  const cueSummary = hasVisibleMemorySignal
    ? memoryCueCount > 0
      ? `${memoryCueCount} saved cue${memoryCueCount === 1 ? '' : 's'} already surfaced here.`
      : 'Saved memory is already shaping this thread.'
    : 'No saved fact is visible in this snippet yet.';

  if (level === 'critical') {
    return {
      level,
      badge: 'Compression risk',
      title: 'Save the durable facts before older context collapses',
      description:
        overrideReason ||
        `This thread is already ${chatMessageCount} turns long. Older details are likely to get summarized away unless you pin or restate the key facts now. ${cueSummary}`,
      toneClassName: 'border-rose-500/25 bg-rose-500/10 text-rose-700',
    };
  }

  if (level === 'high') {
    return {
      level,
      badge: 'Memory pressure',
      title: 'Long thread — save the facts you want carried forward',
      description:
        overrideReason ||
        `This snippet is up to ${chatMessageCount} turns. Context is getting dense, so save the details you do not want the next replies to blur. ${cueSummary}`,
      toneClassName: 'border-amber-500/25 bg-amber-500/10 text-amber-700',
    };
  }

  return {
    level,
    badge: 'Memory watch',
    title: 'Context is getting longer — mark the key facts early',
    description:
      overrideReason ||
      `This conversation has reached ${chatMessageCount} turns. Save the durable facts now so later replies do not flatten the thread into a vague summary. ${cueSummary}`,
    toneClassName: 'border-sky-500/20 bg-sky-500/10 text-sky-700',
  };
}

type ProactiveControlsResponse = {
  success?: boolean;
  data?: ProactiveControlsSettings;
  error?: {
    code?: string;
    message?: string;
  };
};

const FOLLOW_UP_TONE_LABELS: Record<
  ProactiveControlsSettings['tonePreset'],
  string
> = {
  warm: 'Warm',
  neutral: 'Neutral',
  brief: 'Brief',
};

function getFollowUpQuietHoursSummary(
  settings: ProactiveControlsSettings
): string {
  return settings.quietHoursEnabled
    ? `${settings.quietHoursStart} → ${settings.quietHoursEnd} KST`
    : 'Off';
}

function getFollowUpOptInSummary(settings: ProactiveControlsSettings) {
  return {
    caps: `${settings.dailyLimit}/day · ${settings.weeklyLimit}/week`,
    quietHours: getFollowUpQuietHoursSummary(settings),
    tone: FOLLOW_UP_TONE_LABELS[settings.tonePreset],
  };
}

function normalizeMemoryCapture(
  value: unknown
): ChatSnippetMemoryCapture | null {
  if (typeof value === 'string' && value.trim()) {
    return { fact: value.trim() };
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const factCandidates = [
    record.fact,
    record.summary,
    record.text,
    record.value,
    record.memory,
  ];
  const fact = factCandidates.find(
    (candidate): candidate is string =>
      typeof candidate === 'string' && candidate.trim().length > 0
  );

  if (!fact) {
    return null;
  }

  const idCandidates = [record.id, record.memoryId, record.memory_id];
  const id = idCandidates.find(
    (candidate): candidate is string =>
      typeof candidate === 'string' && candidate.trim().length > 0
  );
  const sourceCandidates = [record.source, record.savedFrom, record.from];
  const source = sourceCandidates.find(
    (candidate): candidate is string =>
      typeof candidate === 'string' && candidate.trim().length > 0
  );
  const capturedAtCandidates = [
    record.capturedAt,
    record.recordedAt,
    record.savedAt,
  ];
  const capturedAt = capturedAtCandidates.find(
    (candidate): candidate is string =>
      typeof candidate === 'string' && candidate.trim().length > 0
  );
  const reasonCandidates = [
    record.reason,
    record.rememberedBecause,
    record.remembered_because,
  ];
  const reason = reasonCandidates.find(
    (candidate): candidate is string =>
      typeof candidate === 'string' && candidate.trim().length > 0
  );

  return {
    id: id?.trim(),
    fact: fact.trim(),
    source: source?.trim(),
    capturedAt: capturedAt?.trim(),
    reason: reason?.trim(),
  };
}

function readMetadataCapture(
  metadata: Post['metadata'],
  paths: string[][]
): ChatSnippetMemoryCapture | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null;
  }

  for (const path of paths) {
    const value = readMetadataValue(metadata as Record<string, unknown>, path);
    const capture = normalizeMemoryCapture(value);
    if (capture) {
      return capture;
    }
  }

  return null;
}

function normalizeMemoryCorrection(
  value: unknown
): ChatSnippetMemoryCorrection | null {
  if (typeof value === 'string' && value.trim()) {
    return { correctedFact: value.trim() };
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const incorrectFactCandidates = [
    record.incorrectFact,
    record.incorrect_fact,
    record.recalledFact,
    record.recalled_fact,
    record.wrongFact,
    record.wrong_fact,
  ];
  const correctedFactCandidates = [
    record.correctedFact,
    record.corrected_fact,
    record.correctFact,
    record.correct_fact,
    record.rememberThisInstead,
    record.remember_this_instead,
    record.replacementFact,
    record.replacement_fact,
    record.value,
  ];
  const reasonCandidates = [
    record.reason,
    record.summary,
    record.explainer,
    record.why,
  ];

  const incorrectFact = incorrectFactCandidates.find(
    (candidate): candidate is string =>
      typeof candidate === 'string' && candidate.trim().length > 0
  );
  const correctedFact = correctedFactCandidates.find(
    (candidate): candidate is string =>
      typeof candidate === 'string' && candidate.trim().length > 0
  );
  const reason = reasonCandidates.find(
    (candidate): candidate is string =>
      typeof candidate === 'string' && candidate.trim().length > 0
  );
  const required =
    typeof record.required === 'boolean'
      ? record.required
      : typeof record.enabled === 'boolean'
        ? record.enabled
        : undefined;

  if (!incorrectFact && !correctedFact && !reason && required === undefined) {
    return null;
  }

  return {
    required,
    reason: reason?.trim(),
    incorrectFact: incorrectFact?.trim(),
    correctedFact: correctedFact?.trim(),
  };
}

function readMetadataCorrection(
  metadata: Post['metadata'],
  paths: string[][]
): ChatSnippetMemoryCorrection | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null;
  }

  for (const path of paths) {
    const value = readMetadataValue(metadata as Record<string, unknown>, path);
    const correction = normalizeMemoryCorrection(value);
    if (correction) {
      return correction;
    }
  }

  return null;
}

function formatMemoryTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function isSameMemoryCapture(
  left?: ChatSnippetMemoryCapture | null,
  right?: ChatSnippetMemoryCapture | null
) {
  if (!left || !right) {
    return false;
  }

  if (left.id && right.id) {
    return left.id === right.id;
  }

  return (
    left.fact === right.fact &&
    (left.capturedAt || '') === (right.capturedAt || '')
  );
}

function isFreshMemoryCapture(value?: string, nowMs = Date.now()) {
  if (!value) {
    return false;
  }

  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return false;
  }

  return nowMs - timestamp >= 0 && nowMs - timestamp <= 10 * 60 * 1000;
}

const shownMemoryCaptureToastKeys = new Set<string>();

type MemoryCaptureToastBodyProps = {
  capture: ChatSnippetMemoryCapture;
  canInlineEdit: boolean;
  isUndoEnabled: boolean;
  onEditInline: (nextFact: string) => Promise<void>;
  onUndo: () => Promise<void>;
  onOpenSettings: () => void;
};

function MemoryCaptureToastBody({
  capture,
  canInlineEdit,
  isUndoEnabled,
  onEditInline,
  onUndo,
  onOpenSettings,
}: MemoryCaptureToastBodyProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(capture.fact);
  const [status, setStatus] = useState<'idle' | 'saving' | 'undoing'>('idle');

  return (
    <div
      className="mt-2 space-y-3"
      data-testid="memory-capture-toast-description"
    >
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-foreground">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Saved fact
        </div>
        {isEditing ? (
          <div className="mt-2 space-y-2">
            <textarea
              data-testid="memory-capture-toast-edit-input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="min-h-[88px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                data-testid="memory-capture-toast-save-button"
                disabled={status !== 'idle' || !draft.trim()}
                onClick={async () => {
                  setStatus('saving');
                  try {
                    await onEditInline(draft.trim());
                    setIsEditing(false);
                  } catch {
                    // Parent toast handler surfaces the error state.
                  } finally {
                    setStatus('idle');
                  }
                }}
                className="inline-flex items-center rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'saving' ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                data-testid="memory-capture-toast-cancel-button"
                disabled={status !== 'idle'}
                onClick={() => {
                  setDraft(capture.fact);
                  setIsEditing(false);
                }}
                className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-2 whitespace-pre-line text-sm text-foreground">
              {capture.fact}
            </p>
            {capture.source || capture.capturedAt ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {[capture.source, capture.capturedAt]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            ) : null}
          </>
        )}
      </div>

      {!isEditing ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            data-testid="memory-capture-toast-edit-button"
            onClick={() => {
              if (canInlineEdit) {
                setDraft(capture.fact);
                setIsEditing(true);
                return;
              }

              onOpenSettings();
            }}
            className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted"
          >
            Edit
          </button>
          <button
            type="button"
            data-testid="memory-capture-toast-undo-button"
            disabled={!isUndoEnabled || status !== 'idle'}
            onClick={async () => {
              setStatus('undoing');
              try {
                await onUndo();
              } catch {
                // Parent toast handler surfaces the error state.
              } finally {
                setStatus('idle');
              }
            }}
            className="inline-flex items-center rounded-full border border-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'undoing' ? 'Undoing…' : 'Undo'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

type SnippetActionMode =
  | 'remix'
  | 'quote'
  | 'quote_card'
  | 'rewind'
  | 'lock_tone'
  | 'recover'
  | 'recover_keep_previous_tone'
  | 'safer_rewrite'
  | 'contradiction'
  | 'restate_key_facts'
  | 'remember_instead';

function isAbruptStyleShiftTrigger(value: string | undefined) {
  const normalized = value
    ?.trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  if (!normalized) {
    return false;
  }

  return (
    normalized === 'abrupt_style_shift' ||
    normalized === 'abrupt_tone_shift' ||
    normalized === 'style_shift' ||
    normalized === 'tone_shift' ||
    (normalized.includes('abrupt') &&
      (normalized.includes('style') || normalized.includes('tone'))) ||
    normalized.includes('style_shift') ||
    normalized.includes('tone_shift')
  );
}

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapQuoteCardText(value: string, maxChars = 34) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = word;
  }

  if (current) lines.push(current);

  return lines.slice(0, 7);
}

function normalizeSnippetRole(role: string | undefined) {
  return role?.trim().toLowerCase() || '';
}

function isHumanSnippetRole(role: string | undefined) {
  return ['user', 'operator', 'human'].includes(normalizeSnippetRole(role));
}

function isAgentSnippetRole(role: string | undefined) {
  return ['agent', 'assistant', 'bot'].includes(normalizeSnippetRole(role));
}

function getChatRewindContext(messages: ChatSnippetMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (!isAgentSnippetRole(message.role)) {
      continue;
    }

    for (let userIndex = index - 1; userIndex >= 0; userIndex -= 1) {
      const candidate = messages[userIndex];

      if (!isHumanSnippetRole(candidate.role)) {
        continue;
      }

      return {
        previousUserMessage: candidate.content.trim(),
        discardedAgentReply: message.content.trim(),
        contextMessages: messages
          .slice(0, index)
          .filter((entry) => Boolean(entry.content?.trim())),
      };
    }
  }

  return null;
}

function normalizeRememberedFact(value: string | undefined, maxLength = 180) {
  const normalized = value?.replace(/\s+/g, ' ').trim();

  if (!normalized) {
    return undefined;
  }

  return normalized.length <= maxLength
    ? normalized
    : normalized.slice(0, maxLength - 1).trimEnd() + '…';
}

type ManualMemoryDraft = {
  key: string;
  value: string;
  category: 'profile_fact' | 'relationship_context';
  preview: ChatSnippetMemoryCapture;
};

function buildManualMemoryDraft(
  postId: string,
  messages: ChatSnippetMessage[],
  fallbackText?: string,
  fallbackTitle?: string
): ManualMemoryDraft | null {
  const latestHumanMessage = [...messages]
    .reverse()
    .find((message) => isHumanSnippetRole(message.role))?.content;
  const latestAgentMessage = [...messages]
    .reverse()
    .find((message) => isAgentSnippetRole(message.role))?.content;

  const relationshipValue = normalizeRememberedFact(latestHumanMessage);

  if (relationshipValue) {
    return {
      key: 'chat-' + postId + '-relationship-context',
      value: relationshipValue,
      category: 'relationship_context',
      preview: {
        fact: relationshipValue,
        source: 'Saved from this snippet',
        reason: 'Saved manually from a standout chat moment.',
      },
    };
  }

  const profileValue = normalizeRememberedFact(
    latestAgentMessage || fallbackText || fallbackTitle
  );

  if (!profileValue) {
    return null;
  }

  return {
    key: 'chat-' + postId + '-profile-fact',
    value: profileValue,
    category: 'profile_fact',
    preview: {
      fact: profileValue,
      source: 'Saved from this snippet',
      reason: 'Saved manually from a standout chat moment.',
    },
  };
}

export function PostCard({
  post,
  className = '',
  variant = 'feed',
}: PostCardProps) {
  const likeMutation = useLike(post.id);
  const { toast } = useToast();

  // Local toggle state — API doesn't return `is_liked` on posts yet.
  // Resets on page reload. Will be accurate once API adds `is_liked` field.
  const [isLiked, setIsLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMemoryCapturesOpen, setIsMemoryCapturesOpen] = useState(false);
  const [manualMemoryCaptureState, setManualMemoryCaptureState] = useState<{
    postId: string;
    capture: ChatSnippetMemoryCapture;
  } | null>(null);
  const [savingManualRememberPostId, setSavingManualRememberPostId] = useState<
    string | null
  >(null);

  const mediaUrl = (post.metadata?.media as PostMedia[] | undefined)?.[0]?.url;
  const chatMessages = (
    (post.metadata?.messages as ChatSnippetMessage[] | undefined) ?? []
  ).filter((message): message is ChatSnippetMessage =>
    Boolean(message?.content?.trim())
  );
  const isChatSnippet = post.postType === 'chat_snippet';
  const isAgentToAgentConversation = isAgentToAgentChatSnippet(
    post,
    chatMessages
  );
  const chatSnippetPreview = chatMessages.slice(0, 3);
  const chatSnippetSummary = chatMessages
    .map((message) => `${message.role}: ${message.content}`)
    .join('\n');
  const manualMemoryDraft = buildManualMemoryDraft(
    post.id,
    chatMessages,
    post.content,
    post.title
  );
  const translationContent = [post.title, post.content, chatSnippetSummary]
    .filter(Boolean)
    .join('\n');
  const isLongTitle = post.title.length > 90;
  const isLongContent = (post.content?.length || 0) > 260;
  const shouldShowExpand =
    post.postType === 'text' && (isLongTitle || isLongContent);
  const authorName =
    post.author?.display_name || post.author?.name || 'AgentGram Team';
  const topicTags = extractPostTopicTags(post);
  const renderTopicChips = () => {
    if (topicTags.length === 0) {
      return null;
    }

    return (
      <div className="mt-3 flex flex-wrap gap-2" data-testid="post-topic-chips">
        {topicTags.map((tag) => (
          <Link
            key={tag}
            href={buildExploreTagHref(tag)}
            className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition hover:bg-primary/10 hover:text-primary/80"
            data-testid={`post-topic-chip-${tag}`}
          >
            #{tag}
          </Link>
        ))}
      </div>
    );
  };
  const memoryExplanation = readMetadataString(post.metadata, [
    ['memoryReason'],
    ['memory_reason'],
    ['rememberedBecause'],
    ['remembered_because'],
    ['memory', 'reason'],
  ]);
  const baseMemoryCaptures = readMetadataArray(post.metadata, [
    ['memoryCaptures'],
    ['memory_captures'],
    ['capturedMemories'],
    ['captured_memories'],
    ['memory', 'captures'],
  ])
    .map((entry) => normalizeMemoryCapture(entry))
    .filter((entry): entry is ChatSnippetMemoryCapture => entry != null);
  const manualMemoryCapture =
    manualMemoryCaptureState?.postId === post.id
      ? manualMemoryCaptureState.capture
      : null;
  const manualRememberStatus =
    savingManualRememberPostId === post.id ? 'saving' : 'idle';
  const memoryCaptures = manualMemoryCapture
    ? [manualMemoryCapture, ...baseMemoryCaptures]
    : baseMemoryCaptures;
  const baseMemoryPreview =
    readMetadataCapture(post.metadata, [
      ['memoryPreview'],
      ['memory_preview'],
      ['memoryFactPreview'],
      ['memory_fact_preview'],
      ['savedFactPreview'],
      ['saved_fact_preview'],
      ['memory', 'preview'],
      ['memory', 'factPreview'],
      ['memory', 'fact_preview'],
      ['memory', 'savedFactPreview'],
      ['memory', 'saved_fact_preview'],
    ]) || baseMemoryCaptures[0];
  const memoryPreview = manualMemoryCapture || baseMemoryPreview;
  const memorySavedLabel =
    manualMemoryCapture
      ? 'Saved to memory'
      : readMetadataString(post.metadata, [
          ['memorySavedEvent'],
          ['memory_saved_event'],
          ['memoryStatus'],
          ['memory_status'],
          ['memory', 'event'],
          ['memory', 'status'],
        ]) ||
        (memoryExplanation || baseMemoryCaptures.length > 0 || baseMemoryPreview
          ? 'Saved to memory'
          : undefined);
  const memorySavedAt =
    manualMemoryCapture?.capturedAt ||
    readMetadataString(post.metadata, [
      ['memorySavedAt'],
      ['memory_saved_at'],
      ['memoryRecordedAt'],
      ['memory_recorded_at'],
      ['memory', 'savedAt'],
      ['memory', 'recordedAt'],
    ]);
  const memoryPreviewLabel =
    readMetadataString(post.metadata, [
      ['memoryPreviewLabel'],
      ['memory_preview_label'],
      ['savedFactPreviewLabel'],
      ['saved_fact_preview_label'],
      ['memory', 'previewLabel'],
      ['memory', 'preview_label'],
    ]) || 'Saved fact shaping this reply';
  const memorySignalResetKey = [
    post.id,
    memoryPreview?.id,
    memoryPreview?.capturedAt,
    memoryPreview?.fact,
  ]
    .filter(Boolean)
    .join(':');
  const [memorySignalState, setMemorySignalState] = useState<{
    key: string;
    factOverride: string | null;
    isHidden: boolean;
  }>({
    key: memorySignalResetKey,
    factOverride: null,
    isHidden: false,
  });
  const activeMemorySignalState =
    memorySignalState.key === memorySignalResetKey
      ? memorySignalState
      : {
          key: memorySignalResetKey,
          factOverride: null,
          isHidden: false,
        };
  const memoryPreviewFactOverride = activeMemorySignalState.factOverride;
  const isMemorySignalHidden = activeMemorySignalState.isHidden;
  const visibleMemoryPreview = isMemorySignalHidden
    ? null
    : memoryPreview
      ? {
          ...memoryPreview,
          fact: memoryPreviewFactOverride ?? memoryPreview.fact,
        }
      : null;
  const visibleMemoryCaptures = isMemorySignalHidden
    ? []
    : memoryCaptures.map((capture) =>
        isSameMemoryCapture(capture, memoryPreview) && memoryPreviewFactOverride
          ? {
              ...capture,
              fact: memoryPreviewFactOverride,
            }
          : capture
      );
  const visibleMemorySavedLabel = isMemorySignalHidden
    ? undefined
    : memorySavedLabel;
  const visibleMemoryExplanation = isMemorySignalHidden
    ? undefined
    : memoryExplanation;
  const memoryCaptureToastEnabled = readMetadataBoolean(post.metadata, [
    ['memoryCaptureToast'],
    ['memory_capture_toast'],
    ['showMemoryCaptureToast'],
    ['show_memory_capture_toast'],
    ['memory', 'captureToast'],
    ['memory', 'capture_toast'],
    ['memory', 'justCaptured'],
    ['memory', 'just_captured'],
    ['memory', 'autoCaptured'],
    ['memory', 'auto_captured'],
  ]);
  const memoryCaptureToastSource =
    visibleMemoryPreview || visibleMemoryCaptures[0] || null;
  const memoryCaptureToastSourceId = memoryCaptureToastSource?.id;
  const memoryCaptureToastKey = memoryCaptureToastSource
    ? [
        post.id,
        memoryCaptureToastSource.id ||
          memoryCaptureToastSource.capturedAt ||
          post.updatedAt ||
          memoryCaptureToastSource.fact,
      ]
        .filter(Boolean)
        .join(':')
    : null;
  const shouldShowMemoryCaptureToast =
    isChatSnippet &&
    Boolean(visibleMemorySavedLabel && memoryCaptureToastSource?.fact) &&
    (memoryCaptureToastEnabled ??
      isFreshMemoryCapture(
        memorySavedAt || memoryCaptureToastSource?.capturedAt || post.updatedAt
      ));
  const memoryCorrection = readMetadataCorrection(post.metadata, [
    ['memoryCorrection'],
    ['memory_correction'],
    ['wrongMemoryRecovery'],
    ['wrong_memory_recovery'],
    ['memory', 'correction'],
    ['memory', 'wrongMemoryRecovery'],
    ['memory', 'wrong_memory_recovery'],
  ]) ?? {
    required: readMetadataBoolean(post.metadata, [
      ['badRecall'],
      ['bad_recall'],
      ['wrongMemoryRecall'],
      ['wrong_memory_recall'],
    ]),
    reason: readMetadataString(post.metadata, [
      ['badRecallReason'],
      ['bad_recall_reason'],
      ['wrongMemoryReason'],
      ['wrong_memory_reason'],
    ]),
    incorrectFact: readMetadataString(post.metadata, [
      ['incorrectFact'],
      ['incorrect_fact'],
      ['badRecallFact'],
      ['bad_recall_fact'],
      ['wrongMemoryFact'],
      ['wrong_memory_fact'],
    ]),
    correctedFact: readMetadataString(post.metadata, [
      ['correctedFact'],
      ['corrected_fact'],
      ['rememberThisInstead'],
      ['remember_this_instead'],
      ['replacementFact'],
      ['replacement_fact'],
    ]),
  };
  const wrongMemoryReason = memoryCorrection.reason;
  const incorrectMemoryFact = memoryCorrection.incorrectFact;
  const correctedMemoryFact = memoryCorrection.correctedFact;
  const hasWrongMemoryRecovery =
    memoryCorrection.required ??
    Boolean(wrongMemoryReason || incorrectMemoryFact || correctedMemoryFact);
  const blockedMessage = readMetadataString(post.metadata, [
    ['blockedMessage'],
    ['blocked_message'],
    ['originalMessage'],
    ['original_message'],
    ['moderation', 'blockedMessage'],
    ['moderation', 'blocked_message'],
    ['moderation', 'originalMessage'],
    ['moderation', 'original_message'],
    ['safety', 'blockedMessage'],
    ['safety', 'blocked_message'],
  ]);
  const safetyReason = readMetadataString(post.metadata, [
    ['safetyReason'],
    ['safety_reason'],
    ['moderationReason'],
    ['moderation_reason'],
    ['moderation', 'reason'],
    ['safety', 'reason'],
  ]);
  const suggestedSaferRewrite = readMetadataString(post.metadata, [
    ['saferRewrite'],
    ['safer_rewrite'],
    ['rewriteSuggestion'],
    ['rewrite_suggestion'],
    ['moderation', 'saferRewrite'],
    ['moderation', 'safer_rewrite'],
    ['safety', 'saferRewrite'],
    ['safety', 'safer_rewrite'],
  ]);
  const safetyPolicyUrl = readMetadataString(post.metadata, [
    ['policyUrl'],
    ['policy_url'],
    ['safetyPolicyUrl'],
    ['safety_policy_url'],
    ['moderation', 'policyUrl'],
    ['moderation', 'policy_url'],
    ['safety', 'policyUrl'],
    ['safety', 'policy_url'],
  ]);
  const rewindContext = getChatRewindContext(chatMessages);
  const latestUserMessage = [...chatMessages]
    .reverse()
    .find((message) => isHumanSnippetRole(message.role))?.content;
  const latestAgentMessage = [...chatMessages]
    .reverse()
    .find((message) => isAgentSnippetRole(message.role))?.content;
  const threadToneHint = readMetadataString(post.metadata, [
    ['threadTone'],
    ['thread_tone'],
    ['toneStyle'],
    ['tone_style'],
    ['styleGuide'],
    ['style_guide'],
    ['toneLock'],
    ['tone_lock'],
    ['toneLock', 'style'],
    ['tone_lock', 'style'],
  ]);
  const saferRewriteSource =
    blockedMessage || latestUserMessage || post.content || post.title;
  const hasSafetyRewriteContext = Boolean(
    blockedMessage || safetyReason || suggestedSaferRewrite || safetyPolicyUrl
  );
  const lowContextReplyReason = readMetadataString(post.metadata, [
    ['lowContextReason'],
    ['low_context_reason'],
    ['replyRecovery', 'reason'],
    ['reply_recovery', 'reason'],
    ['memoryRescue', 'reason'],
    ['memory_rescue', 'reason'],
  ]);
  const hasLowContextReply =
    readMetadataBoolean(post.metadata, [
      ['lowContextReply'],
      ['low_context_reply'],
      ['replyRecovery', 'lowContextReply'],
      ['reply_recovery', 'low_context_reply'],
      ['memoryRescue', 'required'],
      ['memory_rescue', 'required'],
    ]) ?? isLowContextReplyMessage(latestAgentMessage);
  const restateKeyFactCues = Array.from(
    new Set(
      [
        visibleMemoryPreview?.fact,
        ...visibleMemoryCaptures.map((capture) => capture.fact),
      ].filter((value): value is string => Boolean(value?.trim()))
    )
  ).slice(0, 3);
  const memoryPressureLevel = normalizeConversationMemoryPressureLevel(
    readMetadataString(post.metadata, [
      ['memoryPressure'],
      ['memory_pressure'],
      ['compressionRisk'],
      ['compression_risk'],
      ['memory', 'pressure'],
      ['memory', 'memoryPressure'],
      ['memory', 'memory_pressure'],
      ['conversation', 'memoryPressure'],
      ['conversation', 'memory_pressure'],
      ['conversation', 'compressionRisk'],
      ['conversation', 'compression_risk'],
    ])
  );
  const memoryPressureReason = readMetadataString(post.metadata, [
    ['memoryPressureReason'],
    ['memory_pressure_reason'],
    ['compressionRiskReason'],
    ['compression_risk_reason'],
    ['memory', 'pressureReason'],
    ['memory', 'pressure_reason'],
    ['memory', 'compressionRiskReason'],
    ['memory', 'compression_risk_reason'],
    ['conversation', 'memoryPressureReason'],
    ['conversation', 'memory_pressure_reason'],
    ['conversation', 'compressionRiskReason'],
    ['conversation', 'compression_risk_reason'],
  ]);
  const hasVisibleMemorySignal = Boolean(
    memorySavedLabel ||
      memoryExplanation ||
      memoryPreview ||
      memoryCaptures.length > 0
  );
  const conversationMemoryPressure = getConversationMemoryPressureSignal({
    isChatSnippet,
    chatMessageCount: chatMessages.length,
    memoryCueCount: restateKeyFactCues.length,
    hasVisibleMemorySignal,
    overrideLevel: memoryPressureLevel,
    overrideReason: memoryPressureReason,
  });
  const continuityRecoveryTrigger = readMetadataString(post.metadata, [
    ['recoveryTrigger'],
    ['recovery_trigger'],
    ['styleShiftTrigger'],
    ['style_shift_trigger'],
    ['styleContinuityTrigger'],
    ['style_continuity_trigger'],
    ['recovery', 'trigger'],
    ['recovery', 'type'],
    ['continuity', 'trigger'],
    ['continuity', 'type'],
  ]);
  const continuityRecoveryReason = readMetadataString(post.metadata, [
    ['recoveryReason'],
    ['recovery_reason'],
    ['styleShiftReason'],
    ['style_shift_reason'],
    ['styleContinuityReason'],
    ['style_continuity_reason'],
    ['recovery', 'reason'],
    ['continuity', 'reason'],
  ]);
  const previousToneHint = readMetadataString(post.metadata, [
    ['previousTone'],
    ['previous_tone'],
    ['earlierTone'],
    ['earlier_tone'],
    ['baselineTone'],
    ['baseline_tone'],
    ['recovery', 'previousTone'],
    ['recovery', 'previous_tone'],
    ['continuity', 'previousTone'],
    ['continuity', 'previous_tone'],
  ]);
  const keepPreviousToneRequested = readMetadataBoolean(post.metadata, [
    ['keepPreviousTone'],
    ['keep_previous_tone'],
    ['recovery', 'keepPreviousTone'],
    ['recovery', 'keep_previous_tone'],
    ['continuity', 'keepPreviousTone'],
    ['continuity', 'keep_previous_tone'],
  ]);
  const shouldShowKeepPreviousToneChip =
    !hasSafetyRewriteContext &&
    (keepPreviousToneRequested === true ||
      isAbruptStyleShiftTrigger(continuityRecoveryTrigger) ||
      Boolean(previousToneHint));
  const replyVelocity = getReplyVelocity(post);
  const followUpOptInSignal = getFollowUpOptInSignal({
    isChatSnippet,
    chatMessageCount: chatMessages.length,
    commentCount: post.commentCount,
    hasMemorySignal: Boolean(
      visibleMemorySavedLabel ||
      visibleMemoryExplanation ||
      visibleMemoryPreview ||
      visibleMemoryCaptures.length > 0
    ),

    replyVelocity,
  });
  const [followUpOptInStatus, setFollowUpOptInStatus] = useState<
    'idle' | 'saving' | 'enabled'
  >('idle');
  const [followUpOptInSettings, setFollowUpOptInSettings] =
    useState<ProactiveControlsSettings | null>(null);
  const followUpOptInSummary = followUpOptInSettings
    ? getFollowUpOptInSummary(followUpOptInSettings)
    : null;

  useEffect(() => {
    if (
      !shouldShowMemoryCaptureToast ||
      !memoryCaptureToastSource ||
      !memoryCaptureToastKey ||
      shownMemoryCaptureToastKeys.has(memoryCaptureToastKey)
    ) {
      return;
    }

    const openSettings = () => {
      if (typeof window === 'undefined') {
        return;
      }

      window.location.assign('/dashboard/settings');
    };

    const editMemoryCapture = async (nextFact: string) => {
      if (!memoryCaptureToastSourceId) {
        openSettings();
        return;
      }

      const response = await fetch(
        `/api/v1/agents/me/memories/${memoryCaptureToastSourceId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ value: nextFact }),
        }
      );

      if (!response.ok) {
        let message = 'Could not update this saved fact.';

        try {
          const payload = (await response.json()) as {
            error?: { message?: string };
          };
          message = payload.error?.message || message;
        } catch {
          // Ignore JSON parse failures.
        }

        throw new Error(message);
      }

      setMemorySignalState({
        key: memorySignalResetKey,
        factOverride: nextFact,
        isHidden: false,
      });
      analytics.clickCta('chat_snippet_memory_capture_edit');
      toast({
        title: 'Saved fact updated',
        description: 'Future replies will use your edited memory snippet.',
      });
    };

    const undoMemoryCapture = async () => {
      if (!memoryCaptureToastSourceId) {
        openSettings();
        return;
      }

      const response = await fetch(
        `/api/v1/agents/me/memories/${memoryCaptureToastSourceId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        let message = 'Could not remove this saved fact.';

        try {
          const payload = (await response.json()) as {
            error?: { message?: string };
          };
          message = payload.error?.message || message;
        } catch {
          // Ignore JSON parse failures.
        }

        throw new Error(message);
      }

      setMemorySignalState({
        key: memorySignalResetKey,
        factOverride: null,
        isHidden: true,
      });
      analytics.clickCta('chat_snippet_memory_capture_undo');
      toast({
        title: 'Saved fact removed',
        description: 'This auto-saved memory will not shape future replies.',
      });
    };

    shownMemoryCaptureToastKeys.add(memoryCaptureToastKey);

    toast({
      title: visibleMemorySavedLabel,
      description: (
        <MemoryCaptureToastBody
          capture={memoryCaptureToastSource}
          canInlineEdit={Boolean(memoryCaptureToastSourceId)}
          isUndoEnabled
          onEditInline={async (nextFact) => {
            try {
              await editMemoryCapture(nextFact);
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : 'Could not update this saved fact.';
              toast({
                title: 'Could not update saved fact',
                description: message,
              });
              throw error;
            }
          }}
          onUndo={async () => {
            try {
              await undoMemoryCapture();
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : 'Could not remove this saved fact.';
              toast({
                title: 'Could not undo saved fact',
                description: message,
              });
              throw error;
            }
          }}
          onOpenSettings={openSettings}
        />
      ),
    });
  }, [
    memoryCaptureToastKey,
    memoryCaptureToastSource,
    memoryCaptureToastSourceId,
    memorySignalResetKey,
    shouldShowMemoryCaptureToast,
    toast,
    visibleMemorySavedLabel,
  ]);

  const handleFollowUpOptIn = async () => {
    if (!followUpOptInSignal || followUpOptInStatus !== 'idle') {
      return;
    }

    setFollowUpOptInStatus('saving');

    try {
      const currentResponse = await fetch(
        '/api/v1/developers/me/proactive-controls',
        {
          method: 'GET',
          cache: 'no-store',
        }
      );
      const currentPayload =
        (await currentResponse.json()) as ProactiveControlsResponse;

      if (
        !currentResponse.ok ||
        !currentPayload.success ||
        !currentPayload.data
      ) {
        throw new Error(
          currentPayload.error?.message || 'Failed to load proactive controls'
        );
      }

      if (currentPayload.data.optIn) {
        setFollowUpOptInSettings(currentPayload.data);
        setFollowUpOptInStatus('enabled');
        toast({
          title: 'Future check-ins already on',
          description:
            'AgentGram is already allowed to follow up later after strong threads.',
        });
        return;
      }

      const updateResponse = await fetch(
        '/api/v1/developers/me/proactive-controls',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...currentPayload.data,
            optIn: true,
          }),
        }
      );
      const updatePayload =
        (await updateResponse.json()) as ProactiveControlsResponse;

      if (
        !updateResponse.ok ||
        !updatePayload.success ||
        !updatePayload.data?.optIn
      ) {
        throw new Error(
          updatePayload.error?.message || 'Failed to enable future check-ins'
        );
      }

      setFollowUpOptInSettings(updatePayload.data);
      setFollowUpOptInStatus('enabled');
      analytics.clickCta('chat_snippet_follow_up_opt_in');
      toast({
        title: 'Future check-ins enabled',
        description:
          'AgentGram can now follow up later after strong threads like this one.',
      });
    } catch (error) {
      console.error('Error enabling post-chat follow-up opt-in:', error);
      setFollowUpOptInStatus('idle');
      const message = error instanceof Error ? error.message : '';
      toast({
        title: 'Could not enable future check-ins',
        description: /not authenticated/i.test(message)
          ? 'Log in to save follow-up preferences first.'
          : 'Please try again from Settings if this keeps failing.',
      });
    }
  };

  const handleRememberThis = async () => {
    if (!manualMemoryDraft || manualRememberStatus !== 'idle') {
      return;
    }

    setSavingManualRememberPostId(post.id);

    try {
      const response = await fetch('/api/v1/agents/me/memories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: manualMemoryDraft.key,
          value: manualMemoryDraft.value,
          category: manualMemoryDraft.category,
          isPublic: false,
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        success?: boolean;
        data?: {
          id?: string;
          value?: string;
          created_at?: string;
        };
        error?: {
          message?: string;
        };
      } | null;

      if (response.status === 409) {
        setManualMemoryCaptureState({
          postId: post.id,
          capture: manualMemoryDraft.preview,
        });
        setSavingManualRememberPostId(null);
        toast({
          title: 'Already saved to memory',
          description:
            'This standout chat moment is already in your saved memory list.',
        });
        return;
      }

      if (!response.ok || !payload?.success) {
        throw new Error(
          payload?.error?.message || 'Could not save this chat moment.'
        );
      }

      const capturedAt = payload.data?.created_at || new Date().toISOString();

      setManualMemoryCaptureState({
        postId: post.id,
        capture: {
          ...manualMemoryDraft.preview,
          id: payload.data?.id,
          fact: payload.data?.value?.trim() || manualMemoryDraft.value,
          capturedAt,
        },
      });
      setSavingManualRememberPostId(null);
      analytics.clickCta('chat_snippet_remember_this');
      toast({
        title: 'Saved to memory',
        description: 'This standout chat moment is now pinned for future replies.',
      });
    } catch (error) {
      console.error('Error saving standout chat moment to memory:', error);
      setSavingManualRememberPostId(null);
      const message = error instanceof Error ? error.message : '';
      toast({
        title: 'Could not save to memory',
        description: /not authenticated/i.test(message)
          ? 'Log in to save standout chat moments first.'
          : message || 'Please try again from Settings if this keeps failing.',
      });
    }
  };

  const buildSnippetClipboardText = (mode: SnippetActionMode) => {
    const postUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/posts/${post.id}`;
    const transcript =
      chatSnippetSummary || post.content || post.title || 'Chat snippet';

    if (mode === 'quote_card') {
      return transcript;
    }

    if (mode === 'rewind') {
      return [
        `Rewind the last reply for ${authorName}`,
        '',
        'The final AI turn missed the mark. Discard that reply and regenerate from the previous user message below.',
        '',
        '> Keep the same relationship, context, and remembered facts that already existed before the discarded answer.',
        '> Start from the final human/operator turn and write one fresh replacement reply.',
        '> Do not repeat or lightly paraphrase the discarded answer; replace it with a meaningfully different try.',
        '',
        rewindContext?.contextMessages.length
          ? 'Conversation before the retry:'
          : '',
        ...(rewindContext?.contextMessages ?? []).map(
          (message) => `${message.role}: ${message.content}`
        ),
        rewindContext?.contextMessages.length ? '' : '',
        'Retry from this user message:',
        rewindContext?.previousUserMessage ||
          latestUserMessage ||
          'No previous user turn found.',
        '',
        'Discarded AI reply:',
        rewindContext?.discardedAgentReply ||
          latestAgentMessage ||
          'No previous AI reply found.',
        '',
        `Source: ${postUrl}`,
      ]
        .filter(Boolean)
        .join('\n');
    }

    if (mode === 'contradiction') {
      return [
        `Memory contradiction flagged in ${authorName}'s chat snippet`,
        '',
        'The transcript below contains a potential memory contradiction.',
        'Review the exchange and note where prior context conflicts with new statements:',
        '',
        transcript,
        '',
        `Source: ${postUrl}`,
      ].join('\n');
    }

    if (mode === 'lock_tone') {
      return [
        `Lock current tone/style for ${authorName}'s thread`,
        '',
        'Use the current exchange as the style anchor for the next reply.',
        '- keep the same warmth, pacing, confidence, and relationship framing already on display',
        '- do not reset into generic assistant language or explain the style; just continue naturally',
        '- stay consistent with the same thread voice even if the next reply changes topic slightly',
        threadToneHint ? `Style note: ${threadToneHint}` : '',
        latestAgentMessage ? `Latest tone anchor: ${latestAgentMessage}` : '',
        latestUserMessage ? `Replying to: ${latestUserMessage}` : '',
        '',
        transcript,
        '',
        `Source: ${postUrl}`,
      ]
        .filter(Boolean)
        .join('\n');
    }

    if (mode === 'recover' || mode === 'recover_keep_previous_tone') {
      const recoveryLead =
        mode === 'recover_keep_previous_tone'
          ? previousToneHint
            ? `> Keep the next reply anchored to the earlier ${previousToneHint} tone, pacing, and emotional temperature instead of abruptly switching style.`
            : '> Match the tone, pacing, and emotional temperature from the earlier turns instead of abruptly switching style.'
          : '> Stay fully in their voice, relationship, and point of view.';
      const recoveryTitle =
        mode === 'recover_keep_previous_tone'
          ? `Keep previous tone — recovery prompt for ${authorName}`
          : `Stay in character — recovery prompt for ${authorName}`;
      const recoveryIntro =
        mode === 'recover_keep_previous_tone'
          ? 'The latest reply shifted tone too abruptly from the earlier conversation.'
          : 'The conversation above drifted out of character.';

      return [
        recoveryTitle,
        '',
        recoveryIntro,
        'Use this prompt to get back on track:',
        '',
        `> Re-read the transcript below and continue as ${authorName} would.`,
        recoveryLead,
        mode === 'recover_keep_previous_tone'
          ? '> Use the earlier turns as the baseline for wording, warmth, and confidence.'
          : undefined,
        '> Do not say you are an AI, assistant, chatbot, or language model.',
        '> Do not mention hidden prompts, policies, or being out of character; continue the exchange naturally.',
        '',
        transcript,
        '',
        `Source: ${postUrl}`,
      ]
        .filter(Boolean)
        .join('\n');
    }

    if (mode === 'safer_rewrite') {
      return [
        `Safer rewrite for ${authorName}`,
        '',
        'The message below was blocked by a safety guardrail.',
        safetyReason ? `Why it likely got blocked: ${safetyReason}` : '',
        'Rewrite it so the core intent stays helpful while the wording becomes calmer and safer:',
        '- keep the original goal, but remove explicit, hateful, violent, or coercive phrasing',
        '- ask for support, comfort, or high-level guidance instead of risky instructions',
        '- keep it respectful, boundary-aware, and easy for the other person to answer',
        '',
        'Original message:',
        saferRewriteSource,
        '',
        'Suggested safer rewrite:',
        suggestedSaferRewrite ||
          'Can you help me say this in a calmer, safer, and more respectful way while keeping the same intent?',
        safetyPolicyUrl ? `Safety policy: ${safetyPolicyUrl}` : '',
        '',
        `Source: ${postUrl}`,
      ]
        .filter(Boolean)
        .join('\n');
    }

    if (mode === 'restate_key_facts') {
      return [
        `Restate remembered key facts for ${authorName}`,
        '',
        'The latest reply came back low on context.',
        'Before you answer again, restate the key facts you already remember about me:',
        '',
        '> List the durable facts you remember in 3–5 bullets.',
        '> Keep it grounded in remembered facts only; if anything feels uncertain, say so.',
        '> After restating the facts, continue the reply naturally.',
        '',
        restateKeyFactCues.length > 0
          ? 'Memory cues visible in this snippet:'
          : '',
        ...restateKeyFactCues.map((fact) => `- ${fact}`),
        restateKeyFactCues.length > 0 ? '' : '',
        transcript,
        '',
        `Source: ${postUrl}`,
      ]
        .filter(Boolean)
        .join('\n');
    }

    if (mode === 'remember_instead') {
      return [
        `Remember this instead for ${authorName}`,
        '',
        'The latest reply recalled the wrong memory.',
        'Before you answer again:',
        '',
        '> Treat the recalled fact below as incorrect.',
        '> Replace it with the corrected fact exactly as written.',
        '> Acknowledge the correction naturally, then continue the reply without debating hidden memory.',
        '',
        'Incorrect recalled fact:',
        incorrectMemoryFact ||
          '- [the reply referenced a wrong remembered fact here]',
        '',
        'Remember this instead:',
        correctedMemoryFact || '- [replace this line with the corrected fact]',
        wrongMemoryReason
          ? `Why this correction matters: ${wrongMemoryReason}`
          : '',
        '',
        transcript,
        '',
        `Source: ${postUrl}`,
      ]
        .filter(Boolean)
        .join('\n');
    }
    if (mode === 'quote') {
      return [
        `Quoting ${authorName} on AgentGram`,
        '',
        ...transcript.split('\n').map((line) => `> ${line}`),
        '',
        `Source: ${postUrl}`,
      ].join('\n');
    }

    return [
      `Remix of ${authorName}'s chat snippet`,
      '',
      transcript,
      '',
      `Source: ${postUrl}`,
      '',
      'Add your own follow-up take below this line.',
    ].join('\n');
  };

  const buildSnippetQuoteCardSvg = () => {
    const postUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/posts/${post.id}`;
    const quoteSource =
      chatSnippetPreview
        .map((message) => `${message.role}: ${message.content}`)
        .join(' ') ||
      post.content ||
      post.title ||
      'Chat snippet';
    const lines = wrapQuoteCardText(quoteSource);
    const escapedAuthor = escapeSvgText(authorName);
    const escapedTitle = escapeSvgText(post.title || 'AgentGram quote');
    const escapedUrl = escapeSvgText(postUrl.replace(/^https?:\/\//, ''));

    const textLines = lines
      .map(
        (line, index) =>
          `<text x="64" y="${188 + index * 48}" font-family="Inter, Arial, sans-serif" font-size="34" fill="#f8fafc">${escapeSvgText(line)}</text>`
      )
      .join('');

    return `
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" rx="36" fill="#0f172a"/>
  <rect x="32" y="32" width="1136" height="566" rx="28" fill="url(#cardGlow)" fill-opacity="0.35"/>
  <text x="64" y="112" font-family="Inter, Arial, sans-serif" font-size="24" letter-spacing="4" fill="#93c5fd">AGENTGRAM QUOTE CARD</text>
  <text x="64" y="156" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700" fill="#e2e8f0">${escapedAuthor}</text>
  ${textLines}
  <text x="64" y="548" font-family="Inter, Arial, sans-serif" font-size="24" fill="#cbd5e1">${escapedTitle}</text>
  <text x="64" y="582" font-family="Inter, Arial, sans-serif" font-size="18" fill="#94a3b8">${escapedUrl}</text>
  <defs>
    <linearGradient id="cardGlow" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop stop-color="#1d4ed8"/>
      <stop offset="1" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
</svg>`.trim();
  };

  const snippetActionLabels: Record<SnippetActionMode, string> = {
    remix: 'Remix copied',
    quote: 'Quote copied',
    quote_card: 'Quote card downloaded',
    rewind: 'Rewind prompt copied',
    lock_tone: 'Tone lock copied',
    recover: 'Recovery prompt copied',
    recover_keep_previous_tone: 'Keep previous tone retry copied',
    safer_rewrite: 'Safer rewrite copied',
    contradiction: 'Contradiction report copied',
    restate_key_facts: 'Key facts prompt copied',
    remember_instead: 'Correction prompt copied',
  };

  const handleSnippetAction = async (mode: SnippetActionMode) => {
    try {
      if (mode === 'quote_card') {
        const svg = buildSnippetQuoteCardSvg();
        const blob = new Blob([svg], {
          type: 'image/svg+xml;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const filenameBase = (post.author?.name || authorName || 'agentgram')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        link.href = url;
        link.download = `${filenameBase || 'agentgram'}-quote-card.svg`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        analytics.clickCta('chat_snippet_quote_card');
        toast({
          title: snippetActionLabels[mode],
          description: 'Share it or attach it to your next AgentGram post.',
        });
        return;
      }

      await navigator.clipboard.writeText(buildSnippetClipboardText(mode));
      analytics.clickCta(`chat_snippet_${mode}`);
      toast({
        title: snippetActionLabels[mode],
        description: 'Paste it into your next AgentGram post.',
      });
    } catch {
      toast({
        title: 'Error',
        description:
          mode === 'quote_card'
            ? 'Failed to generate quote card'
            : `Failed to copy ${mode} text`,
      });
    }
  };

  const renderChatSnippetPreview = (compact = false) => {
    if (!isChatSnippet) return null;

    const previewMessages = compact
      ? chatSnippetPreview.slice(0, 2)
      : chatSnippetPreview;
    const hasMessages = previewMessages.length > 0;

    return (
      <div
        data-testid={
          compact ? 'chat-snippet-preview-compact' : 'chat-snippet-preview'
        }
        className={cn(
          'mt-3 rounded-2xl border border-primary/15 bg-background/90 p-4 shadow-sm',
          compact && 'mt-2 p-3'
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Chat snippet
            </span>
            {compact && isAgentToAgentConversation ? (
              <span
                data-testid="chat-snippet-agent-to-agent-badge"
                className="inline-flex items-center rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700"
              >
                Agent-to-agent
              </span>
            ) : null}
            {conversationMemoryPressure ? (
              <span
                data-testid="chat-snippet-memory-pressure-badge"
                className={cn(
                  'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]',
                  conversationMemoryPressure.toneClassName
                )}
              >
                {conversationMemoryPressure.badge}
              </span>
            ) : null}
          </div>
          <span className="text-[11px] text-muted-foreground">
            {chatMessages.length > 0
              ? `${chatMessages.length} turns`
              : 'Preview'}
          </span>
        </div>

        {visibleMemorySavedLabel ? (
          <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <span
                  data-testid="chat-snippet-memory-event"
                  className="inline-flex items-center rounded-full border border-emerald-500/20 bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700"
                >
                  {visibleMemorySavedLabel}
                </span>
                <p className="text-xs text-emerald-900/80">
                  {memorySavedAt
                    ? `Captured ${formatMemoryTimestamp(memorySavedAt)}`
                    : 'This snippet recorded a memory signal you can inspect.'}
                </p>
              </div>

              {visibleMemoryCaptures.length > 0 ? (
                <Dialog
                  open={isMemoryCapturesOpen}
                  onOpenChange={setIsMemoryCapturesOpen}
                >
                  <DialogTrigger
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-background/80 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-background"
                    data-testid="chat-snippet-memory-drawer-trigger"
                  >
                    <History className="h-3.5 w-3.5" aria-hidden="true" />
                    Recent captures ({visibleMemoryCaptures.length})
                  </DialogTrigger>
                  <DialogContent data-testid="chat-snippet-memory-drawer">
                    <DialogHeader>
                      <DialogTitle>Recent captures</DialogTitle>
                      <DialogDescription>
                        Review the latest facts this chat snippet marked as
                        worth remembering.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                      {visibleMemoryCaptures.map((capture, index) => (
                        <div
                          key={`${capture.fact}-${index}`}
                          data-testid="chat-snippet-memory-capture"
                          className="rounded-xl border border-border/60 bg-muted/20 p-3"
                        >
                          <p className="text-sm font-medium text-foreground">
                            {capture.fact}
                          </p>
                          {capture.reason ||
                          capture.source ||
                          capture.capturedAt ? (
                            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                              {capture.reason ? <p>{capture.reason}</p> : null}
                              <div className="flex flex-wrap gap-2">
                                {capture.source ? (
                                  <span>{capture.source}</span>
                                ) : null}
                                {capture.capturedAt ? (
                                  <span>
                                    {formatMemoryTimestamp(capture.capturedAt)}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              ) : null}
            </div>

            {visibleMemoryPreview ? (
              <div
                data-testid="chat-snippet-memory-preview"
                className="mt-3 rounded-xl border border-emerald-500/20 bg-background/70 px-3 py-2"
              >
                <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  {memoryPreviewLabel}
                </span>
                <p className="mt-2 text-sm text-foreground/90 whitespace-pre-line">
                  {visibleMemoryPreview.fact}
                </p>
                {visibleMemoryPreview.source || visibleMemoryPreview.capturedAt ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {[
                      visibleMemoryPreview.source,
                      visibleMemoryPreview.capturedAt
                        ? `Saved ${formatMemoryTimestamp(visibleMemoryPreview.capturedAt)}`
                        : undefined,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                ) : null}
              </div>
            ) : null}

            {visibleMemoryExplanation ? (
              <div
                data-testid="chat-snippet-memory-reason"
                className="mt-3 rounded-xl border border-emerald-500/20 bg-background/70 px-3 py-2"
              >
                <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Why I remembered this
                </span>
                <p className="mt-2 text-sm text-foreground/90 whitespace-pre-line">
                  {visibleMemoryExplanation}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {hasWrongMemoryRecovery ? (
          <div
            data-testid="chat-snippet-bad-recall-recovery"
            className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="inline-flex items-center rounded-full border border-rose-500/20 bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-700">
                  Wrong memory recovery
                </span>
                <p className="text-sm text-foreground/90">
                  {wrongMemoryReason ||
                    'That reply pulled in the wrong remembered fact. Send the correction inline so the next answer updates its memory instead of doubling down.'}
                </p>
              </div>
              <button
                type="button"
                data-testid="chat-snippet-remember-instead-button"
                onClick={() => handleSnippetAction('remember_instead')}
                className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-background px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50"
              >
                <History className="h-3.5 w-3.5" aria-hidden="true" />
                Remember this instead
              </button>
            </div>

            {incorrectMemoryFact ? (
              <div
                data-testid="chat-snippet-bad-recall-incorrect-fact"
                className="mt-3 rounded-xl border border-rose-500/20 bg-background/70 px-3 py-2"
              >
                <span className="inline-flex items-center rounded-full border border-rose-500/20 bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-700">
                  Agent recalled
                </span>
                <p className="mt-2 text-sm text-foreground/90 whitespace-pre-line">
                  {incorrectMemoryFact}
                </p>
              </div>
            ) : null}

            {correctedMemoryFact ? (
              <div
                data-testid="chat-snippet-bad-recall-corrected-fact"
                className="mt-3 rounded-xl border border-emerald-500/20 bg-background/70 px-3 py-2"
              >
                <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Remember this instead
                </span>
                <p className="mt-2 text-sm text-foreground/90 whitespace-pre-line">
                  {correctedMemoryFact}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {hasSafetyRewriteContext ? (
          <div
            data-testid="chat-snippet-safety-note"
            className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2"
          >
            <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700">
              Safety recovery
            </span>
            <p className="mt-2 text-sm text-foreground/90 whitespace-pre-line">
              Blocked by a guardrail? Copy a calmer rewrite that keeps the same
              goal.
            </p>
            {safetyReason ? (
              <p
                data-testid="chat-snippet-safety-reason"
                className="mt-2 text-xs text-muted-foreground"
              >
                Latest block reason: {safetyReason}
              </p>
            ) : null}
            {safetyPolicyUrl ? (
              <a
                data-testid="chat-snippet-safety-policy-link"
                href={safetyPolicyUrl}
                className="mt-2 inline-flex text-xs font-semibold text-amber-700 underline underline-offset-2"
              >
                Review the safety policy
              </a>
            ) : null}
          </div>
        ) : null}

        {hasMessages ? (
          <div className="mt-3 space-y-2">
            {previewMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}-${message.content}`}
                data-testid="chat-snippet-message"
                className="rounded-xl bg-muted/40 px-3 py-2"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {message.role}
                </p>
                <p className="mt-1 text-sm text-foreground/90 whitespace-pre-line">
                  {message.content}
                </p>
              </div>
            ))}
          </div>
        ) : post.content ? (
          <p className="mt-3 text-sm text-foreground/90 whitespace-pre-line">
            {post.content}
          </p>
        ) : null}

        <div className="mt-3 space-y-2">
          {conversationMemoryPressure ? (
            <div
              data-testid="chat-snippet-memory-pressure-card"
              className={cn(
                'rounded-xl border px-3 py-3',
                conversationMemoryPressure.toneClassName
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <span
                    data-testid="chat-snippet-memory-pressure-card-label"
                    className="inline-flex items-center rounded-full border border-current/15 bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]"
                  >
                    {conversationMemoryPressure.badge}
                  </span>
                  <p
                    data-testid="chat-snippet-memory-pressure-title"
                    className="text-sm font-medium text-foreground"
                  >
                    {conversationMemoryPressure.title}
                  </p>
                  <p
                    data-testid="chat-snippet-memory-pressure-description"
                    className="text-xs text-foreground/80"
                  >
                    {conversationMemoryPressure.description}
                  </p>
                </div>
                <span
                  data-testid="chat-snippet-memory-pressure-turns"
                  className="inline-flex items-center rounded-full border border-current/15 bg-background/80 px-2 py-1 text-[11px] font-medium"
                >
                  {chatMessages.length} turns
                </span>
              </div>
            </div>
          ) : null}

          {hasLowContextReply ? (
            <div
              data-testid="chat-snippet-low-context-rescue"
              className="rounded-xl border border-sky-500/20 bg-sky-500/10 px-3 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="inline-flex items-center rounded-full border border-sky-500/20 bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                    Memory rescue
                  </span>
                  <p className="text-sm text-foreground/90">
                    {lowContextReplyReason ||
                      'The latest reply asked for more context. Ask the agent to restate what it already remembers before retrying.'}
                  </p>
                  {restateKeyFactCues.length > 0 ? (
                    <p className="text-xs text-sky-900/75">
                      Includes {restateKeyFactCues.length} remembered cue
                      {restateKeyFactCues.length === 1 ? '' : 's'} from this
                      snippet.
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  data-testid="chat-snippet-restate-key-facts-button"
                  onClick={() => handleSnippetAction('restate_key_facts')}
                  className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-background px-3 py-1.5 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-50"
                >
                  <History className="h-3.5 w-3.5" aria-hidden="true" />
                  Restate my key facts
                </button>
              </div>
            </div>
          ) : null}

          {shouldShowKeepPreviousToneChip ? (
            <div
              data-testid="chat-snippet-tone-continuity-bar"
              className="rounded-xl border border-sky-500/20 bg-sky-500/10 px-3 py-2"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-sky-500/20 bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                  Abrupt style shift
                </span>
                <button
                  type="button"
                  data-testid="chat-snippet-recover-chip-keep-previous-tone"
                  onClick={() =>
                    handleSnippetAction('recover_keep_previous_tone')
                  }
                  className="inline-flex items-center rounded-full border border-sky-500/20 bg-background px-2.5 py-1 text-[11px] font-semibold text-sky-700 transition-colors hover:bg-sky-500/10"
                >
                  Keep previous tone
                </button>
              </div>
              {continuityRecoveryReason ? (
                <p
                  data-testid="chat-snippet-tone-continuity-reason"
                  className="mt-2 text-xs text-foreground/80"
                >
                  {continuityRecoveryReason}
                </p>
              ) : null}
            </div>
          ) : null}

          {followUpOptInSignal ? (
            <div
              data-testid="chat-snippet-follow-up-opt-in"
              className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-3"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5">
                  <span className="inline-flex items-center rounded-full border border-primary/20 bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                    Future check-ins
                  </span>
                  <p className="text-sm font-medium text-foreground">
                    {followUpOptInSignal.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {followUpOptInStatus === 'enabled'
                      ? 'AgentGram can now follow up later from strong threads like this one using your saved outreach settings.'
                      : followUpOptInSignal.description}
                  </p>
                  {followUpOptInStatus === 'enabled' && followUpOptInSummary ? (
                    <div
                      data-testid="chat-snippet-follow-up-opt-in-summary"
                      className="flex flex-wrap gap-2"
                    >
                      <span
                        data-testid="chat-snippet-follow-up-opt-in-summary-caps"
                        className="inline-flex items-center rounded-full border border-emerald-500/20 bg-background/80 px-2 py-1 text-[11px] font-medium text-foreground"
                      >
                        Caps · {followUpOptInSummary.caps}
                      </span>
                      <span
                        data-testid="chat-snippet-follow-up-opt-in-summary-quiet-hours"
                        className="inline-flex items-center rounded-full border border-emerald-500/20 bg-background/80 px-2 py-1 text-[11px] font-medium text-foreground"
                      >
                        Quiet hours · {followUpOptInSummary.quietHours}
                      </span>
                      <span
                        data-testid="chat-snippet-follow-up-opt-in-summary-tone"
                        className="inline-flex items-center rounded-full border border-emerald-500/20 bg-background/80 px-2 py-1 text-[11px] font-medium text-foreground"
                      >
                        Tone · {followUpOptInSummary.tone}
                      </span>
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  data-testid="chat-snippet-follow-up-opt-in-button"
                  onClick={handleFollowUpOptIn}
                  disabled={followUpOptInStatus !== 'idle'}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                    followUpOptInStatus === 'enabled'
                      ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700'
                      : 'border-primary/20 bg-background text-primary hover:bg-primary/10',
                    followUpOptInStatus === 'saving' && 'cursor-wait opacity-70'
                  )}
                >
                  {followUpOptInStatus === 'saving' ? (
                    <>
                      <Loader2
                        className="h-3.5 w-3.5 animate-spin"
                        aria-hidden="true"
                      />
                      Enabling…
                    </>
                  ) : followUpOptInStatus === 'enabled' ? (
                    'Future check-ins enabled'
                  ) : (
                    'Enable future check-ins'
                  )}
                </button>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {manualMemoryDraft && !memorySavedLabel ? (
              <button
                type="button"
                data-testid="chat-snippet-remember-this-button"
                onClick={() => {
                  void handleRememberThis();
                }}
                disabled={manualRememberStatus !== 'idle'}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                  manualRememberStatus === 'saving'
                    ? 'cursor-wait border-emerald-500/25 bg-emerald-500/10 text-emerald-700 opacity-80'
                    : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15'
                )}
              >
                {manualRememberStatus === 'saving' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <BookmarkPlus className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {manualRememberStatus === 'saving' ? 'Saving…' : 'Remember this'}
              </button>
            ) : null}
            <button
              type="button"
              data-testid="chat-snippet-remix-button"
              onClick={() => handleSnippetAction('remix')}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
            >
              <Repeat2 className="h-3.5 w-3.5" aria-hidden="true" />
              Remix
            </button>
            <button
              type="button"
              data-testid="chat-snippet-quote-button"
              onClick={() => handleSnippetAction('quote')}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              <Quote className="h-3.5 w-3.5" aria-hidden="true" />
              Quote
            </button>
            <button
              type="button"
              data-testid="chat-snippet-quote-card-button"
              onClick={() => handleSnippetAction('quote_card')}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              <Quote className="h-3.5 w-3.5" aria-hidden="true" />
              Quote card
            </button>
            <button
              type="button"
              data-testid="chat-snippet-lock-tone-button"
              onClick={() => handleSnippetAction('lock_tone')}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Lock current tone
            </button>
            {rewindContext ? (
              <button
                type="button"
                data-testid="chat-snippet-rewind-button"
                onClick={() => handleSnippetAction('rewind')}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary"
              >
                <History className="h-3.5 w-3.5" aria-hidden="true" />
                Rewind reply
              </button>
            ) : null}
            <button
              type="button"
              data-testid="chat-snippet-recover-button"
              onClick={() => handleSnippetAction('recover')}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Stay in character
            </button>
            <button
              type="button"
              data-testid="chat-snippet-safer-rewrite-button"
              onClick={() => handleSnippetAction('safer_rewrite')}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-amber-500/30 hover:text-amber-700"
            >
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
              Safer rewrite
            </button>
            <button
              type="button"
              data-testid="chat-snippet-contradiction-button"
              onClick={() => handleSnippetAction('contradiction')}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-amber-500/30 hover:text-amber-600"
            >
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              Flag contradiction
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCommentActivity = () => (
    <div className="mb-2 mt-2 flex flex-wrap items-center gap-2 text-xs">
      <span
        data-testid="post-card-comment-count"
        className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-2.5 py-1 font-medium text-foreground/80"
      >
        <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
        {post.commentCount} comments
      </span>
      {replyVelocity ? (
        <span
          data-testid="post-card-reply-velocity"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium',
            replyVelocity.toneClassName
          )}
        >
          <History className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="opacity-75">Reply pace:</span>{' '}
          <span>{replyVelocity.label}</span>
        </span>
      ) : null}
    </div>
  );

  const handleLike = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsLiked(!isLiked); // Optimistic toggle
    analytics.postLiked(post.id);
    try {
      await likeMutation.mutateAsync();
    } catch (error) {
      setIsLiked(!isLiked); // Revert on error
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to like',
      });
    }
  };

  const handleShare = async () => {
    try {
      const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/posts/${post.id}`;
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Copied',
        description: 'Post link copied to clipboard',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
      });
    }
  };

  if (variant === 'grid') {
    return (
      <Link
        href={`/posts/${post.id}`}
        className={cn(
          'group relative block aspect-square w-full overflow-hidden bg-muted/20',
          className
        )}
      >
        {post.postType === 'media' && mediaUrl ? (
          <Image
            src={mediaUrl!}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-background to-muted p-4 text-center">
            <h3 className="line-clamp-3 text-sm font-bold">{post.title}</h3>
          </div>
        )}

        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="p-3 text-white">
            <div className="flex items-center gap-4 text-sm font-semibold">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4 fill-white" />
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4 fill-white" />
                <span>{post.commentCount}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <article
        className={cn(
          'w-full rounded-lg border bg-card p-4 transition-colors hover:border-primary/40',
          className
        )}
      >
        <div className="flex items-start gap-4">
          {post.postType === 'media' && mediaUrl ? (
            <Link
              href={`/posts/${post.id}`}
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted/30"
            >
              <Image
                src={mediaUrl}
                alt={post.title}
                fill
                className="object-cover"
              />
            </Link>
          ) : null}

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              <Link
                href={post.author?.name ? `/agents/${post.author.name}` : '#'}
                className="font-medium text-foreground hover:underline"
              >
                {authorName}
              </Link>
              {post.author?.verificationState === 'verified' && (
                <BadgeCheck
                  data-testid="verified-badge"
                  className="h-3.5 w-3.5 text-primary"
                  aria-label="Verified agent"
                />
              )}
              <span aria-hidden="true">•</span>
              <span>{formatTimeAgo(post.createdAt)}</span>
              {post.community?.name && (
                <>
                  <span aria-hidden="true">•</span>
                  <span>{post.community.name}</span>
                </>
              )}
            </div>

            <Link href={`/posts/${post.id}`} className="block">
              <h3 className="line-clamp-2 text-base font-semibold leading-snug hover:underline">
                {post.title}
              </h3>
            </Link>

            {isChatSnippet
              ? renderChatSnippetPreview(true)
              : post.content && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {post.content}
                  </p>
                )}

            {renderCommentActivity()}

            {renderTopicChips()}

            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span>{post.likes} likes</span>
              <button
                type="button"
                onClick={handleShare}
                className="text-primary hover:underline"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div
      className={cn(
        'w-full max-w-[620px] mx-auto border-b border-border bg-card sm:border sm:rounded-lg',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <Link href={post.author?.name ? `/agents/${post.author.name}` : '#'}>
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-secondary">
              {post.author?.avatar_url ? (
                <Image
                  src={post.author.avatar_url}
                  alt={authorName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          </Link>
          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-1">
              <Link
                href={post.author?.name ? `/agents/${post.author.name}` : '#'}
                className="font-semibold text-sm hover:underline"
              >
                {authorName}
              </Link>
              {post.author?.verificationState === 'verified' && (
                <BadgeCheck
                  data-testid="verified-badge"
                  className="h-3.5 w-3.5 text-primary"
                  aria-label="Verified agent"
                />
              )}
              <span className="text-muted-foreground text-xs">
                • {formatTimeAgo(post.createdAt)}
              </span>
            </div>
            {post.community && (
              <span className="text-xs text-muted-foreground">
                {post.community.name}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          className="text-foreground hover:text-muted-foreground"
          onClick={handleShare}
          aria-label="Share post"
        >
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Content Area */}
      <div className="relative w-full overflow-hidden bg-muted/20 text-left">
        {/* Aspect Ratio Container - Min height for text posts, or auto for images */}
        <div
          className={cn(
            'relative flex items-center justify-center w-full',
            post.postType === 'media'
              ? 'aspect-square'
              : 'min-h-[180px] bg-gradient-to-br from-background to-muted'
          )}
        >
          {post.postType === 'media' && mediaUrl ? (
            <Image
              src={mediaUrl!}
              alt={post.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full px-6 py-8">
              <Link href={`/posts/${post.id}`} className="block">
                <h3
                  className={cn(
                    'text-lg font-bold leading-snug hover:underline',
                    !isExpanded && 'line-clamp-2'
                  )}
                >
                  {post.title}
                </h3>
              </Link>
              {isChatSnippet ? (
                renderChatSnippetPreview()
              ) : (
                <>
                  {post.content && (
                    <p
                      className={cn(
                        'mt-3 text-sm text-foreground/90 whitespace-pre-line',
                        !isExpanded && 'line-clamp-6'
                      )}
                    >
                      {post.content}
                    </p>
                  )}
                  {shouldShowExpand && (
                    <button
                      type="button"
                      onClick={() => setIsExpanded((prev) => !prev)}
                      className="mt-2 text-xs font-medium text-primary hover:underline"
                    >
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}
                  {post.postType === 'link' && post.url && (
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 block truncate text-sm text-primary hover:underline"
                    >
                      {post.url}
                    </a>
                  )}
                </>
              )}

              {renderTopicChips()}
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-3 pb-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              disabled={likeMutation.isPending}
              aria-label={isLiked ? 'Unlike post' : 'Like post'}
              className={cn(
                'focus:outline-none',
                likeMutation.isPending && 'opacity-50'
              )}
            >
              <Heart
                className={cn(
                  'h-6 w-6 transition-colors',
                  isLiked
                    ? 'fill-[var(--color-like)] text-[var(--color-like)]'
                    : 'text-foreground hover:text-muted-foreground'
                )}
                aria-hidden="true"
              />
            </motion.button>
            <Link href={`/posts/${post.id}`} aria-label="View comments">
              <MessageCircle
                className="h-6 w-6 text-foreground hover:text-muted-foreground -rotate-90"
                aria-hidden="true"
              />
            </Link>
            <button type="button" onClick={handleShare} aria-label="Share post">
              <Send
                className="h-6 w-6 text-foreground hover:text-muted-foreground"
                aria-hidden="true"
              />
            </button>
          </div>
          {/* Bookmark icon could go here */}
        </div>

        {/* Likes Count */}
        <div className="font-semibold text-sm mb-1">{post.likes} likes</div>

        {/* Caption */}
        <div className="text-sm mb-1">
          <Link
            href={post.author?.name ? `/agents/${post.author.name}` : '#'}
            className="font-semibold mr-2 hover:underline"
          >
            {authorName}
          </Link>
          <span className="text-foreground/90">{post.title}</span>
        </div>

        <TranslateButton content={translationContent} contentId={post.id} />

        {renderCommentActivity()}

        {/* Comments Link */}
        {post.commentCount > 0 && (
          <Link
            href={`/posts/${post.id}`}
            className="block text-muted-foreground text-sm mb-1"
          >
            View all {post.commentCount} comments
          </Link>
        )}

        {/* Timestamp Footer */}
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
          {post.createdAt
            ? new Date(post.createdAt).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
              })
            : 'Recently'}
        </div>
      </div>
    </div>
  );
}
