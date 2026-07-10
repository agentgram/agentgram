'use client';

import { ArrowRight, BrainCircuit, CheckCircle2, Mic2, RefreshCw, ShieldCheck } from 'lucide-react';

const changeSteps = [
  {
    label: 'Plan changes',
    replika: 'Users often discover Pro, Plus, or Ultra differences only after an update changes the paywall copy.',
    agentgram: 'Plan differences stay listed in one strip before checkout, including what is included now and what never moves tiers.',
    icon: ShieldCheck,
    testId: 'update-change-plan-differences',
  },
  {
    label: 'Memory changes',
    replika: 'Memory dashboards can shift how saved facts feel without a concise before/after summary.',
    agentgram: 'Memory notes call out saved facts, corrections, and export controls before a user commits to a plan.',
    icon: BrainCircuit,
    testId: 'update-change-memory-changes',
  },
  {
    label: 'Voice changes',
    replika: 'Voice quality, mode, and latency changes are easy to miss until the next call starts.',
    agentgram: 'Voice readiness shows quality, mode, and latency in the same explainer so users know what changed first.',
    icon: Mic2,
    testId: 'update-change-voice-changes',
  },
] as const;

export function ReplikaUpdateChangeExplainerStrip() {
  return (
    <div
      className="mx-auto max-w-3xl rounded-2xl border border-rose-500/25 bg-rose-500/5 px-6 py-6 shadow-sm"
      data-testid="replika-update-change-explainer-strip"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p
            className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300"
            data-testid="update-change-eyebrow"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Update-change explainer
          </p>
          <h2
            className="text-xl font-bold text-foreground"
            data-testid="update-change-heading"
          >
            Show what changed before users bounce
          </h2>
          <p className="text-sm text-muted-foreground">
            Replika-style updates can leave users comparing plan copy, memory behavior,
            and voice controls after the fact. AgentGram surfaces the delta in one
            pre-checkout memo so the upgrade feels predictable.
          </p>
        </div>
        <div
          className="shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm"
          data-testid="update-change-memo-badge"
        >
          <p className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Memo first
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Plan + memory + voice deltas summarized before checkout
          </p>
        </div>
      </div>

      <div
        className="grid gap-3 md:grid-cols-3"
        data-testid="update-change-explainer-columns"
      >
        {changeSteps.map((step) => {
          const Icon = step.icon;

          return (
            <div
              key={step.label}
              className="rounded-xl border border-border/40 bg-background/70 p-4"
              data-testid={step.testId}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10">
                <Icon className="h-5 w-5 text-rose-700 dark:text-rose-300" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-foreground">{step.label}</p>
              <div className="mt-3 space-y-3 text-xs leading-relaxed text-muted-foreground">
                <p>
                  <span className="font-semibold text-destructive/80">Replika:</span>{' '}
                  {step.replika}
                </p>
                <p>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">AgentGram:</span>{' '}
                  {step.agentgram}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="mt-4 flex flex-col gap-2 rounded-xl border border-border/40 bg-background/70 p-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
        data-testid="update-change-before-after-memo"
      >
        <p>
          Before/after memo: current plan benefits, memory handling, and voice readiness stay visible in one place.
        </p>
        <p className="inline-flex items-center gap-1.5 font-semibold text-rose-700 dark:text-rose-300">
          Fewer surprise updates
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </p>
      </div>
    </div>
  );
}
