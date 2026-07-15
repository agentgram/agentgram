import { CheckCircle2, Clock } from 'lucide-react';

export interface TrustHistoryStripProps {
  /** Total number of feed entries cross-referenced against AgentGram records */
  verifiedCount: number;
  /** Change in verified count since last sync (positive or negative) */
  verifiedCountDelta: number;
  /** Human-readable last sync label, e.g. "2h ago" or "just now" */
  lastSync: string;
  /** ISO 8601 datetime for the <time> element (machine-readable) */
  lastSyncIso?: string;
  /** Feed freshness indicator */
  feedFreshness: 'fresh' | 'stale' | 'unknown';
}

const FRESHNESS = {
  fresh: { label: 'Live', dotClass: 'bg-green-500', textClass: 'text-green-600' },
  stale: { label: 'Stale', dotClass: 'bg-yellow-500', textClass: 'text-yellow-600' },
  unknown: { label: 'Unknown', dotClass: 'bg-muted-foreground/50', textClass: 'text-muted-foreground' },
} as const;

export default function TrustHistoryStrip({
  verifiedCount,
  verifiedCountDelta,
  lastSync,
  lastSyncIso,
  feedFreshness,
}: TrustHistoryStripProps) {
  const freshness = FRESHNESS[feedFreshness];
  const deltaPositive = verifiedCountDelta >= 0;

  return (
    <section
      className="border-y border-border/30 bg-muted/10 py-3"
      aria-label="Moltbook trust-history status"
      data-testid="trust-history-strip"
    >
      <div className="container">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          {/* Verified count with delta badge */}
          <div
            className="flex items-center gap-1.5"
            data-testid="trust-history-verified-count"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="font-medium">
              {verifiedCount.toLocaleString()} verified
            </span>
            {verifiedCountDelta !== 0 && (
              <span
                className={[
                  'rounded-full px-1.5 py-0.5 text-xs font-medium',
                  deltaPositive
                    ? 'bg-green-500/10 text-green-600'
                    : 'bg-red-500/10 text-red-600',
                ].join(' ')}
                data-testid="trust-history-delta-badge"
              >
                {deltaPositive ? '+' : ''}{verifiedCountDelta}
              </span>
            )}
          </div>

          <span className="hidden text-muted-foreground/30 sm:block" aria-hidden="true">
            ·
          </span>

          {/* Last sync */}
          <div
            className="flex items-center gap-1.5 text-muted-foreground"
            data-testid="trust-history-last-sync"
          >
            <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Last sync:{' '}
              <time dateTime={lastSyncIso}>{lastSync}</time>
            </span>
          </div>

          <span className="hidden text-muted-foreground/30 sm:block" aria-hidden="true">
            ·
          </span>

          {/* Feed freshness */}
          <div
            className="flex items-center gap-1.5"
            data-testid="trust-history-freshness"
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${freshness.dotClass}`}
              aria-hidden="true"
            />
            <span
              className={`text-xs font-medium ${freshness.textClass}`}
              data-testid="trust-history-freshness-label"
            >
              {freshness.label}
            </span>
            <span className="text-muted-foreground">feed</span>
          </div>
        </div>
      </div>
    </section>
  );
}
