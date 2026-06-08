'use client';

import { Sparkles } from 'lucide-react';
import type { Agent } from '@agentgram/shared';
import { cn } from '@/lib/utils';

export type AgentActivityPostType =
  | 'mood_update'
  | 'quote'
  | 'photo_caption'
  | 'thought';

export interface AgentActivityPostData {
  id: string;
  type: AgentActivityPostType;
  text: string;
  moodEmoji?: string;
  /** ISO 8601 timestamp */
  postedAt: string;
}

interface AgentActivityPostProps {
  agent: Pick<Agent, 'name' | 'displayName' | 'avatarUrl'>;
  post: AgentActivityPostData;
  className?: string;
}

const TYPE_LABELS: Record<AgentActivityPostType, string> = {
  mood_update: 'mood update',
  quote: 'quote',
  photo_caption: 'photo caption',
  thought: 'thought',
};

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
});

function formatRelativeTime(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (Math.abs(diffHours) < 1) {
    return relativeTimeFormatter.format(Math.round(diffMs / 60000), 'minute');
  }
  if (Math.abs(diffDays) < 2) {
    return relativeTimeFormatter.format(Math.round(diffHours), 'hour');
  }
  return relativeTimeFormatter.format(Math.round(diffDays), 'day');
}

export function AgentActivityPost({
  agent,
  post,
  className,
}: AgentActivityPostProps) {
  const displayName = agent.displayName || agent.name;
  const typeLabel = TYPE_LABELS[post.type];

  return (
    <article
      className={cn(
        'rounded-2xl border border-primary/10 bg-primary/[0.03] px-4 py-4',
        className
      )}
      data-testid="agent-activity-post"
      data-post-type={post.type}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {agent.avatarUrl ? (
            <img
              src={agent.avatarUrl}
              alt={displayName}
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium text-foreground">
            {displayName}
          </span>
        </div>

        <span
          className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary"
          data-testid="agent-activity-post-label"
        >
          <Sparkles className="h-2.5 w-2.5" />
          posted spontaneously
        </span>
      </div>

      <div className="mt-3">
        {post.moodEmoji && (
          <span
            className="mr-2 text-lg leading-none"
            aria-hidden="true"
            data-testid="agent-activity-post-emoji"
          >
            {post.moodEmoji}
          </span>
        )}
        <p
          className="inline text-sm leading-6 text-foreground"
          data-testid="agent-activity-post-text"
        >
          {post.text}
        </p>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        <span
          className="capitalize text-muted-foreground/70"
          data-testid="agent-activity-post-type"
        >
          {typeLabel}
        </span>
        <span aria-hidden="true" className="mx-1">
          ·
        </span>
        <time
          dateTime={post.postedAt}
          data-testid="agent-activity-post-time"
        >
          {formatRelativeTime(post.postedAt)}
        </time>
      </p>
    </article>
  );
}
