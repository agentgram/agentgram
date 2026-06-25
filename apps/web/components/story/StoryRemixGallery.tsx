'use client';

import Link from 'next/link';
import { GitFork, MessageCircle, User } from 'lucide-react';
import type { StoryRemix } from '@agentgram/shared';
import { useStoryRemixes } from '@/hooks/useStoryRemixes';

interface StoryRemixGalleryProps {
  agentId: string;
  agentName: string;
}

function RemixCard({
  remix,
  agentName,
}: {
  remix: StoryRemix;
  agentName: string;
}) {
  return (
    <article
      className="rounded-2xl border border-border/70 bg-background/80 p-4"
      data-testid={`remix-card-${remix.id}`}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
          aria-hidden
        >
          <GitFork className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3
            className="text-sm font-semibold text-foreground"
            data-testid={`remix-title-${remix.id}`}
          >
            {remix.title}
          </h3>
          <p
            className="mt-1 text-sm leading-6 text-muted-foreground"
            data-testid={`remix-description-${remix.id}`}
          >
            {remix.description}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1 text-xs text-muted-foreground"
              data-testid={`remix-author-${remix.id}`}
            >
              <User className="h-3 w-3" aria-hidden />
              {remix.authorName}
            </span>
            <span
              className="inline-flex items-center gap-1 text-xs text-muted-foreground"
              data-testid={`remix-chat-count-${remix.id}`}
            >
              <MessageCircle className="h-3 w-3" aria-hidden />
              {remix.chatCount.toLocaleString()} chats
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Link
          href={`/agents/${agentName}/chat?remix=${remix.id}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          data-testid={`remix-cta-${remix.id}`}
        >
          Chat with this version
        </Link>
      </div>
    </article>
  );
}

export function StoryRemixGallery({ agentId, agentName }: StoryRemixGalleryProps) {
  const { remixes, isLoading, error } = useStoryRemixes(agentId);

  if (isLoading) {
    return (
      <section
        aria-label="AU remix variants"
        className="rounded-3xl border border-border/80 bg-card/80 p-4 shadow-sm"
        data-testid="story-remix-gallery"
      >
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Alternate universes
          </p>
          <p className="text-sm text-muted-foreground" data-testid="remix-loading">
            Loading remixes…
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        aria-label="AU remix variants"
        className="rounded-3xl border border-border/80 bg-card/80 p-4 shadow-sm"
        data-testid="story-remix-gallery"
      >
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Alternate universes
          </p>
          <p className="text-sm text-destructive" data-testid="remix-error">
            {error}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="AU remix variants"
      className="rounded-3xl border border-border/80 bg-card/80 p-4 shadow-sm"
      data-testid="story-remix-gallery"
    >
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Alternate universes
        </p>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Community remixes
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Fan-made AU variants of this agent — each one is a distinct
            alternate universe you can chat with.
          </p>
        </div>
      </div>

      {remixes.length === 0 ? (
        <p
          className="mt-4 text-sm text-muted-foreground"
          data-testid="remix-empty-state"
        >
          No remixes yet — be the first to create one.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-4" data-testid="remix-list">
          {remixes.map((remix) => (
            <RemixCard key={remix.id} remix={remix} agentName={agentName} />
          ))}
        </div>
      )}
    </section>
  );
}
