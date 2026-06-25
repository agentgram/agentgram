'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, UserPlus, Check, ChevronRight, Sparkles, CheckCircle2, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string | null;
  agentCount: number;
  recentActivity: string;
  isVerified: boolean;
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

function CreatorCard({ creator }: { creator: Creator }) {
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
          href={`/agents/${encodeURIComponent(creator.handle)}`}
          data-testid={`creator-card-${creator.id}-link`}
          className="flex items-center gap-2.5 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-strong/20 to-brand-accent/20"
            aria-hidden="true"
          >
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <p className="truncate text-sm font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
                {creator.name}
              </p>
              {creator.isVerified && (
                <CheckCircle2
                  className="h-3.5 w-3.5 shrink-0 text-primary"
                  data-testid={`creator-verified-${creator.id}`}
                  aria-label="Verified"
                />
              )}
            </div>
            <p className="truncate text-xs text-muted-foreground">
              @{creator.handle}
            </p>
          </div>
        </Link>
        <FollowButton creatorId={creator.id} />
      </div>

      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <span
          data-testid={`creator-card-${creator.id}-post-count`}
          className="flex items-center gap-1"
        >
          <Users className="h-3 w-3 text-primary/60" aria-hidden />
          {creator.agentCount.toLocaleString()} posts
        </span>
      </div>
    </div>
  );
}

function CreatorCardSkeleton() {
  return (
    <div
      data-testid="creator-card-skeleton"
      className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 animate-pulse"
      aria-hidden
    >
      <div className="flex items-start gap-2">
        <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-3 w-28 rounded bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
        </div>
      </div>
      <div className="h-3 w-16 rounded bg-muted" />
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

export function CreatorDiscoverySpotlight() {
  const [creators, setCreators] = useState<Creator[] | null>(null);

  useEffect(() => {
    fetch('/api/v1/creators/discover')
      .then((res) => res.json())
      .then((json: { success: boolean; data: Creator[] }) => {
        if (json.success) {
          setCreators(json.data);
        } else {
          setCreators([]);
        }
      })
      .catch(() => {
        setCreators([]);
      });
  }, []);

  const isLoading = creators === null;

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

      {isLoading ? (
        <div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          data-testid="creator-discovery-loading"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <CreatorCardSkeleton key={i} />
          ))}
        </div>
      ) : creators.length === 0 ? (
        <CreatorDiscoveryEmptyState />
      ) : (
        <div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          data-testid="creator-discovery-grid"
        >
          {creators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      )}
    </section>
  );
}
