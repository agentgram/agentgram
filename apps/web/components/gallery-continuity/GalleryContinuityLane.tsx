'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, ImageIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Types ────────────────────────────────────────────────────────────────────

export interface LastPlayedSession {
  worldId: string;
  worldName: string;
  agentName: string;
  resumeHref: string;
}

interface GalleryContinuityLaneProps {
  /** Pass a session directly (SSR or tests). When omitted the component
   *  fetches /api/v1/sessions/last-played automatically. */
  lastPlayedSession?: LastPlayedSession | null;
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function TileSkeleton() {
  return (
    <div
      data-testid="gallery-lane-tile-skeleton"
      className="min-w-[260px] max-w-[300px] animate-pulse rounded-xl border border-border/50 bg-card/50 p-4"
    >
      <div className="mb-3 h-9 w-9 rounded-lg bg-muted" />
      <div className="mb-2 h-3 w-20 rounded bg-muted" />
      <div className="mb-1 h-4 w-40 rounded bg-muted" />
      <div className="mb-4 h-3 w-32 rounded bg-muted" />
      <div className="h-8 w-24 rounded-md bg-muted" />
    </div>
  );
}

// ── Last-played world tile ───────────────────────────────────────────────────

function LastPlayedWorldTile({ session }: { session: LastPlayedSession }) {
  const { worldName, agentName, resumeHref } = session;
  return (
    <div
      data-testid="last-played-world-tile"
      className="min-w-[260px] max-w-[300px] shrink-0 rounded-xl border border-violet-500/25 bg-violet-500/6 p-4 transition-all duration-200 hover:border-violet-500/40 hover:bg-violet-500/10"
      aria-label={`Resume story world: ${worldName}`}
    >
      <div
        className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15"
        aria-hidden="true"
      >
        <BookOpen className="h-4 w-4 text-violet-600 dark:text-violet-400" />
      </div>

      <p
        className="mb-0.5 text-xs font-medium uppercase tracking-wider text-violet-600 dark:text-violet-400"
        data-testid="last-played-tile-label"
      >
        Last story world
      </p>
      <p
        className="mb-0.5 truncate text-sm font-semibold"
        data-testid="last-played-tile-world-name"
      >
        {worldName}
      </p>
      <p
        className="mb-3 truncate text-xs text-muted-foreground"
        data-testid="last-played-tile-agent-name"
      >
        with {agentName}
      </p>

      <Button
        asChild
        size="sm"
        className="gap-1.5 bg-violet-600 text-white hover:bg-violet-700 shadow-sm shadow-violet-600/20"
      >
        <Link href={resumeHref} data-testid="last-played-tile-cta">
          Resume
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}

// ── Imagine Gallery jump-in tile ─────────────────────────────────────────────

function ImagineGalleryJumpIn() {
  return (
    <div
      data-testid="imagine-gallery-jump-in"
      className="min-w-[260px] max-w-[300px] shrink-0 rounded-xl border border-emerald-500/25 bg-emerald-500/6 p-4 transition-all duration-200 hover:border-emerald-500/40 hover:bg-emerald-500/10"
      aria-label="Continue in Imagine Gallery"
    >
      <div
        className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15"
        aria-hidden="true"
      >
        <ImageIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      </div>

      <p
        className="mb-0.5 text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400"
        data-testid="imagine-gallery-jump-in-label"
      >
        Imagine Gallery
      </p>
      <p
        className="mb-0.5 text-sm font-semibold"
        data-testid="imagine-gallery-jump-in-title"
      >
        Continue in Imagine Gallery
      </p>
      <p
        className="mb-3 text-xs text-muted-foreground"
        data-testid="imagine-gallery-jump-in-subtext"
      >
        AI image generation — free, no paywall
      </p>

      <Button
        asChild
        size="sm"
        className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
      >
        <Link href="/image-gen" data-testid="imagine-gallery-jump-in-cta">
          Open Gallery
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}

// ── Lane ─────────────────────────────────────────────────────────────────────

export default function GalleryContinuityLane({
  lastPlayedSession: lastPlayedProp,
}: GalleryContinuityLaneProps) {
  // undefined = not yet fetched, null = fetched with no result
  const [fetchedSession, setFetchedSession] = useState<
    LastPlayedSession | null | undefined
  >(undefined);

  useEffect(() => {
    if (lastPlayedProp !== undefined) return;

    fetch('/api/v1/sessions/last-played')
      .then((res) => res.json())
      .then((data: { success: boolean; data: LastPlayedSession | null }) => {
        setFetchedSession(data.success ? (data.data ?? null) : null);
      })
      .catch(() => {
        setFetchedSession(null);
      });
  }, [lastPlayedProp]);

  const loading = lastPlayedProp === undefined && fetchedSession === undefined;
  const session = lastPlayedProp !== undefined ? lastPlayedProp : fetchedSession;

  return (
    <section
      data-testid="gallery-continuity-lane"
      aria-label="Continue where you left off"
    >
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Continue where you left off
        </h2>
      </div>

      <div
        data-testid="gallery-continuity-lane-scroll"
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none"
      >
        {loading ? (
          <>
            <TileSkeleton />
            <TileSkeleton />
          </>
        ) : (
          <>
            {session && <LastPlayedWorldTile session={session} />}
            <ImagineGalleryJumpIn />
          </>
        )}
      </div>
    </section>
  );
}
