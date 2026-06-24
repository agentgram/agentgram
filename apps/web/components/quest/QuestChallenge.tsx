'use client';

import { useState } from 'react';
import { Map, Sparkles, Heart, CheckCircle2, Circle } from 'lucide-react';
import { useQuestProgress } from '@/hooks/use-quest-progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QUESTS } from '@/lib/quests';
import type { Quest } from '@/lib/quests';

const COLOR_MAP = {
  violet: {
    bg: 'bg-violet-500/8 hover:bg-violet-500/12',
    border: 'border-violet-500/20 hover:border-violet-500/40',
    selectedBorder: 'border-violet-500/60 bg-violet-500/10',
    iconBg: 'bg-violet-500/12',
    icon: 'text-violet-600 dark:text-violet-400',
    badge: 'border-violet-500/25 bg-violet-500/8 text-violet-700 dark:text-violet-400',
    progress: 'bg-violet-500',
    cta: 'bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-500 dark:hover:bg-violet-600',
  },
  amber: {
    bg: 'bg-amber-500/8 hover:bg-amber-500/12',
    border: 'border-amber-500/20 hover:border-amber-500/40',
    selectedBorder: 'border-amber-500/60 bg-amber-500/10',
    iconBg: 'bg-amber-500/12',
    icon: 'text-amber-600 dark:text-amber-400',
    badge: 'border-amber-500/25 bg-amber-500/8 text-amber-700 dark:text-amber-400',
    progress: 'bg-amber-500',
    cta: 'bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600',
  },
  rose: {
    bg: 'bg-rose-500/8 hover:bg-rose-500/12',
    border: 'border-rose-500/20 hover:border-rose-500/40',
    selectedBorder: 'border-rose-500/60 bg-rose-500/10',
    iconBg: 'bg-rose-500/12',
    icon: 'text-rose-600 dark:text-rose-400',
    badge: 'border-rose-500/25 bg-rose-500/8 text-rose-700 dark:text-rose-400',
    progress: 'bg-rose-500',
    cta: 'bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-500 dark:hover:bg-rose-600',
  },
} as const;

const QUEST_ICONS: Record<Quest['id'], React.ElementType> = {
  'journey-of-connection': Heart,
  'mystery-of-the-unknown': Sparkles,
  'building-trust': Map,
};

interface QuestProgressProps {
  currentPart: number;
  color: Quest['color'];
}

function QuestProgress({ currentPart, color }: QuestProgressProps) {
  const colors = COLOR_MAP[color];
  return (
    <div
      className="flex items-center gap-2"
      data-testid="quest-progress"
      aria-label={`Quest progress: Part ${currentPart} of 3`}
    >
      {([1, 2, 3] as const).map((part) => {
        const done = part < currentPart;
        const active = part === currentPart;
        return (
          <div
            key={part}
            className="flex items-center gap-1"
            data-testid={`quest-progress-part-${part}`}
          >
            {done ? (
              <CheckCircle2
                className={`h-4 w-4 ${colors.icon}`}
                aria-hidden="true"
              />
            ) : (
              <Circle
                className={`h-4 w-4 ${active ? colors.icon : 'text-muted-foreground/40'}`}
                aria-hidden="true"
              />
            )}
            <span
              className={`text-xs font-medium ${active ? colors.icon : done ? colors.icon : 'text-muted-foreground/50'}`}
            >
              Part {part}
            </span>
            {part < 3 && (
              <span
                className={`mx-1 h-px w-5 rounded ${done ? colors.progress : 'bg-border'}`}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface QuestCardProps {
  quest: Quest;
  isSelected: boolean;
  onSelect: (questId: string) => void;
  currentPart: number;
}

function QuestCard({ quest, isSelected, onSelect, currentPart }: QuestCardProps) {
  const colors = COLOR_MAP[quest.color];
  const Icon = QUEST_ICONS[quest.id] ?? Map;

  return (
    <article
      data-testid={`quest-card-${quest.id}`}
      className={`group cursor-pointer rounded-xl border p-5 transition-all duration-200 ${
        isSelected
          ? colors.selectedBorder
          : `${colors.bg} ${colors.border}`
      }`}
      onClick={() => onSelect(quest.id)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(quest.id);
        }
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colors.iconBg}`}
        >
          <Icon className={`h-5 w-5 ${colors.icon}`} aria-hidden="true" />
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] ${colors.badge}`}
          data-testid={`quest-color-badge-${quest.id}`}
        >
          3-Part Arc
        </span>
      </div>

      <h3 className="mb-1.5 text-sm font-semibold leading-snug text-foreground">
        {quest.title}
      </h3>
      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
        {quest.description}
      </p>

      <QuestProgress currentPart={currentPart} color={quest.color} />

      <div
        className="mt-4 rounded-lg border border-border/60 bg-background/60 p-3"
        data-testid={`quest-daily-prompt-${quest.id}`}
      >
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Today&apos;s prompt — Part {currentPart}
        </p>
        <p className="text-xs leading-relaxed text-foreground">
          &ldquo;{quest.parts[currentPart - 1].dailyPrompt}&rdquo;
        </p>
      </div>
    </article>
  );
}

export interface QuestChallengeProps {
  /** Called when user confirms quest start */
  onStart?: (questId: string) => void;
}

export function QuestChallenge({ onStart }: QuestChallengeProps) {
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const { getQuestPart, startQuestSession } = useQuestProgress();

  const selectedQuest = QUESTS.find((q) => q.id === selectedQuestId) ?? null;

  function handleStart() {
    if (!selectedQuestId) return;
    startQuestSession(selectedQuestId);
    onStart?.(selectedQuestId);
  }

  return (
    <Card
      className="border-border/50 bg-card/50 backdrop-blur-sm"
      data-testid="quest-challenge"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5 text-primary" aria-hidden="true" />
          Quest Challenges
        </CardTitle>
        <CardDescription>
          Choose a 3-part story arc to guide your conversations. Each quest
          gives you a daily check-in prompt so you always know where to start.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div
          className="grid gap-4 sm:grid-cols-3"
          data-testid="quest-selection-panel"
          role="group"
          aria-label="Available quests"
        >
          {QUESTS.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              isSelected={selectedQuestId === quest.id}
              onSelect={setSelectedQuestId}
              currentPart={getQuestPart(quest.id)}
            />
          ))}
        </div>

        {selectedQuest && (
          <div
            className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/30 px-4 py-3"
            data-testid="quest-start-bar"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {selectedQuest.title}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Part {getQuestPart(selectedQuest.id)} of 3 — {selectedQuest.parts[getQuestPart(selectedQuest.id) - 1].title}
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleStart}
              data-testid="quest-start-cta"
              className={`shrink-0 ${COLOR_MAP[selectedQuest.color].cta}`}
            >
              Begin Quest
            </Button>
          </div>
        )}

        {!selectedQuest && (
          <p
            className="text-center text-xs text-muted-foreground"
            data-testid="quest-no-selection-hint"
          >
            Select a quest above to see your starting prompt and begin
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export { Badge };
