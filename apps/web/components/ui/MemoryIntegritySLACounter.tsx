'use client';

import { ShieldCheck } from 'lucide-react';

const INCIDENT_FREE_START_DATE = '2025-06-15';

function computeDaysSince(isoDate: string): number {
  const start = new Date(isoDate);
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((now.getTime() - start.getTime()) / msPerDay);
}

interface MemoryIntegritySLACounterProps {
  incidentFreeStartDate?: string;
}

export function MemoryIntegritySLACounter({
  incidentFreeStartDate = INCIDENT_FREE_START_DATE,
}: MemoryIntegritySLACounterProps) {
  const days = computeDaysSince(incidentFreeStartDate);

  return (
    <section
      className="border-y border-violet-500/20 bg-violet-500/5 py-14"
      aria-labelledby="memory-sla-counter-heading"
      data-testid="memory-integrity-sla-counter"
    >
      <div className="container">
        <div className="mx-auto max-w-2xl text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Memory Uptime
          </div>

          <div
            className="flex flex-col items-center gap-1"
            data-testid="memory-sla-counter-display"
          >
            <span
              className="text-7xl font-bold tabular-nums text-violet-700 dark:text-violet-300"
              data-testid="memory-sla-days-count"
              aria-live="polite"
            >
              {days}
            </span>
            <span
              className="text-2xl font-semibold text-violet-600 dark:text-violet-400"
              data-testid="memory-sla-days-label"
            >
              days
            </span>
          </div>

          <h2
            id="memory-sla-counter-heading"
            className="text-xl font-bold"
            data-testid="memory-sla-incident-free-label"
          >
            memory incident-free
          </h2>

          <p
            className="text-sm text-muted-foreground"
            data-testid="memory-sla-kindroid-note"
          >
            (vs. Kindroid Feb 2026 drift)
          </p>

          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            AgentGram has recorded zero memory drift incidents since launch. In February 2026,
            Kindroid experienced a documented memory drift event affecting user continuity.
            Our architecture prevents this class of failure by design.
          </p>

          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-400"
            data-testid="memory-sla-badge"
          >
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Continuous memory integrity since launch
          </span>
        </div>
      </div>
    </section>
  );
}
