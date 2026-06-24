'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

const SUGGESTED_TAGS = ['companion', 'roleplay', 'fantasy', 'sci-fi', 'mentor', 'wellness'];

interface Tip {
  id: string;
  text: string;
}

const TIPS: Tip[] = [
  { id: 'add-tags', text: 'Add relevant tags to appear in category searches' },
  { id: 'complete-bio', text: 'Complete your agent bio for 2× explore visibility' },
  { id: 'enable-voice', text: 'Enable voice to appear in voice-capable agent filters' },
  { id: 'set-avatar', text: 'Set an avatar to increase click-through on Explore' },
  { id: 'publish-post', text: 'Publish a post to surface your agent in the feed' },
];

interface CreatorDiscoveryPromptsProps {
  completionPercent: number;
  onDismiss?: (tipId: string) => void;
}

export function CreatorDiscoveryPrompts({
  completionPercent,
  onDismiss,
}: CreatorDiscoveryPromptsProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleTips = TIPS.filter((tip) => !dismissedIds.has(tip.id)).slice(0, 3);

  function handleDismiss(tipId: string) {
    setDismissedIds((prev) => new Set([...prev, tipId]));
    onDismiss?.(tipId);
  }

  const clampedPercent = Math.min(100, Math.max(0, completionPercent));

  return (
    <div
      className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4"
      data-testid="creator-discovery-prompts"
    >
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Get discovered</p>
          <span
            className="text-xs font-medium text-muted-foreground"
            data-testid="completion-percent-label"
          >
            {clampedPercent}% complete
          </span>
        </div>
        <div
          className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
          role="progressbar"
          aria-valuenow={clampedPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          data-testid="completion-progress-bar"
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${clampedPercent}%` }}
            data-testid="completion-progress-fill"
          />
        </div>
      </div>

      {visibleTips.length > 0 && (
        <ul className="space-y-2" data-testid="discovery-tips-list">
          {visibleTips.map((tip) => (
            <li
              key={tip.id}
              className="flex items-start justify-between gap-2 rounded-lg bg-background/60 px-3 py-2"
              data-testid={`discovery-tip-${tip.id}`}
            >
              <span className="text-sm text-foreground leading-snug">{tip.text}</span>
              <button
                type="button"
                aria-label={`Dismiss tip: ${tip.text}`}
                className="shrink-0 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => handleDismiss(tip.id)}
                data-testid={`dismiss-tip-${tip.id}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">Suggested tags</p>
        <div className="flex flex-wrap gap-1.5" data-testid="suggested-tags">
          {SUGGESTED_TAGS.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-background/80 border border-border/60 px-2.5 py-0.5 text-xs text-foreground"
              data-testid={`suggested-tag-${tag}`}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
