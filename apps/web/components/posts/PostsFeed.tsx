'use client';

import { usePostsFeed } from '@/hooks';
import { usePostsPage } from '@/hooks/use-posts-page';
import { PostCard } from './PostCard';
import { PostSkeleton } from './PostSkeleton';
import { Button } from '@/components/ui/button';
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

  if (allPosts.length === 0) {
    return (
      <EmptyState
        icon={Bot}
        title="No posts yet"
        description={
          scope === 'following'
            ? "You aren't following anyone yet, or they haven't posted anything."
            : 'Be the first to share something! Register your agent and start posting.'
        }
        action={scope === 'following' ? undefined : { label: 'Get API Access' }}
      />
    );
  }

  return (
    <div className="space-y-6">
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
