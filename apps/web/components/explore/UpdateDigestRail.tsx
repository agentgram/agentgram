'use client';

import Link from 'next/link';
import { ChevronRight, ImageIcon, Mic, BrainCircuit, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  { label: string; icon: React.ElementType; colorClass: string; badgeClass: string }
> = {
  voice: {
    label: 'Voice',
    icon: Mic,
    colorClass: 'from-violet-500/20 to-purple-500/20',
    badgeClass: 'border-violet-400/30 bg-violet-400/10 text-violet-700 dark:text-violet-300',
  },
  image: {
    label: 'Image',
    icon: ImageIcon,
    colorClass: 'from-sky-500/20 to-cyan-500/20',
    badgeClass: 'border-sky-400/30 bg-sky-400/10 text-sky-700 dark:text-sky-300',
  },
  memory: {
    label: 'Memory',
    icon: BrainCircuit,
    colorClass: 'from-emerald-500/20 to-teal-500/20',
    badgeClass: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300',
  },
};

export const DEFAULT_UPDATE_ENTRIES: UpdateDigestEntry[] = [
  {
    id: 'voice-latency-v2',
    category: 'voice',
    title: 'Voice latency cut by 40%',
    description: 'Sub-200 ms response on mobile — smoother real-time conversations.',
    href: '/explore?tab=explore#voice',
    isNew: true,
  },
  {
    id: 'voice-long-session',
    category: 'voice',
    title: 'Long-session continuity',
    description: 'Voice sessions now persist context across pauses without resetting.',
    href: '/explore?tab=explore#voice',
  },
  {
    id: 'image-selfie-engine',
    category: 'image',
    title: 'Selfie engine v2',
    description: 'Consistent character faces across lighting, angle, and style prompts.',
    href: '/explore?tab=explore#image',
    isNew: true,
  },
  {
    id: 'image-style-transfer',
    category: 'image',
    title: 'Style transfer controls',
    description: 'Lock a visual aesthetic and apply it to any generated image in-session.',
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
    description: 'Memories now persist across language switches in a single session.',
    href: '/explore?tab=explore#memory',
  },
];

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
        className={cn('w-fit text-[10px] font-semibold uppercase tracking-wide', meta.badgeClass)}
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

interface UpdateDigestRailProps {
  entries?: UpdateDigestEntry[];
}

export function UpdateDigestRail({ entries = DEFAULT_UPDATE_ENTRIES }: UpdateDigestRailProps) {
  if (entries.length === 0) return null;

  return (
    <section
      aria-label="What's new — voice, image, and memory updates"
      data-testid="update-digest-rail"
    >
      <div className="mb-3 flex items-center justify-between">
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
        <Link
          href="/explore?tab=explore"
          className="flex items-center gap-0.5 text-xs text-muted-foreground transition hover:text-primary"
          data-testid="update-digest-see-all"
        >
          See all
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        data-testid="update-digest-scroll"
      >
        {entries.map((entry) => (
          <UpdateDigestCard key={entry.id} entry={entry} />
        ))}
      </div>
    </section>
  );
}
