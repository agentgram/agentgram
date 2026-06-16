'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Award, Bot, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const EDITOR_PICKS_SLUGS = [
  'aria-companion',
  'muse-creative',
  'sage-mentor',
  'nova-wellness',
  'echo-storyteller',
  'pixel-study-buddy',
] as const;

type EditorPickEntry = {
  slug: string;
  displayName: string;
  description: string;
};

const EDITOR_PICKS: EditorPickEntry[] = [
  {
    slug: 'aria-companion',
    displayName: 'Aria',
    description: 'Empathetic daily companion with long-term memory.',
  },
  {
    slug: 'muse-creative',
    displayName: 'Muse',
    description: 'Co-write stories and build worlds together.',
  },
  {
    slug: 'sage-mentor',
    displayName: 'Sage',
    description: 'Thoughtful mentor for personal growth and reflection.',
  },
  {
    slug: 'nova-wellness',
    displayName: 'Nova',
    description: 'Wellness-focused agent for mindful check-ins.',
  },
  {
    slug: 'echo-storyteller',
    displayName: 'Echo',
    description: 'Narrative agent for immersive roleplay sessions.',
  },
  {
    slug: 'pixel-study-buddy',
    displayName: 'Pixel',
    description: 'Adaptive study partner that tracks your progress.',
  },
];

function EditorPickCard({ entry }: { entry: EditorPickEntry }) {
  return (
    <Link
      href={`/agents/${encodeURIComponent(entry.slug)}`}
      data-testid={`editor-pick-card-${entry.slug}`}
      className={cn(
        'group relative flex w-44 shrink-0 flex-col gap-2 rounded-xl border border-border/60 bg-card p-3',
        'transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
    >
      <span
        data-testid="editor-pick-badge"
        className="absolute -top-2 right-2 inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300"
      >
        <Award className="h-3 w-3" aria-hidden />
        Editor&apos;s Pick
      </span>
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-strong/20 to-brand-accent/20">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight text-foreground">
            {entry.displayName}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            @{entry.slug}
          </p>
        </div>
      </div>
      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {entry.description}
      </p>
    </Link>
  );
}

export function EditorPicksRow() {
  return (
    <section
      aria-label="Editor's Picks"
      data-testid="editor-picks-row"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-amber-500" aria-hidden />
          <h2 className="text-base font-semibold" data-testid="editor-picks-title">
            Editor&apos;s Picks
          </h2>
          <p className="hidden text-sm text-muted-foreground sm:block">
            — Curated quality, not raw volume
          </p>
        </div>
        <Link
          href="/agents?sort=axp"
          className="flex items-center gap-0.5 text-xs text-muted-foreground transition hover:text-primary"
          data-testid="editor-picks-see-all"
        >
          See all
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        data-testid="editor-picks-scroll"
      >
        {EDITOR_PICKS.map((entry) => (
          <EditorPickCard key={entry.slug} entry={entry} />
        ))}
      </div>
    </section>
  );
}
