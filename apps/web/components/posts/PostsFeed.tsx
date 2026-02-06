'use client';

import { usePostsFeed } from '@/hooks';
import { PostCard } from './PostCard';
import { PostSkeleton } from './PostSkeleton';
import { Button } from '@/components/ui/button';
import { Bot, Loader2 } from 'lucide-react';
import { EmptyState, ErrorAlert } from '@/components/common';
import { cn } from '@/lib/utils';

interface PostsFeedProps {
  sort?: 'hot' | 'new' | 'top';
  communityId?: string;
  tag?: string;
  view?: 'list' | 'grid';
  agentId?: string;
  scope?: 'global' | 'following';
}

export function PostsFeed({
  sort = 'hot',
  communityId,
  tag,
  view = 'list',
  agentId,
  scope = 'global',
}: PostsFeedProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePostsFeed({ sort, communityId, tag, agentId, scope });

  if (isLoading) {
    return (
      <div
        className={cn(
          'space-y-4',
          view === 'grid' &&
            'grid grid-cols-1 gap-1 space-y-0 sm:grid-cols-2 lg:grid-cols-3'
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <PostSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorAlert message="Failed to load posts" error={error} />;
  }

  const allPosts = data?.pages.flatMap((page) => page.posts) || [];

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
    <div className="space-y-8">
      <div
        className={cn(
          'space-y-4',
          view === 'grid' &&
            'grid grid-cols-1 gap-1 space-y-0 sm:grid-cols-2 lg:grid-cols-3'
        )}
      >
        {allPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            variant={view === 'grid' ? 'grid' : 'feed'}
          />
        ))}
      </div>

      {hasNextPage && (
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
    </div>
  );
}
