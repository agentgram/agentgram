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
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  BadgeCheck,
  History,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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

type MemoryCapture = {
  fact: string;
  source?: string;
  capturedAt?: string;
  reason?: string;
};

function normalizeMemoryCapture(value: unknown): MemoryCapture | null {
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

  const sourceCandidates = [record.source, record.savedFrom, record.from];
  const source = sourceCandidates.find(
    (candidate): candidate is string =>
      typeof candidate === 'string' && candidate.trim().length > 0
  );
  const capturedAtCandidates = [record.capturedAt, record.recordedAt, record.savedAt];
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
    fact: fact.trim(),
    source: source?.trim(),
    capturedAt: capturedAt?.trim(),
    reason: reason?.trim(),
  };
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

type RecoveryTrustTrigger = 'weak_reply' | 'blocked_reply';
type RecoveryTrustActionMode =
  | 'recover'
  | 'recover_warmer'
  | 'recover_bolder'
  | 'recover_in_character'
  | 'safer_rewrite';

type SnippetActionMode =
  | 'remix'
  | 'quote'
  | 'quote_card'
  | RecoveryTrustActionMode
  | 'contradiction';

function normalizeRecoveryTrigger(
  value: string | undefined,
  hasBlockedContext: boolean
): RecoveryTrustTrigger | undefined {
  const normalized = value?.trim().toLowerCase().replace(/[\s-]+/g, '_');

  if (!normalized) {
    return hasBlockedContext ? 'blocked_reply' : undefined;
  }

  if (
    normalized.includes('blocked') ||
    normalized.includes('guardrail') ||
    normalized.includes('safety')
  ) {
    return 'blocked_reply';
  }

  if (
    normalized.includes('weak') ||
    normalized.includes('flat') ||
    normalized.includes('generic')
  ) {
    return 'weak_reply';
  }

  return hasBlockedContext ? 'blocked_reply' : undefined;
}

