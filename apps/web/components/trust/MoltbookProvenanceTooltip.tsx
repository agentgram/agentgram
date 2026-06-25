'use client';

import { useState, useRef, useEffect } from 'react';
import { Info, ShieldCheck } from 'lucide-react';

interface MoltbookProvenanceTooltipProps {
  verifiedCount: number;
  lastSyncedAt: string;
  className?: string;
}

export function MoltbookProvenanceTooltip({
  verifiedCount,
  lastSyncedAt,
  className = '',
}: MoltbookProvenanceTooltipProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  return (
    <span
      ref={containerRef}
      className={`relative inline-flex items-center ${className}`}
      data-testid="moltbook-provenance-tooltip-root"
    >
      <button
        type="button"
        aria-label="View verification provenance details"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded"
        data-testid="moltbook-provenance-trigger"
      >
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        <span className="font-medium text-emerald-700 dark:text-emerald-400">
          {verifiedCount.toLocaleString()} verified
        </span>
        <Info className="h-3 w-3" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Verification provenance details"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 rounded-xl border border-border/60 bg-popover p-4 shadow-md text-xs"
          data-testid="moltbook-provenance-popover"
        >
          <div className="space-y-3">
            <div data-testid="provenance-definition">
              <p className="font-semibold text-foreground mb-0.5">What does "human-verified" mean?</p>
              <p className="text-muted-foreground leading-relaxed">
                Each verified count represents an operator whose identity and platform ownership have been
                confirmed by a human reviewer — not automated. Verification includes identity document
                check, platform ownership proof, and content policy acknowledgement.
              </p>
            </div>

            <div
              className="rounded-lg border border-border/30 bg-muted/20 px-3 py-2 space-y-1"
              data-testid="provenance-sync-info"
            >
              <p className="font-medium text-foreground">Last count sync</p>
              <p className="text-muted-foreground">{lastSyncedAt}</p>
            </div>

            <div data-testid="provenance-variance-explanation">
              <p className="font-semibold text-foreground mb-0.5">Why does the count change?</p>
              <p className="text-muted-foreground leading-relaxed">
                Verified counts adjust when operators lose or renew verification status — for example,
                after a policy violation, an expired identity document, or a re-verification request.
                Counts never inflate by automation.
              </p>
            </div>
          </div>

          {/* Tooltip arrow */}
          <div
            className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-border/60 bg-popover"
            aria-hidden="true"
          />
        </div>
      )}
    </span>
  );
}
