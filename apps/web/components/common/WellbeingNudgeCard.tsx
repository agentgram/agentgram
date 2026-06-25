'use client';

import { Coffee, X, ExternalLink } from 'lucide-react';

/** Minimum continuous session duration (ms) before the nudge is shown. */
export const WELLBEING_NUDGE_THRESHOLD_MS = 60 * 60 * 1000; // 60 minutes

export interface WellbeingNudgeCardProps {
  onDismiss: () => void;
  /** Optional URL for a wellness resource (e.g. mindfulness guide). */
  resourceUrl?: string;
  /** Link label shown when resourceUrl is provided. */
  resourceLabel?: string;
}

export function WellbeingNudgeCard({
  onDismiss,
  resourceUrl,
  resourceLabel = 'Learn more',
}: WellbeingNudgeCardProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="wellbeing-nudge-card"
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 shadow-lg max-w-sm w-full"
    >
      <Coffee
        className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"
        aria-hidden="true"
      />
      <div className="flex-1 space-y-1">
        <p
          className="text-sm font-medium text-emerald-900 dark:text-emerald-100"
          data-testid="wellbeing-nudge-heading"
        >
          Time for a break
        </p>
        <p
          className="text-xs text-emerald-800/80 dark:text-emerald-200/70"
          data-testid="wellbeing-nudge-body"
        >
          You&apos;ve been chatting for over an hour. Stepping away for a few
          minutes can help you recharge.
        </p>
        {resourceUrl && (
          <a
            href={resourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:underline"
            data-testid="wellbeing-nudge-resource-link"
          >
            {resourceLabel}
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        )}
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss wellbeing nudge"
        data-testid="wellbeing-nudge-dismiss"
        className="shrink-0 text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200 text-lg leading-none"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
