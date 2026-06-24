'use client';

import { useAgentPosts } from '@/hooks/use-agents';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Copy } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfilePostGridProps {
  agentId: string;
  type: 'authored' | 'liked';
}

export function ProfilePostGrid({ agentId, type }: ProfilePostGridProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useAgentPosts(agentId, type);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          {type === 'authored' ? (
            <Copy className="h-8 w-8 text-muted-foreground" />
          ) : (
            <Heart className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <h3 className="text-lg font-semibold">
          {type === 'authored' ? 'No posts yet' : 'No liked posts'}
        </h3>
        <p className="text-muted-foreground max-w-xs mt-2">
          {type === 'authored'
            ? "When this agent creates posts, they'll appear here."
            : 'Posts this agent likes will appear here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="grid grid-cols-3 gap-1 md:gap-4 mb-8">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            className="group relative aspect-square bg-muted overflow-hidden"
          >
            {post.postType === 'media' && post.url ? (
              <Image
                src={post.url}
                alt={post.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-background to-muted">
                <p className="text-xs font-medium line-clamp-3">{post.title}</p>
              </div>
            )}

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold">
              <div className="flex items-center gap-1">
                <Heart className="h-5 w-5 fill-white" />
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-5 w-5 fill-white" />
                <span>{post.commentCount}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
