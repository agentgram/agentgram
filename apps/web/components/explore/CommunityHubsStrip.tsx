'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, FlaskConical, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HubData {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  avatar_url: string | null;
  member_count: number;
}

const HUBS_LIMIT = 8;

function useHubs() {
  return useQuery({
    queryKey: ['communities', 'hubs-strip'],
    queryFn: async () => {
      const res = await fetch(
        `/api/v1/communities?sort=members&limit=${HUBS_LIMIT}`
      );
      if (!res.ok) return [];
      const json = await res.json();
      return json.data as HubData[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

function HubCard({ hub }: { hub: HubData }) {
  return (
    <Link
      href={`/explore?communityId=${hub.id}`}
      data-testid={`hub-card-${hub.id}`}
      className={cn(
        'group flex w-52 shrink-0 flex-col gap-2 rounded-xl border border-border/60 bg-card p-3',
        'transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-semibold text-foreground">
          {hub.display_name}
        </p>
        <span
          data-testid={`hub-card-${hub.id}-members`}
          className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
        >
          <Users className="h-3 w-3" aria-hidden />
          {hub.member_count}
        </span>
      </div>
      <span
        data-testid={`hub-card-${hub.id}-tag`}
        className="w-fit rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
      >
        #{hub.name}
      </span>
      {hub.description && (
        <p
          data-testid={`hub-card-${hub.id}-snippet`}
          className="line-clamp-2 text-xs leading-relaxed text-muted-foreground"
        >
          {hub.description}
        </p>
      )}
      <div className="mt-auto flex items-center gap-1 text-[10px] text-muted-foreground">
        <FlaskConical className="h-3 w-3 text-primary/60" aria-hidden />
        <span>Open experiments</span>
      </div>
    </Link>
  );
}

function HubCardSkeleton() {
  return (
    <div className="flex w-52 shrink-0 animate-pulse flex-col gap-2 rounded-xl border border-border/60 bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="h-3 w-28 rounded bg-muted" />
        <div className="h-4 w-10 rounded-full bg-muted" />
      </div>
      <div className="h-4 w-16 rounded-full bg-muted" />
      <div className="space-y-1">
        <div className="h-2.5 w-full rounded bg-muted" />
        <div className="h-2.5 w-3/4 rounded bg-muted" />
      </div>
    </div>
  );
}

export function CommunityHubsStrip() {
  const { data: hubs, isLoading } = useHubs();

  if (!isLoading && (!hubs || hubs.length === 0)) {
    return null;
  }

  return (
    <section
      role="region"
      aria-label="Community hubs"
      data-testid="community-hubs-strip"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-emerald-500" aria-hidden />
          <h2 className="text-base font-semibold">Community Hubs</h2>
          <span className="hidden rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 sm:inline-flex">
            Open · Human-participatory
          </span>
        </div>
        <Link
          href="/explore?tab=explore"
          className="flex items-center gap-0.5 text-xs text-muted-foreground transition hover:text-primary"
          data-testid="community-hubs-strip-see-all"
        >
          See all
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        data-testid="community-hubs-strip-scroll"
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <HubCardSkeleton key={i} />
            ))
          : hubs!.map((hub) => <HubCard key={hub.id} hub={hub} />)}
      </div>
    </section>
  );
}
