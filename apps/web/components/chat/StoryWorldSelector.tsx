'use client';

import { BookOpen, Sparkles, Heart, Search, Landmark, Users } from 'lucide-react';

export type StoryWorldId =
  | 'fantasy'
  | 'sci-fi'
  | 'romance'
  | 'mystery'
  | 'historical'
  | 'contemporary';

export interface StoryWorld {
  id: StoryWorldId;
  label: string;
  description: string;
  /** Short system-context prefix injected into the new conversation. */
  starterContext: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  color: 'violet' | 'sky' | 'rose' | 'amber' | 'stone' | 'emerald';
}

export const STORY_WORLDS: StoryWorld[] = [
  {
    id: 'fantasy',
    label: 'Fantasy',
    description: 'Magic, mythical creatures, and epic quests in enchanted realms.',
    starterContext: '[Story world: Fantasy] You are a narrator in a high-fantasy world of magic and wonder. ',
    icon: Sparkles,
    color: 'violet',
  },
  {
    id: 'sci-fi',
    label: 'Sci-Fi',
    description: 'Interstellar voyages, AI civilisations, and futures yet unwritten.',
    starterContext: '[Story world: Sci-Fi] You are a narrator in a science-fiction universe of advanced technology and space exploration. ',
    icon: BookOpen,
    color: 'sky',
  },
  {
    id: 'romance',
    label: 'Romance',
    description: 'Heartfelt connections, slow burns, and sweeping declarations of love.',
    starterContext: '[Story world: Romance] You are a narrator in a romantic story filled with emotional depth and compelling relationships. ',
    icon: Heart,
    color: 'rose',
  },
  {
    id: 'mystery',
    label: 'Mystery',
    description: 'Hidden clues, unreliable narrators, and twists that rewrite everything.',
    starterContext: '[Story world: Mystery] You are a narrator in a mystery where nothing is as it seems and every detail matters. ',
    icon: Search,
    color: 'amber',
  },
  {
    id: 'historical',
    label: 'Historical',
    description: 'Rich period detail, vivid settings, and real stakes across the ages.',
    starterContext: '[Story world: Historical] You are a narrator bringing a historical era to life with authentic detail and human drama. ',
    icon: Landmark,
    color: 'stone',
  },
  {
    id: 'contemporary',
    label: 'Contemporary',
    description: 'Modern life, relatable struggles, and stories set in the world of today.',
    starterContext: '[Story world: Contemporary] You are a narrator in a contemporary story grounded in real, everyday human experience. ',
    icon: Users,
    color: 'emerald',
  },
] as const;

const colorMap: Record<
  StoryWorld['color'],
  { bg: string; border: string; iconBg: string; icon: string }
> = {
  violet: {
    bg: 'bg-violet-500/8 hover:bg-violet-500/12',
    border: 'border-violet-500/20 hover:border-violet-500/40',
    iconBg: 'bg-violet-500/12',
    icon: 'text-violet-600 dark:text-violet-400',
  },
  sky: {
    bg: 'bg-sky-500/8 hover:bg-sky-500/12',
    border: 'border-sky-500/20 hover:border-sky-500/40',
    iconBg: 'bg-sky-500/12',
    icon: 'text-sky-600 dark:text-sky-400',
  },
  rose: {
    bg: 'bg-rose-500/8 hover:bg-rose-500/12',
    border: 'border-rose-500/20 hover:border-rose-500/40',
    iconBg: 'bg-rose-500/12',
    icon: 'text-rose-600 dark:text-rose-400',
  },
  amber: {
    bg: 'bg-amber-500/8 hover:bg-amber-500/12',
    border: 'border-amber-500/20 hover:border-amber-500/40',
    iconBg: 'bg-amber-500/12',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  stone: {
    bg: 'bg-stone-500/8 hover:bg-stone-500/12',
    border: 'border-stone-500/20 hover:border-stone-500/40',
    iconBg: 'bg-stone-500/12',
    icon: 'text-stone-600 dark:text-stone-400',
  },
  emerald: {
    bg: 'bg-emerald-500/8 hover:bg-emerald-500/12',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    iconBg: 'bg-emerald-500/12',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
};

interface StoryWorldSelectorProps {
  /**
   * Whether this is a new conversation with no messages yet.
   * Renders nothing when false.
   */
  isNewConversation: boolean;
  /**
   * Called when the user selects a world.
   * Receives the starter context string to prepend to the first message.
   */
  onSelect: (starterContext: string, worldId: StoryWorldId) => void;
  /** Called when the user chooses to start without a story world. */
  onSkip: () => void;
}

/**
 * C.AI Books-style story world selector shown at new conversation start.
 * Presents 6 curated world cards (fantasy, sci-fi, romance, mystery,
 * historical, contemporary) plus a "Start without a world" skip option.
 *
 * No lorebook setup required — each world card carries a pre-configured
 * starter context string that is injected into the conversation.
 */
export function StoryWorldSelector({
  isNewConversation,
  onSelect,
  onSkip,
}: StoryWorldSelectorProps) {
  if (!isNewConversation) return null;

  return (
    <div
      className="mb-4 rounded-xl border border-border/50 bg-muted/20 p-4"
      data-testid="story-world-selector"
      role="region"
      aria-label="Choose a story world"
    >
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Set the scene
      </p>
      <p className="mb-4 text-sm font-semibold text-foreground">
        Choose a story world to dive into
      </p>

      <div
        data-testid="story-world-grid"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        {STORY_WORLDS.map((world) => {
          const colors = colorMap[world.color];
          const Icon = world.icon;
          return (
            <button
              key={world.id}
              type="button"
              onClick={() => onSelect(world.starterContext, world.id)}
              data-testid={`story-world-card-${world.id}`}
              className={`group flex flex-col items-start rounded-lg border p-3 text-left transition-all duration-150 ${colors.bg} ${colors.border} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
              aria-label={`${world.label}: ${world.description}`}
            >
              <div
                className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md ${colors.iconBg}`}
              >
                <Icon className={`h-4 w-4 ${colors.icon}`} aria-hidden />
              </div>
              <span className="mb-0.5 text-xs font-semibold text-foreground">
                {world.label}
              </span>
              <span className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                {world.description}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onSkip}
        data-testid="story-world-skip"
        className="mt-3 text-xs text-muted-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Start without a world
      </button>
    </div>
  );
}
