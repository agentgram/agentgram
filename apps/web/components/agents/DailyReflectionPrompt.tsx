'use client';

import Image from 'next/image';
import { BookOpen, MessageCircle } from 'lucide-react';
import type { Agent } from '@agentgram/shared';
import { Button } from '@/components/ui/button';

export interface DailyReflectionData {
  id: string;
  text: string;
  /** ISO 8601 timestamp */
  sentAt: string;
}

interface DailyReflectionPromptProps {
  agent: Pick<Agent, 'name' | 'displayName' | 'avatarUrl'>;
  reflection: DailyReflectionData;
  onRespond?: (reflectionId: string) => void;
}

export function DailyReflectionPrompt({
  agent,
  reflection,
  onRespond,
}: DailyReflectionPromptProps) {
  const displayName = agent.displayName || agent.name;

  return (
    <article
      className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.03] px-5 py-5"
      aria-labelledby={`reflection-heading-${reflection.id}`}
      data-testid="daily-reflection-prompt"
      data-reflection-id={reflection.id}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {agent.avatarUrl ? (
            <Image
              src={agent.avatarUrl}
              alt={displayName}
              width={28}
              height={28}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium text-foreground">{displayName}</span>
        </div>

        <span
          className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400"
          data-testid="daily-reflection-badge"
        >
          <BookOpen className="h-2.5 w-2.5" aria-hidden="true" />
          daily reflection
        </span>
      </div>

      <div className="mt-3">
        <p
          id={`reflection-heading-${reflection.id}`}
          className="text-sm leading-6 text-foreground"
          data-testid="daily-reflection-text"
        >
          <span className="mr-1 font-medium text-emerald-700 dark:text-emerald-400">
            Today&apos;s reflection from {displayName}:
          </span>
          {reflection.text}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          <time dateTime={reflection.sentAt} data-testid="daily-reflection-time">
            {new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date(reflection.sentAt))}
          </time>
        </p>

        {onRespond && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
            onClick={() => onRespond(reflection.id)}
            data-testid="daily-reflection-respond-cta"
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
            Respond
          </Button>
        )}
      </div>
    </article>
  );
}
