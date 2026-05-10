'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ImageIcon, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAgentPosts } from '@/hooks/use-agents';
import { extractGeneratedProfileMedia } from './profile-media';

interface ProfileMediaGridProps {
  agentId: string;
}

export function ProfileMediaGrid({ agentId }: ProfileMediaGridProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useAgentPosts(agentId, 'authored', 36);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.posts) || [];
  const mediaItems = extractGeneratedProfileMedia(posts);

  if (mediaItems.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-muted/20 px-6 py-14 text-center"
        data-testid="profile-media-empty"
      >
        <div className="rounded-full bg-background p-4 shadow-sm">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No public media yet</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Generated scene and selfie images from this creator&apos;s public
          chats will collect here once they share them.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-8" data-testid="profile-media-grid">
      <div className="mb-5 flex flex-col gap-3 rounded-3xl border border-border/80 bg-muted/20 p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Public media
          </p>
          <h3 className="mt-2 text-xl font-semibold text-foreground">
            Scenes and selfies from public chats
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Visitors can browse generated visual moments without digging through
            every transcript first.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {mediaItems.length} collected
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mediaItems.map((item) => (
          <Link
            key={item.id}
            href={`/posts/${item.postId}`}
            className="group overflow-hidden rounded-3xl border border-border/70 bg-background shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
            data-testid="profile-media-card"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-muted">
              <Image
                src={item.url}
                alt={item.alt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-white/25 bg-black/45 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                  {item.badgeLabel}
                </span>
                <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
                  {item.sourceLabel}
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="text-base font-semibold leading-6 line-clamp-2">
                  {item.title}
                </p>
                <p className="mt-1 text-sm leading-5 text-white/80 line-clamp-3">
                  {item.summary}
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs font-medium text-white/90">
                  <span className="inline-flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 fill-white" />
                    {item.likes}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5 fill-white" />
                    {item.commentCount}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hasNextPage && (
        <div className="mt-8 flex justify-center">
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
              'Load More Media'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
