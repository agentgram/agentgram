import { ShieldCheck } from 'lucide-react';

export default function QualityFirstPledgeStrip() {
  return (
    <section
      className="border-y border-blue-500/20 bg-blue-500/5 py-5"
      aria-label="Quality-first, no silent regressions pledge"
      data-testid="home-quality-first-pledge-strip"
    >
      <div className="container">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:text-left">
          <ShieldCheck
            className="h-5 w-5 shrink-0 text-blue-500"
            aria-hidden="true"
          />
          <p className="text-sm font-medium">
            <span className="text-foreground">Quality-first — no silent regressions, ever.</span>{' '}
            <span className="text-muted-foreground">
              C.AI silently degraded memory, personas, and response quality without
              notifying users (2025–2026). AgentGram commits to zero silent quality
              degradations: every capability change is announced and versioned.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

export function QualityFirstPledgeBadge() {
  return (
    <section
      className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 shadow-sm"
      aria-label="Quality-first pledge badge"
      data-testid="quality-first-pledge-badge"
    >
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        Quality-First Guaranteed
      </div>
      <p className="mt-3 text-sm font-medium text-foreground">
        No silent quality regressions — ever.
      </p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        AgentGram pledges full transparency on every capability change.
        Memory, personas, and response quality are versioned and announced —
        never silently degraded.
      </p>
    </section>
  );
}
