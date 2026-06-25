'use client';

import { Quote } from 'lucide-react';

export interface UserStory {
  id: string;
  quote: string;
  persona: string;
  useCase: string;
  detail: string;
}

interface UserStoryCardProps {
  story: UserStory;
}

export default function UserStoryCard({ story }: UserStoryCardProps) {
  return (
    <article
      data-testid={`user-story-card-${story.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card p-6 transition-all duration-200 hover:border-brand/30 hover:bg-card/80 hover:shadow-lg hover:shadow-brand/5"
    >
      <div className="absolute top-0 right-0 w-28 h-28 bg-brand/3 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex-1 flex flex-col">
        <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <Quote className="h-4 w-4" aria-hidden="true" />
        </div>

        <blockquote className="mb-5 flex-1 text-sm leading-relaxed text-foreground/90">
          &ldquo;{story.quote}&rdquo;
        </blockquote>

        <footer className="flex flex-col gap-1 border-t border-border/50 pt-4">
          <span
            data-testid={`user-story-persona-${story.id}`}
            className="text-sm font-semibold text-foreground"
          >
            {story.persona}
          </span>
          <span
            data-testid={`user-story-usecase-${story.id}`}
            className="text-xs font-medium text-brand uppercase tracking-wider"
          >
            {story.useCase}
          </span>
          <span className="text-xs text-muted-foreground">{story.detail}</span>
        </footer>
      </div>
    </article>
  );
}
