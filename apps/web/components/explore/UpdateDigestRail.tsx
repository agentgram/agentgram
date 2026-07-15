'use client';

import { useState, type ElementType } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ImageIcon,
  Mic,
  BrainCircuit,
  Sparkles,
  GitCompareArrows,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type UpdateCategory = 'voice' | 'image' | 'memory';

export interface UpdateDigestEntry {
  id: string;
  category: UpdateCategory;
  title: string;
  description: string;
  href: string;
  isNew?: boolean;
}

const CATEGORY_META: Record<
  UpdateCategory,
  { label: string; icon: ElementType; colorClass: string; badgeClass: string }
> = {
  voice: {
    label: 'Voice',
    icon: Mic,
    colorClass: 'from-violet-500/20 to-purple-500/20',
    badgeClass:
      'border-violet-400/30 bg-violet-400/10 text-violet-700 dark:text-violet-300',
  },
  image: {
    label: 'Image',
    icon: ImageIcon,
    colorClass: 'from-sky-500/20 to-cyan-500/20',
    badgeClass:
      'border-sky-400/30 bg-sky-400/10 text-sky-700 dark:text-sky-300',
  },
  memory: {
    label: 'Memory',
    icon: BrainCircuit,
    colorClass: 'from-emerald-500/20 to-teal-500/20',
    badgeClass:
      'border-emerald-400/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300',
  },
};

export const DEFAULT_UPDATE_ENTRIES: UpdateDigestEntry[] = [
  {
    id: 'voice-latency-v2',
    category: 'voice',
    title: 'Voice latency cut by 40%',
    description:
      'Sub-200 ms response on mobile — smoother real-time conversations.',
    href: '/explore?tab=explore#voice',
    isNew: true,
  },
  {
    id: 'voice-long-session',
    category: 'voice',
    title: 'Long-session continuity',
    description:
      'Voice sessions now persist context across pauses without resetting.',
    href: '/explore?tab=explore#voice',
  },
  {
    id: 'image-selfie-engine',
    category: 'image',
    title: 'Selfie engine v2',
    description:
      'Consistent character faces across lighting, angle, and style prompts.',
    href: '/explore?tab=explore#image',
    isNew: true,
  },
  {
    id: 'image-style-transfer',
    category: 'image',
    title: 'Style transfer controls',
    description:
      'Lock a visual aesthetic and apply it to any generated image in-session.',
    href: '/explore?tab=explore#image',
  },
  {
    id: 'memory-relationship-timeline',
    category: 'memory',
    title: 'Relationship timeline',
    description: 'Visual history of shared milestones stored per companion.',
    href: '/explore?tab=explore#memory',
    isNew: true,
  },
  {
    id: 'memory-multilingual',
    category: 'memory',
    title: 'Multilingual memory',
    description:
      'Memories now persist across language switches in a single session.',
    href: '/explore?tab=explore#memory',
  },
];

export interface ReleaseDiffDimension {
  id: string;
  label: string;
  previousRelease: string;
  latestRelease: string;
  genericSignal: string;
  profileSignal: string;
}

export interface ReleaseDiffProfile {
  title: string;
  previousVersion: string;
  latestVersion: string;
  usagePattern: string;
  dimensions: ReleaseDiffDimension[];
}

export const DEFAULT_RELEASE_DIFF_PROFILE: ReleaseDiffProfile = {
  title: 'Companion builder profile',
  previousVersion: 'Nomi V3',
  latestVersion: 'Nomi V5',
  usagePattern:
    'High-memory chats with voice check-ins and repeated image anchors',
  dimensions: [
    {
      id: 'memory-depth',
      label: 'Memory depth',
      previousRelease:
        'Recent-message recall plus manual notes for recurring lore.',
      latestRelease:
        'Relationship timeline and multilingual memory carry arcs across sessions.',
      genericSignal: 'Memory improvements shipped.',
      profileSignal:
        'Long-running companions keep milestones visible instead of restarting after each digest.',
    },
    {
      id: 'voice-quality',
      label: 'Voice quality',
      previousRelease:
        'Readable voice replies, but pauses could reset context during long calls.',
      latestRelease:
        'Lower-latency voice with long-session continuity after interruptions.',
      genericSignal: 'Voice is faster.',
      profileSignal:
        'Voice-heavy users hear smoother turns and fewer “what were we saying?” resets.',
    },
    {
      id: 'image-anchors',
      label: 'Image anchors',
      previousRelease:
        'Image prompts needed repeated character and style reminders.',
      latestRelease:
        'Selfie engine v2 plus style locks preserve visual anchors between prompts.',
      genericSignal: 'Image generation was upgraded.',
      profileSignal:
        'Image-first companions can reuse faces, poses, and mind-map anchors consistently.',
    },
  ],
};

interface UpdateDigestCardProps {
  entry: UpdateDigestEntry;
}

