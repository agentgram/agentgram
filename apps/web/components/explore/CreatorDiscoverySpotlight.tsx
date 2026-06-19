'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, Globe, UserPlus, Check, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface CreatorEntry {
  id: string;
  slug: string;
  displayName: string;
  tagline: string;
  worldCount: number;
  followerCount: number;
  avatarInitials: string;
  avatarColor: string;
}

export const STUB_CREATORS: CreatorEntry[] = [
  {
    id: 'creator-1',
    slug: 'elena-worldsmith',
    displayName: 'Elena Worldsmith',
    tagline: 'Crafting immersive narrative worlds with emotionally-aware agents.',
    worldCount: 12,
    followerCount: 3841,
    avatarInitials: 'EW',
    avatarColor: 'from-violet-500/30 to-purple-600/30',
  },
  {
    id: 'creator-2',
    slug: 'kai-synth',
    displayName: 'Kai Synth',
    tagline: 'Music theory tutor agents that adapt to your learning pace.',
    worldCount: 5,
    followerCount: 1207,
    avatarInitials: 'KS',
    avatarColor: 'from-blue-500/30 to-cyan-600/30',
  },
  {
    id: 'creator-3',
    slug: 'nova-labs',
    displayName: 'Nova Labs',
    tagline: 'Open-source wellness companions. All memories stay local.',
    worldCount: 8,
    followerCount: 2630,
    avatarInitials: 'NL',
    avatarColor: 'from-emerald-500/30 to-teal-600/30',
  },
  {
    id: 'creator-4',
    slug: 'rhys-narrator',
    displayName: 'Rhys Narrator',
    tagline: 'Collaborative fiction — branching stories shaped by your choices.',
    worldCount: 20,
    followerCount: 5190,
    avatarInitials: 'RN',
    avatarColor: 'from-rose-500/30 to-pink-600/30',
  },
  {
    id: 'creator-5',
    slug: 'suki-mindful',
    displayName: 'Suki Mindful',
    tagline: 'Daily reflection agents grounded in evidence-based mindfulness.',
    worldCount: 3,
    followerCount: 988,
    avatarInitials: 'SM',
    avatarColor: 'from-amber-500/30 to-yellow-600/30',
  },
  {
    id: 'creator-6',
    slug: 'dex-codesmith',
    displayName: 'Dex Codesmith',
    tagline: 'Pair-programming agents for language learners and CS students.',
    worldCount: 7,
    followerCount: 1560,
    avatarInitials: 'DC',
    avatarColor: 'from-sky-500/30 to-indigo-600/30',
  },
];

function formatFollowers(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return String(count);
}

interface FollowButtonProps {
  creatorId: string;
}

function FollowButton({ creatorId }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <Button
      variant={isFollowing ? 'secondary' : 'default'}
      size="sm"
      className={cn(
        'h-7 gap-1 px-3 text-xs font-medium',
        isFollowing && 'text-muted-foreground'
      )}
      onClick={(e) => {
        e.preventDefault();
        setIsFollowing((prev) => !prev);
      }}
      data-testid={`follow-button-${creatorId}`}
      aria-pressed={isFollowing}
      aria-label={isFollowing ? 'Unfollow creator' : 'Follow creator'}
    >
      {isFollowing ? (
        <>
          <Check className="h-3 w-3" aria-hidden />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-3 w-3" aria-hidden />
          Follow
        </>
      )}
    </Button>
  );
}

function CreatorCard({ creator }: { creator: CreatorEntry }) {
  return (
    <div
      data-testid={`creator-card-${creator.id}`}
      className={cn(
        'group flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4',
        'transition-all hover:border-primary/40 hover:shadow-md'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/agents/${encodeURIComponent(creator.slug)}`}
          data-testid={`creator-card-${creator.id}-link`}
          className="flex items-center gap-2.5 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-foreground',
              creator.avatarColor
            )}
            aria-hidden="true"
          >
            {creator.avatarInitials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
              {creator.displayName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              @{creator.slug}
            </p>
          </div>
        </Link>
        <FollowButton creatorId={creator.id} />
      </div>

      <p
        data-testid={`creator-card-${creator.id}-tagline`}
        className="line-clamp-2 text-xs leading-relaxed text-muted-foreground"
      >
        {creator.tagline}
      </p>

      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <span
          data-testid={`creator-card-${creator.id}-worlds`}
          className="flex items-center gap-1"
        >
          <Globe className="h-3 w-3 text-primary/60" aria-hidden />
          {creator.worldCount} {creator.worldCount === 1 ? 'world' : 'worlds'}
        </span>
        <span
          data-testid={`creator-card-${creator.id}-followers`}
          className="flex items-center gap-1"
        >
          <Users className="h-3 w-3 text-primary/60" aria-hidden />
          {formatFollowers(creator.followerCount)} followers
        </span>
      </div>
    </div>
  );
}

function CreatorDiscoveryEmptyState() {
  return (
    <div
      data-testid="creator-discovery-empty"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-card/50 py-12 text-center"
    >
      <Sparkles className="h-8 w-8 text-muted-foreground/40" aria-hidden />
      <p className="text-sm font-medium text-muted-foreground">
        No creators to spotlight right now
      </p>
      <p className="max-w-xs text-xs text-muted-foreground/70">
        Check back soon — new creators are joining every day.
      </p>
    </div>
  );
}

interface CreatorDiscoverySpotlightProps {
  creators?: CreatorEntry[];
}

export function CreatorDiscoverySpotlight({
  creators = STUB_CREATORS,
}: CreatorDiscoverySpotlightProps) {
  if (creators.length === 0) {
    return (
      <section
        aria-label="Creator discovery spotlight"
        data-testid="creator-discovery-spotlight"
      >
        <CreatorDiscoveryEmptyState />
      </section>
    );
  }

  return (
    <section
      aria-label="Creator discovery spotlight"
      data-testid="creator-discovery-spotlight"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          <h2 className="text-base font-semibold" data-testid="creator-discovery-title">
            Creators to Discover
          </h2>
          <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary sm:inline-flex">
            Recently spotted
          </span>
        </div>
        <Link
          href="/agents"
          className="flex items-center gap-0.5 text-xs text-muted-foreground transition hover:text-primary"
          data-testid="creator-discovery-see-all"
        >
          See all
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        data-testid="creator-discovery-grid"
      >
        {creators.map((creator) => (
          <CreatorCard key={creator.id} creator={creator} />
        ))}
      </div>
    </section>
  );
}
