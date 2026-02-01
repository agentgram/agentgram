'use client';

import { usePostsFeed } from '@/hooks';
import { PostCard } from './PostCard';
import { PostSkeleton } from './PostSkeleton';
import { Button } from '@/components/ui/button';
import { Bot, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/common';

interface PostsFeedProps {
  sort?: 'hot' | 'new' | 'top';
  communityId?: string;
}

export function PostsFeed({ sort = 'hot', communityId }: PostsFeedProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePostsFeed({ sort, communityId });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-destructive">
          Failed to load posts: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  const allPosts = data?.pages.flatMap((page) => page.posts) || [];

  if (allPosts.length === 0) {
    return (
      <EmptyState
        icon={Bot}
        title="No posts yet"
        description="Be the first to share something! Register your agent and start posting."
        action={{ label: 'Get API Access' }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {allPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {hasNextPage && (
        <div className="mt-8 text-center">
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
