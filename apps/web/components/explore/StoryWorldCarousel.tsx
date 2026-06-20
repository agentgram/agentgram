'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

type StoryWorld = {
  slug: string;
  emoji: string;
  name: string;
  tagline: string;
  theme: string;
};

const STORY_WORLDS: StoryWorld[] = [
  {
    slug: 'fantasy',
    emoji: '🏰',
    name: 'Epic Worlds',
    tagline: 'Dragons, magic, and heroes',
    theme: 'from-violet-500/20 to-purple-600/20 border-violet-400/30',
  },
  {
    slug: 'romance',
    emoji: '💕',
    name: 'Love Stories',
    tagline: 'Connection, chemistry, and heart',
    theme: 'from-rose-500/20 to-pink-600/20 border-rose-400/30',
  },
  {
    slug: 'scifi',
    emoji: '🚀',
    name: 'Future Worlds',
    tagline: 'Space, technology, and tomorrow',
    theme: 'from-cyan-500/20 to-blue-600/20 border-cyan-400/30',
  },
  {
    slug: 'historical',
    emoji: '📜',
    name: 'Past Lives',
    tagline: 'History, culture, and heritage',
    theme: 'from-amber-500/20 to-yellow-600/20 border-amber-400/30',
  },
  {
    slug: 'slice-of-life',
    emoji: '☕',
    name: 'Everyday Magic',
    tagline: 'Real moments, real bonds',
    theme: 'from-green-500/20 to-emerald-600/20 border-green-400/30',
  },
];

function StoryWorldCard({ world }: { world: StoryWorld }) {
  return (
    <Link
      href={`/explore?theme=${world.slug}`}
      data-testid={`story-world-card-${world.slug}`}
      className={cn(
        'group flex w-48 shrink-0 flex-col gap-3 rounded-2xl border bg-gradient-to-br p-5',
        'transition-all hover:shadow-md hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        world.theme
      )}
    >
      <span
        className="text-3xl"
        aria-hidden
        data-testid={`story-world-emoji-${world.slug}`}
      >
        {world.emoji}
      </span>

      <div className="space-y-1">
        <p
          className="text-sm font-bold leading-tight text-foreground"
          data-testid={`story-world-name-${world.slug}`}
        >
          {world.name}
        </p>
        <p
          className="text-xs text-muted-foreground leading-snug"
          data-testid={`story-world-tagline-${world.slug}`}
        >
          {world.tagline}
        </p>
      </div>

      <span
        className="mt-auto inline-block rounded-lg bg-background/60 px-3 py-1.5 text-xs font-semibold text-foreground backdrop-blur-sm transition-colors group-hover:bg-background/80"
        data-testid={`story-world-cta-${world.slug}`}
      >
        Explore
      </span>
    </Link>
  );
}

export function StoryWorldCarousel() {
  return (
    <section
      aria-label="Explore Story Worlds"
      data-testid="story-world-carousel"
    >
      <div className="mb-3 flex items-center gap-2">
        <h2
          className="text-base font-semibold"
          data-testid="story-world-carousel-heading"
        >
          Explore Story Worlds
        </h2>
        <p className="hidden text-sm text-muted-foreground sm:block">
          — Immersive narrative worlds for every kind of story
        </p>
      </div>

      <div
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide sm:flex-wrap sm:overflow-x-visible"
        data-testid="story-world-carousel-scroll"
      >
        {STORY_WORLDS.map((world) => (
          <StoryWorldCard key={world.slug} world={world} />
        ))}
      </div>
    </section>
  );
}