function UpdateDigestCard({ entry }: UpdateDigestCardProps) {
  const meta = CATEGORY_META[entry.category];
  const Icon = meta.icon;

  return (
    <Link
      href={entry.href}
      data-testid={`update-digest-card-${entry.id}`}
      className={cn(
        'group relative flex w-52 shrink-0 flex-col gap-3 rounded-xl border border-border/60 bg-card p-4',
        'transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
    >
      {entry.isNew && (
        <span
          data-testid={`update-digest-new-badge-${entry.id}`}
          className="absolute -top-2 right-2 inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary"
        >
          <Sparkles className="h-2.5 w-2.5" aria-hidden />
          New
        </span>
      )}

      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br',
          meta.colorClass
        )}
      >
        <Icon className="h-4 w-4 text-foreground/70" aria-hidden />
      </div>

      <Badge
        variant="outline"
        className={cn(
          'w-fit text-[10px] font-semibold uppercase tracking-wide',
          meta.badgeClass
        )}
        data-testid={`update-digest-category-badge-${entry.id}`}
      >
        {meta.label}
      </Badge>

      <div className="space-y-1">
        <p
          className="text-sm font-semibold leading-tight text-foreground"
          data-testid={`update-digest-title-${entry.id}`}
        >
          {entry.title}
        </p>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {entry.description}
        </p>
      </div>
    </Link>
  );
}

interface ReleaseDiffComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ReleaseDiffProfile;
}

function ReleaseDiffComparisonModal({
  open,
  onOpenChange,
  profile,
}: ReleaseDiffComparisonModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[85vh] max-w-3xl overflow-y-auto"
        data-testid="release-diff-comparison-modal"
      >
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" data-testid="release-diff-profile-label">
              Your usage profile
            </Badge>
            <Badge variant="outline">
              {profile.previousVersion} → {profile.latestVersion}
            </Badge>
          </div>
          <DialogTitle className="mt-2 flex items-center gap-2">
            <GitCompareArrows className="h-5 w-5 text-primary" aria-hidden />
            Last-two-releases diff for {profile.title}
          </DialogTitle>
          <DialogDescription data-testid="release-diff-usage-pattern">
            {profile.usagePattern}. This compares the generic update strip with
            the concrete improvements that matter for this profile.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-2 rounded-xl border border-border/70 bg-muted/30 p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid-cols-[1fr_1fr_1fr]">
            <span>Dimension</span>
            <span>Generic update strip</span>
            <span>Profile-specific improvement</span>
          </div>

          {profile.dimensions.map((dimension) => (
            <div
              key={dimension.id}
              className="grid gap-3 rounded-xl border border-border/70 bg-card p-4 sm:grid-cols-[1fr_1fr_1fr]"
              data-testid={`release-diff-row-${dimension.id}`}
            >
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  {dimension.label}
                </p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground/80">
                      {profile.previousVersion}:
                    </span>{' '}
                    {dimension.previousRelease}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground/80">
                      {profile.latestVersion}:
                    </span>{' '}
                    {dimension.latestRelease}
                  </p>
                </div>
              </div>

              <div
                className="rounded-lg border border-border/60 bg-background/70 p-3 text-sm text-muted-foreground"
                data-testid={`release-diff-generic-${dimension.id}`}
              >
                {dimension.genericSignal}
              </div>

              <div
                className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-foreground"
                data-testid={`release-diff-profile-${dimension.id}`}
              >
                {dimension.profileSignal}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface UpdateDigestRailProps {
  entries?: UpdateDigestEntry[];
  releaseDiffProfile?: ReleaseDiffProfile;
}

export function UpdateDigestRail({
  entries = DEFAULT_UPDATE_ENTRIES,
  releaseDiffProfile = DEFAULT_RELEASE_DIFF_PROFILE,
}: UpdateDigestRailProps) {
  const [releaseDiffOpen, setReleaseDiffOpen] = useState(false);

  if (entries.length === 0) return null;

  return (
    <section
      aria-label="What's new — voice, image, and memory updates"
      data-testid="update-digest-rail"
    >
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          <h2
            className="text-base font-semibold"
            data-testid="update-digest-heading"
          >
            What&apos;s new
          </h2>
          <p className="hidden text-sm text-muted-foreground sm:block">
            — voice, image &amp; memory releases
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => setReleaseDiffOpen(true)}
            data-testid="release-diff-open-button"
          >
            <GitCompareArrows className="h-3.5 w-3.5" aria-hidden />
            Compare releases
          </Button>
          <Link
            href="/explore?tab=explore"
            className="flex items-center gap-0.5 text-xs text-muted-foreground transition hover:text-primary"
            data-testid="update-digest-see-all"
          >
            See all
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        data-testid="update-digest-scroll"
      >
        {entries.map((entry) => (
          <UpdateDigestCard key={entry.id} entry={entry} />
        ))}
      </div>

      <ReleaseDiffComparisonModal
        open={releaseDiffOpen}
        onOpenChange={setReleaseDiffOpen}
        profile={releaseDiffProfile}
      />
    </section>
  );
}