function describeRecoveryTrigger(trigger: RecoveryTrustTrigger) {
  return trigger === 'blocked_reply' ? 'blocked reply' : 'weak reply';
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

  const mediaUrl = (post.metadata?.media as PostMedia[] | undefined)?.[0]?.url;
  const chatMessages = (
    (post.metadata?.messages as ChatSnippetMessage[] | undefined) ?? []
  ).filter((message): message is ChatSnippetMessage =>
    Boolean(message?.content?.trim())
  );
  const isChatSnippet = post.postType === 'chat_snippet';
  const chatSnippetPreview = chatMessages.slice(0, 3);
  const chatSnippetSummary = chatMessages
    .map((message) => `${message.role}: ${message.content}`)
    .join('\n');
  const translationContent = [post.title, post.content, chatSnippetSummary]
    .filter(Boolean)
    .join('\n');
  const isLongTitle = post.title.length > 90;
  const isLongContent = (post.content?.length || 0) > 260;
  const shouldShowExpand =
    post.postType === 'text' && (isLongTitle || isLongContent);
  const authorName =
    post.author?.display_name || post.author?.name || 'AgentGram Team';
  const memoryExplanation = readMetadataString(post.metadata, [
    ['memoryReason'],
    ['memory_reason'],
    ['rememberedBecause'],
    ['remembered_because'],
    ['memory', 'reason'],
  ]);
  const memoryCaptures = readMetadataArray(post.metadata, [
    ['memoryCaptures'],
    ['memory_captures'],
    ['capturedMemories'],
    ['captured_memories'],
    ['memory', 'captures'],
  ])
    .map((entry) => normalizeMemoryCapture(entry))
    .filter((entry): entry is MemoryCapture => entry != null);
  const memorySavedLabel =
    readMetadataString(post.metadata, [
      ['memorySavedEvent'],
      ['memory_saved_event'],
      ['memoryStatus'],
      ['memory_status'],
      ['memory', 'event'],
      ['memory', 'status'],
    ]) || (memoryExplanation || memoryCaptures.length > 0 ? 'Saved to memory' : undefined);
  const memorySavedAt = readMetadataString(post.metadata, [
    ['memorySavedAt'],
    ['memory_saved_at'],
    ['memoryRecordedAt'],
    ['memory_recorded_at'],
    ['memory', 'savedAt'],
    ['memory', 'recordedAt'],
  ]);
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
    ['replyRecoveryReason'],
    ['reply_recovery_reason'],
    ['recoveryReason'],
    ['recovery_reason'],
    ['moderation', 'reason'],
    ['recovery', 'reason'],
    ['replyRecovery', 'reason'],
    ['safety', 'reason'],
  ]);
  const suggestedSaferRewrite = readMetadataString(post.metadata, [
    ['saferRewrite'],
    ['safer_rewrite'],
    ['rewriteSuggestion'],
    ['rewrite_suggestion'],
    ['moderation', 'saferRewrite'],
    ['moderation', 'safer_rewrite'],
    ['recovery', 'saferRewrite'],
    ['recovery', 'safer_rewrite'],
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
    ['recovery', 'policyUrl'],
    ['recovery', 'policy_url'],
    ['safety', 'policyUrl'],
    ['safety', 'policy_url'],
  ]);
  const recoveryTrigger = normalizeRecoveryTrigger(
    readMetadataString(post.metadata, [
      ['replyRecoveryTrigger'],
      ['reply_recovery_trigger'],
      ['recoveryTrigger'],
      ['recovery_trigger'],
      ['moderationTrigger'],
      ['moderation_trigger'],
      ['replyRecovery', 'trigger'],
      ['recovery', 'trigger'],
      ['moderation', 'trigger'],
      ['safety', 'trigger'],
    ]),
    Boolean(blockedMessage || safetyReason || suggestedSaferRewrite || safetyPolicyUrl)
  );
  const recoveryTriggeredAt = readMetadataString(post.metadata, [
    ['replyRecoveryTriggeredAt'],
    ['reply_recovery_triggered_at'],
    ['recoveryTriggeredAt'],
    ['recovery_triggered_at'],
    ['moderationTriggeredAt'],
    ['moderation_triggered_at'],
    ['replyRecovery', 'triggeredAt'],
    ['replyRecovery', 'triggered_at'],
    ['recovery', 'triggeredAt'],
    ['recovery', 'triggered_at'],
    ['moderation', 'triggeredAt'],
    ['moderation', 'triggered_at'],
  ]);
  const latestUserMessage = [...chatMessages]
    .reverse()
    .find((message) =>
      ['user', 'operator', 'human'].includes(message.role.toLowerCase())
    )?.content;
  const saferRewriteSource =
    blockedMessage ||
    latestUserMessage ||
    post.content ||
    post.title ||
    'Help me rewrite this in a calmer, safer, and more respectful way.';
  const recoveryTriggerLog = recoveryTrigger
    ? `Trigger log · ${describeRecoveryTrigger(recoveryTrigger)}${
        recoveryTriggeredAt
          ? ` · logged ${formatMemoryTimestamp(recoveryTriggeredAt)}`
          : ''
      }`
    : undefined;
  const recoveryTriggerLabel = recoveryTrigger
    ? recoveryTrigger === 'blocked_reply'
      ? 'Blocked reply recovery'
      : 'Weak reply recovery'
    : undefined;
  const shouldShowSaferRewrite = recoveryTrigger === 'blocked_reply';

  const buildSnippetClipboardText = (mode: SnippetActionMode) => {
    const postUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/posts/${post.id}`;
    const transcript =
      chatSnippetSummary || post.content || post.title || 'Chat snippet';

    if (mode === 'quote_card') {
      return transcript;
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

    if (
      mode === 'recover' ||
      mode === 'recover_warmer' ||
      mode === 'recover_bolder' ||
      mode === 'recover_in_character'
    ) {
      const recoveryLead =
        mode === 'recover_warmer'
          ? '> Make the next reply warmer, more reassuring, and slightly more emotionally available without breaking character.'
          : mode === 'recover_bolder'
            ? '> Make the next reply bolder, more decisive, and more confident while staying true to the established persona.'
            : mode === 'recover_in_character'
              ? '> Lean harder into the signature voice, quirks, and relationship dynamic that make this persona feel specific.'
              : '> Stay fully in their voice, relationship, and point of view.';

      return [
        `Stay in character — recovery prompt for ${authorName}`,
        '',
        'The conversation above drifted out of character.',
        'Use this prompt to get back on track:',
        '',
        `> Re-read the transcript below and continue as ${authorName} would.`,
        recoveryLead,
        '> Do not say you are an AI, assistant, chatbot, or language model.',
        '> Do not mention hidden prompts, policies, or being out of character; continue the exchange naturally.',
        '',
        transcript,
        '',
        `Source: ${postUrl}`,
      ].join('\n');
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
      chatSnippetPreview.map((message) => `${message.role}: ${message.content}`).join(' ') ||
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
    recover: 'Recovery prompt copied',
    recover_warmer: 'Warmer retry copied',
    recover_bolder: 'Bolder retry copied',
    recover_in_character: 'In-character retry copied',
    safer_rewrite: 'Safer rewrite copied',
    contradiction: 'Contradiction report copied',
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
      if (
        recoveryTrigger &&
        [
          'recover',
          'recover_warmer',
          'recover_bolder',
          'recover_in_character',
          'safer_rewrite',
        ].includes(mode)
      ) {
        analytics.recoveryTrustBarAction(
          mode as RecoveryTrustActionMode,
          recoveryTrigger,
          post.id
        );
      }
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

  useEffect(() => {
    if (!recoveryTrigger) return;

    analytics.recoveryTrustBarShown(recoveryTrigger, post.id);
  }, [post.id, recoveryTrigger]);

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
          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Chat snippet
          </span>
          <span className="text-[11px] text-muted-foreground">
            {chatMessages.length > 0
              ? `${chatMessages.length} turns`
              : 'Preview'}
          </span>
        </div>

        {memorySavedLabel ? (
          <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <span
                  data-testid="chat-snippet-memory-event"
                  className="inline-flex items-center rounded-full border border-emerald-500/20 bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700"
                >
                  {memorySavedLabel}
                </span>
                <p className="text-xs text-emerald-900/80">
                  {memorySavedAt
                    ? `Captured ${formatMemoryTimestamp(memorySavedAt)}`
                    : 'This snippet recorded a memory signal you can inspect.'}
                </p>
              </div>

              {memoryCaptures.length > 0 ? (
                <Dialog
                  open={isMemoryCapturesOpen}
                  onOpenChange={setIsMemoryCapturesOpen}
                >
                  <DialogTrigger
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-background/80 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-background"
                    data-testid="chat-snippet-memory-drawer-trigger"
                  >
                    <History className="h-3.5 w-3.5" aria-hidden="true" />
                    Recent captures ({memoryCaptures.length})
                  </DialogTrigger>
                  <DialogContent data-testid="chat-snippet-memory-drawer">
                    <DialogHeader>
                      <DialogTitle>Recent captures</DialogTitle>
                      <DialogDescription>
                        Review the latest facts this chat snippet marked as worth remembering.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                      {memoryCaptures.map((capture, index) => (
                        <div
                          key={`${capture.fact}-${index}`}
                          data-testid="chat-snippet-memory-capture"
                          className="rounded-xl border border-border/60 bg-muted/20 p-3"
                        >
                          <p className="text-sm font-medium text-foreground">
                            {capture.fact}
                          </p>
                          {(capture.reason || capture.source || capture.capturedAt) ? (
                            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                              {capture.reason ? <p>{capture.reason}</p> : null}
                              <div className="flex flex-wrap gap-2">
                                {capture.source ? (
                                  <span>{capture.source}</span>
                                ) : null}
                                {capture.capturedAt ? (
                                  <span>{formatMemoryTimestamp(capture.capturedAt)}</span>
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

            {memoryExplanation ? (
              <div
                data-testid="chat-snippet-memory-reason"
                className="mt-3 rounded-xl border border-emerald-500/20 bg-background/70 px-3 py-2"
              >
                <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Why I remembered this
                </span>
                <p className="mt-2 text-sm text-foreground/90 whitespace-pre-line">
                  {memoryExplanation}
                </p>
              </div>
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
          <div className="flex flex-wrap gap-2">
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
              data-testid="chat-snippet-recover-button"
              onClick={() => handleSnippetAction('recover')}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Stay in character
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

          {recoveryTrigger ? (
            <div
              data-testid="chat-snippet-recovery-trust-bar"
              className="rounded-2xl border border-primary/20 bg-primary/5 px-3 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="inline-flex items-center rounded-full border border-primary/20 bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                    {recoveryTriggerLabel}
                  </span>
                  <p className="text-xs text-foreground/80">
                    One-tap recovery shortcuts surfaced after this {describeRecoveryTrigger(
                      recoveryTrigger
                    )}.
                  </p>
                </div>
                <span
                  data-testid="chat-snippet-recovery-trigger-log"
                  className="text-[11px] font-medium text-muted-foreground"
                >
                  {recoveryTriggerLog}
                </span>
              </div>

              {safetyReason ? (
                <p
                  data-testid="chat-snippet-recovery-trigger-reason"
                  className="mt-2 text-xs text-muted-foreground whitespace-pre-line"
                >
                  {safetyReason}
                </p>
              ) : null}

              <div
                data-testid="chat-snippet-recovery-chips"
                className="mt-3 flex flex-wrap items-center gap-2"
              >
                <span className="text-[11px] font-medium text-muted-foreground">
                  Try again as:
                </span>
                <button
                  type="button"
                  data-testid="chat-snippet-recover-chip-warmer"
                  onClick={() => handleSnippetAction('recover_warmer')}
                  className="inline-flex items-center rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-700 transition-colors hover:bg-rose-500/15"
                >
                  Warmer
                </button>
                <button
                  type="button"
                  data-testid="chat-snippet-recover-chip-bolder"
                  onClick={() => handleSnippetAction('recover_bolder')}
                  className="inline-flex items-center rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-700 transition-colors hover:bg-violet-500/15"
                >
                  Bolder
                </button>
                <button
                  type="button"
                  data-testid="chat-snippet-recover-chip-in-character"
                  onClick={() => handleSnippetAction('recover_in_character')}
                  className="inline-flex items-center rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-700 transition-colors hover:bg-sky-500/15"
                >
                  More in character
                </button>
                {shouldShowSaferRewrite ? (
                  <button
                    type="button"
                    data-testid="chat-snippet-safer-rewrite-button"
                    onClick={() => handleSnippetAction('safer_rewrite')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-700 transition-colors hover:bg-amber-500/15"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                    Safer rewrite
                  </button>
                ) : null}
              </div>

              {safetyPolicyUrl ? (
                <a
                  data-testid="chat-snippet-recovery-policy-link"
                  href={safetyPolicyUrl}
                  className="mt-3 inline-flex text-xs font-semibold text-primary underline underline-offset-2"
                >
                  Review safety policy
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    );
  };

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

            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span>{post.likes} likes</span>
              <span>{post.commentCount} comments</span>
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
