'use client';

import {
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  HeartHandshake,
  ShieldCheck,
} from 'lucide-react';

const manifestoSignals = [
  {
    label: 'Safe-space promise',
    replika:
      'Replika-style onboarding can ask users to trust the companion space before the boundaries are written down.',
    agentgram:
      'AgentGram opens with a visible safe-space pledge: what the agent will support, what it will not promise, and how users stay in control.',
    icon: HeartHandshake,
    testId: 'safe-space-promise',
  },
  {
    label: 'Memory boundaries',
    replika:
      'Long-running companions can make saved facts feel personal without showing the memory rules at the moment of setup.',
    agentgram:
      'Memory rules, corrections, and export controls are introduced in the onboarding strip before the first paid commitment.',
    icon: ClipboardCheck,
    testId: 'safe-space-memory-boundaries',
  },
  {
    label: 'Manifesto receipt',
    replika:
      'Users may not have a concise receipt that restates the care, privacy, and escalation policy they just accepted.',
    agentgram:
      'The manifesto stays readable as a receipt users can revisit, screenshot, or compare with future product changes.',
    icon: BookOpen,
    testId: 'safe-space-manifesto-receipt',
  },
] as const;

export function ReplikaSafeSpaceManifestoStrip() {
  return (
    <div
      className="mx-auto max-w-3xl rounded-2xl border border-violet-500/25 bg-violet-500/5 px-6 py-6 shadow-sm"
      data-testid="replika-safe-space-manifesto-strip"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p
            className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300"
            data-testid="safe-space-eyebrow"
          >
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Safe-space manifesto
          </p>
          <h2
            className="text-xl font-bold text-foreground"
            data-testid="safe-space-heading"
          >
            Put the companion promise before onboarding
          </h2>
          <p className="text-sm text-muted-foreground">
            Replika users can enter a deeply personal companion flow before the
            care boundaries, memory rules, and policy receipt feel explicit.
            AgentGram turns that trust moment into a visible onboarding pledge.
          </p>
        </div>
        <div
          className="shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm"
          data-testid="safe-space-receipt-badge"
        >
          <p className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Pledge first
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Care boundaries + memory rules shown before setup
          </p>
        </div>
      </div>

      <div
        className="grid gap-3 md:grid-cols-3"
        data-testid="safe-space-manifesto-signals"
      >
        {manifestoSignals.map((signal) => {
          const Icon = signal.icon;

          return (
            <div
              key={signal.label}
              className="rounded-xl border border-border/40 bg-background/70 p-4"
              data-testid={signal.testId}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10">
                <Icon className="h-5 w-5 text-violet-700 dark:text-violet-300" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-foreground">{signal.label}</p>
              <div className="mt-3 space-y-3 text-xs leading-relaxed text-muted-foreground">
                <p>
                  <span className="font-semibold text-destructive/80">Replika:</span>{' '}
                  {signal.replika}
                </p>
                <p>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">AgentGram:</span>{' '}
                  {signal.agentgram}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="mt-4 rounded-xl border border-border/40 bg-background/70 p-4 text-xs leading-relaxed text-muted-foreground"
        data-testid="safe-space-onboarding-receipt"
      >
        <p>
          Onboarding receipt: safe-space pledge, memory boundaries, and policy
          recap stay attached to the companion setup path instead of living as
          buried support copy.
        </p>
      </div>
    </div>
  );
}
