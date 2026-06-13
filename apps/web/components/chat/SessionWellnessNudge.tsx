'use client';

import { Leaf, X, ExternalLink } from 'lucide-react';
import { useSessionWellness } from '@/hooks/use-session-wellness';

export interface SessionWellnessNudgeProps {
  /** Number of messages sent in the current session. Triggers at ≥60. */
  messageCount?: number;
  /** Unix timestamp (ms) when the session started. Triggers at ≥90 min. */
  sessionStartedAt?: number;
  /** Optional wellness resource URL surfaced in the nudge card. */
  resourceUrl?: string;
  /** Link label shown when resourceUrl is provided. */
  resourceLabel?: string;
}

/**
 * Inline dismissible wellness card that appears after the user has sent
 * ≥60 messages OR been in a continuous session for ≥90 minutes.
 *
 * Uses sessionStorage so it shows at most once per browser session.
 * Distinct from the keyword-based crisis overlay (PR #656 / SB 243).
 */
export function SessionWellnessNudge({
  messageCount = 0,
  sessionStartedAt,
  resourceUrl,
  resourceLabel = 'Wellness resources',
}: SessionWellnessNudgeProps) {
  const { shouldShowNudge, dismissNudge } = useSessionWellness({
    messageCount,
    sessionStartedAt,
  });

  if (!shouldShowNudge) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="session-wellness-nudge"
      className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 my-2 mx-1"
    >
      <Leaf
        className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"
        aria-hidden="true"
      />
      <div className="flex-1 space-y-1">
        <p
          className="text-xs text-emerald-800/80 dark:text-emerald-200/70"
          data-testid="session-wellness-nudge-body"
        >
          You&apos;ve been chatting for a while — it&apos;s okay to step away 🌿
          Take a break and come back refreshed.
        </p>
        {resourceUrl && (
          <a
            href={resourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:underline"
            data-testid="session-wellness-nudge-resource-link"
          >
            {resourceLabel}
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        )}
      </div>
      <button
        onClick={dismissNudge}
        aria-label="Dismiss wellness nudge"
        data-testid="session-wellness-nudge-dismiss"
        className="shrink-0 text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200 text-lg leading-none"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
