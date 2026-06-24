'use client';

import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LorebookFactAutoSuggestProps {
  /** Number of exchanges in the current conversation. */
  messageCount: number;
  /** The fact text to suggest saving, or null if nothing to suggest. */
  suggestedFact: string | null;
  /** Called when the user taps the save (checkmark) button. */
  onSave: () => void;
  /** Called when the user dismisses the chip. */
  onDismiss: () => void;
  /** Optional additional class names for the chip wrapper. */
  className?: string;
}

/**
 * Dismissible chip that surfaces above the composer after 5+ conversation
 * exchanges when a potential lorebook fact has been extracted from recent
 * messages. One tap saves the fact to the lorebook; another tap dismisses.
 *
 * Renders nothing when `messageCount < 5` or `suggestedFact` is null.
 */
export function LorebookFactAutoSuggest({
  messageCount,
  suggestedFact,
  onSave,
  onDismiss,
  className,
}: LorebookFactAutoSuggestProps) {
  if (messageCount < 5 || suggestedFact === null) {
    return null;
  }

  // Trim the displayed excerpt to keep the chip compact.
  const excerpt =
    suggestedFact.length > 48
      ? suggestedFact.slice(0, 45).trimEnd() + '…'
      : suggestedFact;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Lorebook fact suggestion"
      data-testid="lorebook-fact-auto-suggest"
      className={cn(
        'flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5',
        'px-3 py-1.5 text-sm',
        'animate-in slide-in-from-top-2 duration-200',
        className
      )}
    >
      <span className="flex-1 truncate text-foreground/80">
        <span className="font-medium text-foreground">Save this detail?</span>
        {' '}
        <span
          data-testid="lorebook-fact-excerpt"
          className="text-muted-foreground"
        >
          {excerpt}
        </span>
      </span>

      <button
        type="button"
        onClick={onSave}
        aria-label={`Save fact: ${suggestedFact}`}
        data-testid="lorebook-fact-save"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-80"
      >
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss lorebook suggestion"
        data-testid="lorebook-fact-dismiss"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
