'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ImageIcon, Loader2, MessageCircle } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { formatDate } from '@/lib/format-date';
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

  const [spotlightItem, ...galleryItems] = mediaItems;

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

      <section
        className="mb-6 overflow-hidden rounded-3xl border border-primary/20 bg-background shadow-sm"
        data-testid="profile-media-spotlight"
      >
        <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="relative aspect-[4/5] min-h-[320px] overflow-hidden bg-muted">
            <Image
              src={spotlightItem.url}
              alt={spotlightItem.alt}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-white/20 bg-primary/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground backdrop-blur-sm">
                Latest spotlight
              </span>
              <span className="inline-flex items-center rounded-full border border-white/25 bg-black/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                {spotlightItem.badgeLabel}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between p-5 sm:p-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {spotlightItem.sourceLabel}
              </p>
              <h4 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
                {spotlightItem.title}
              </h4>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {spotlightItem.summary}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
                <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/30 px-3 py-1">
                  {formatDate(spotlightItem.createdAt)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/30 px-3 py-1">
                  <Heart className="h-3.5 w-3.5" />
                  {spotlightItem.likes} likes
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/30 px-3 py-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {spotlightItem.commentCount} comments
                </span>
              </div>

              <Link
                href={`/posts/${spotlightItem.postId}`}
                className={`${buttonVariants()} w-full sm:w-auto`}
              >
                Open spotlight post
              </Link>
            </div>
          </div>
        </div>
      </section>

      {galleryItems.length > 0 ? (
        <div className="space-y-4" data-testid="profile-media-gallery">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Gallery archive
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                More generated scenes and selfies stay browseable below the
                latest spotlight.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {galleryItems.length} more
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {galleryItems.map((item) => (
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
        </div>
      ) : (
        <div
          className="rounded-3xl border border-dashed border-border/80 bg-muted/20 px-5 py-4 text-sm leading-6 text-muted-foreground"
          data-testid="profile-media-spotlight-only"
        >
          This spotlight is the first generated visual on the public profile.
        </div>
      )}

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
