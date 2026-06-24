'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';

export interface CounterSyncState {
  isSyncing?: boolean;
  isStale?: boolean;
  /** Minutes since last successful fetch. Rendered when isStale=true. */
  staleMinutes?: number;
  hasError?: boolean;
}

interface CounterSyncDiagnosticProps extends CounterSyncState {
  className?: string;
}

/**
 * Inline diagnostic badge shown alongside live platform counters.
 * Renders nothing in the happy path (fresh, not syncing, no error).
 */
export function CounterSyncDiagnostic({
  isSyncing = false,
  isStale = false,
  staleMinutes,
  hasError = false,
  className = '',
}: CounterSyncDiagnosticProps) {
  if (isSyncing) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs text-muted-foreground ${className}`}
        data-testid="counter-sync-syncing"
        aria-live="polite"
        aria-label="Counter data is syncing"
      >
        <RefreshCw
          className="h-3 w-3 animate-spin text-primary"
          aria-hidden="true"
        />
        <span>Syncing…</span>
      </span>
    );
  }

  if (hasError) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs text-destructive ${className}`}
        data-testid="counter-sync-error"
        aria-live="assertive"
        title="Counter data temporarily unavailable"
        aria-label="Counter data temporarily unavailable"
      >
        <AlertCircle className="h-3 w-3" aria-hidden="true" />
        <span>!</span>
      </span>
    );
  }

  if (isStale) {
    const label =
      staleMinutes !== undefined
        ? `Last updated ${staleMinutes}m ago`
        : 'Data may be outdated';

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-sm border border-amber-400/40 bg-amber-50/60 px-1.5 py-0.5 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 ${className}`}
        data-testid="counter-sync-stale"
        aria-live="polite"
        aria-label={label}
      >
        {label}
      </span>
    );
  }

  return null;
}
