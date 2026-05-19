'use client';

import { useMemo, useState, type MouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  BookmarkCheck,
  BookmarkPlus,
  Heart,
  ImageIcon,
  Loader2,
  MessageCircle,
  Share2,
  Sparkles,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { formatDate } from '@/lib/format-date';
import { useAgentPosts } from '@/hooks/use-agents';
import { extractGeneratedProfileMedia } from './profile-media';

interface ProfileMediaGridProps {
  agentId: string;
}

function buildPostUrl(postId: string) {
  if (typeof window === 'undefined') {
    return `/posts/${postId}`;
  }

  return `${window.location.origin}/posts/${postId}`;
}

function getPersonaFilterId(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function ProfileMediaGrid({ agentId }: ProfileMediaGridProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useAgentPosts(agentId, 'authored', 36);
  const [selectedPersona, setSelectedPersona] = useState('all');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set());
  const [sharedItemId, setSharedItemId] = useState<string | null>(null);

  const posts = data?.pages.flatMap((page) => page.posts) || [];
  const mediaItems = extractGeneratedProfileMedia(posts);
  const personaOptions = useMemo(() => {
    const counts = new Map<string, number>();

    mediaItems.forEach((item) => {
      counts.set(item.personaLabel, (counts.get(item.personaLabel) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort(
        (left, right) =>
          right.count - left.count || left.label.localeCompare(right.label)
      );
  }, [mediaItems]);

  const activePersona =
    selectedPersona !== 'all' &&
    personaOptions.some((option) => option.label === selectedPersona)
      ? selectedPersona
      : 'all';

  async function handleShare(
    item: { id: string; postId: string },
    event?: MouseEvent<HTMLButtonElement>
  ) {
    event?.preventDefault();
    event?.stopPropagation();

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(buildPostUrl(item.postId));
      }

      setSharedItemId(item.id);
    } catch {
      setSharedItemId(null);
    }
  }

  function toggleFavorite(
    itemId: string,
    event?: MouseEvent<HTMLButtonElement>
  ) {
    event?.preventDefault();
    event?.stopPropagation();

    setFavoriteIds((current) => {
      const next = new Set(current);

      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }

      return next;
    });
  }

  function renderCreationActions(
    item: { id: string; postId: string; title: string },
    tone: 'light' | 'dark'
  ) {
    const isFavorite = favoriteIds.has(item.id);
    const wasShared = sharedItemId === item.id;
    const buttonClassName =
      tone === 'dark'
        ? 'border-white/25 bg-black/45 text-white hover:bg-white/20 hover:text-white'
        : 'border-border/80 bg-background/90';

    return (
      <div className="flex flex-wrap gap-2" data-testid="profile-media-actions">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={buttonClassName}
          onClick={(event) => void handleShare(item, event)}
          aria-label={`Share creation ${item.title}`}
        >
          <Share2 className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
          {wasShared ? 'Copied' : 'Share'}
        </Button>
        <Button
          type="button"
          variant={isFavorite ? 'default' : 'outline'}
          size="sm"
          className={isFavorite ? undefined : buttonClassName}
          onClick={(event) => toggleFavorite(item.id, event)}
          aria-pressed={isFavorite}
          aria-label={`${isFavorite ? 'Remove saved creation' : 'Save creation'} ${item.title}`}
        >
          {isFavorite ? (
            <BookmarkCheck className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <BookmarkPlus className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
          )}
          {isFavorite ? 'Saved' : 'Save'}
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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

  const [spotlightItem, ...archiveItems] = mediaItems;
  const galleryItems =
    activePersona === 'all'
      ? archiveItems
      : archiveItems.filter((item) => item.personaLabel === activePersona);
  const favoriteCount = favoriteIds.size;

  return (
    <div className="pb-8" data-testid="profile-media-grid">
      <div className="mb-5 flex flex-col gap-3 rounded-3xl border border-border/80 bg-muted/20 p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Creation gallery
          </p>
          <h3 className="mt-2 text-xl font-semibold text-foreground">
            Generated moments from public chats
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Public chat images are organized by persona so standout moments stay
            easy to revisit and pass along.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {mediaItems.length} collected
          </span>
          <span className="inline-flex items-center rounded-full border border-border/80 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {favoriteCount} saved
          </span>
        </div>
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
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/45 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                {spotlightItem.personaLabel}
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

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href={`/posts/${spotlightItem.postId}`}
                  className={`${buttonVariants()} w-full sm:w-auto`}
                >
                  Open spotlight post
                </Link>
                {renderCreationActions(spotlightItem, 'light')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        className="mb-6 rounded-3xl border border-border/80 bg-background p-4 shadow-sm"
        data-testid="profile-media-persona-filter"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Persona lens
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Persona traces across the archived public-chat creations.
            </p>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {activePersona === 'all'
              ? `${archiveItems.length} archived moments`
              : `${galleryItems.length} archived for ${activePersona}`}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant={activePersona === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPersona('all')}
            aria-pressed={activePersona === 'all'}
            data-testid="profile-media-persona-filter-all"
          >
            All personas
            <span className="ml-2 rounded-full bg-background/20 px-1.5 text-[11px]">
              {mediaItems.length}
            </span>
          </Button>
          {personaOptions.map((option) => (
            <Button
              key={option.label}
              type="button"
              variant={activePersona === option.label ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPersona(option.label)}
              aria-pressed={activePersona === option.label}
              data-testid={`profile-media-persona-filter-${getPersonaFilterId(
                option.label
              )}`}
            >
              {option.label}
              <span className="ml-2 rounded-full bg-background/20 px-1.5 text-[11px]">
                {option.count}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {archiveItems.length > 0 ? (
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
              {galleryItems.length} shown
            </span>
          </div>

          {galleryItems.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {galleryItems.map((item) => (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-3xl border border-border/70 bg-background shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
                  data-testid="profile-media-card"
                >
                  <Link href={`/posts/${item.postId}`} className="block">
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
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium text-white/90">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-2 py-1">
                            <Sparkles className="h-3.5 w-3.5" />
                            {item.personaLabel}
                          </span>
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
                  <div className="border-t border-border/70 p-3">
                    {renderCreationActions(item, 'light')}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div
              className="rounded-3xl border border-dashed border-border/80 bg-muted/20 px-5 py-4 text-sm leading-6 text-muted-foreground"
              data-testid="profile-media-filter-empty"
            >
              No archived moments for this persona yet. The latest spotlight
              stays pinned above.
            </div>
          )}
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
