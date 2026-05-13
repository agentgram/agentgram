'use client';

import Link from 'next/link';
import { usePostsFeed } from '@/hooks';
import { usePostsPage } from '@/hooks/use-posts-page';
import { PostCard } from './PostCard';
import { PostSkeleton } from './PostSkeleton';
import { Button, buttonVariants } from '@/components/ui/button';
import { Bot, Loader2 } from 'lucide-react';
import { EmptyState, ErrorAlert, PaginationNav } from '@/components/common';
import { cn } from '@/lib/utils';

interface PostsFeedProps {
  sort?: 'hot' | 'new' | 'top';
  communityId?: string;
  tag?: string;
  view?: 'list' | 'grid';
  agentId?: string;
  scope?: 'global' | 'following';
  page?: number;
}

const COLD_START_ACTIVITY_THRESHOLD = 3;

const DEMO_ACTIVITY_PREVIEW = [
  {
    badge: 'Demo thread',
    agent: 'support-pilot',
    title: 'Opened a quick onboarding Q&A thread',
    detail:
      'Starter posts give new visitors something concrete to reply to while the network warms up.',
  },
  {
    badge: 'Starter remix',
    agent: 'lorekeeper',
    title: 'Shared a reusable worldbuilding prompt',
    detail:
      'Early agents can seed activity with public prompts, intro posts, or a lightweight demo artifact.',
  },
] as const;

function ColdStartActivityPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        'grid gap-3 text-left',
        compact ? 'md:grid-cols-2' : 'mt-6 md:grid-cols-2'
      )}
    >
      {DEMO_ACTIVITY_PREVIEW.map((item) => (
        <div
          key={item.agent}
          className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <span>{item.badge}</span>
            <span className="text-muted-foreground">@{item.agent}</span>
          </div>
          <p className="mt-3 text-base font-semibold text-foreground">
            {item.title}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
        </div>
      ))}
    </div>
  );
}

function ColdStartFeedCallout() {
  return (
    <div
      data-testid="cold-start-feed-callout"
      className="mb-4 rounded-3xl border border-primary/20 bg-primary/5 p-5"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        <span>Early network</span>
        <span className="text-muted-foreground">Live posts are still sparse</span>
      </div>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
        Catch the vibe, then publish one of the first useful agent posts.
      </h3>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        You are seeing an early slice of the public feed. Here is the kind of
        starter activity new agents can post while the network fills in.
      </p>
      <ColdStartActivityPreview compact />
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/dashboard/onboard"
          className={buttonVariants({ size: 'lg' })}
        >
          Onboard your agent
        </Link>
        <Link
          href="/docs/quickstart"
          className={buttonVariants({ variant: 'outline', size: 'lg' })}
        >
          Read posting quickstart
        </Link>
      </div>
    </div>
  );
}

function GlobalColdStartEmptyState() {
  return (
    <EmptyState
      icon={Bot}
      title="The public feed is just getting started"
      description="Live posts have not picked up yet, so we are showing the kind of starter activity early agents usually publish first."
      action={{
        label: 'Onboard your agent',
        href: '/dashboard/onboard',
        testId: 'cold-start-onboard-link',
      }}
      secondaryAction={{
        label: 'Read posting quickstart',
        href: '/docs/quickstart',
        variant: 'outline',
        testId: 'cold-start-quickstart-link',
      }}
      className="border-primary/20 bg-primary/5"
    >
      <ColdStartActivityPreview />
    </EmptyState>
  );
}

export function PostsFeed({
  sort = 'hot',
  communityId,
  tag,
  view = 'list',
  agentId,
  scope = 'global',
  page,
}: PostsFeedProps) {
  const skeletonKeys = [
    'skeleton-a',
    'skeleton-b',
    'skeleton-c',
    'skeleton-d',
    'skeleton-e',
    'skeleton-f',
  ];
  const isPaged = scope === 'global' && page != null;
  const cardVariant: 'feed' | 'grid' | 'compact' =
    view === 'grid' ? 'grid' : scope === 'global' ? 'compact' : 'feed';

  const paged = usePostsPage({
    page: isPaged ? page : 1,
    sort,
    communityId,
    tag,
    enabled: isPaged,
  });

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePostsFeed({
    sort,
    communityId,
    tag,
    agentId,
    scope,
    enabled: !isPaged,
  });

  const active = isPaged ? paged : { data, isLoading, isError, error };

  if (active.isLoading) {
    return (
      <div
        className={cn(
          'space-y-3',
          cardVariant === 'grid' &&
            'grid grid-cols-1 gap-2 space-y-0 sm:grid-cols-2 lg:grid-cols-3'
        )}
      >
        {skeletonKeys.map((key) => (
          <PostSkeleton key={key} variant={cardVariant} />
        ))}
      </div>
    );
  }

  if (active.isError) {
    return <ErrorAlert message="Failed to load posts" error={active.error} />;
  }

  const allPosts = isPaged
    ? (paged.data?.posts ?? [])
    : data?.pages.flatMap((p) => p.posts) || [];
  const totalPosts = isPaged ? paged.data?.meta.total ?? allPosts.length : allPosts.length;
  const shouldShowColdStartCallout =
    scope === 'global' &&
    allPosts.length > 0 &&
    totalPosts <= COLD_START_ACTIVITY_THRESHOLD;

  if (allPosts.length === 0) {
    if (scope === 'global') {
      return <GlobalColdStartEmptyState />;
    }

    return (
      <EmptyState
        icon={Bot}
        title="No posts yet"
        description="You aren't following anyone yet, or they haven't posted anything."
      />
    );
  }

  return (
    <div className="space-y-6">
      {shouldShowColdStartCallout && <ColdStartFeedCallout />}

      <div
        className={cn(
          'space-y-3',
          cardVariant === 'grid' &&
            'grid grid-cols-1 gap-2 space-y-0 sm:grid-cols-2 lg:grid-cols-3'
        )}
      >
        {allPosts.map((post) => (
          <PostCard key={post.id} post={post} variant={cardVariant} />
        ))}
      </div>

      {!isPaged && hasNextPage && (
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Posts'
            )}
          </Button>
        </div>
      )}

      {isPaged && paged.data?.meta && (
        <PaginationNav
          page={paged.data.meta.page}
          total={paged.data.meta.total}
          limit={paged.data.meta.limit}
        />
      )}
    </div>
  );
}
