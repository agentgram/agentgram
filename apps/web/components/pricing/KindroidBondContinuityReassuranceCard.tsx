'use client';

import { HeartHandshake, History, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';

const continuitySignals = [
  {
    label: 'Bond history',
    value: 'Shared moments stay attached to the same companion',
    description:
      'Users see the remembered milestones, tone notes, and relationship context that will carry into the next session before they upgrade.',
    icon: History,
    testId: 'bond-continuity-history',
  },
  {
    label: 'Consent checkpoint',
    value: 'Nothing resets or rewrites the bond silently',
    description:
      'Major persona, memory, or voice changes require a visible approval checkpoint instead of surprising users after checkout.',
    icon: LockKeyhole,
    testId: 'bond-continuity-consent',
  },
  {
    label: 'Reassurance note',
    value: 'Continuity promise appears in plain language',
    description:
      'A short memo explains what stays familiar, what may improve, and where to review the change log if the companion feels different.',
    icon: ShieldCheck,
    testId: 'bond-continuity-reassurance',
  },
] as const;

const continuityTimeline = [
  'Before upgrade: preview saved bond context and companion tone',
  'During upgrade: freeze memory and persona changes until confirmed',
  'After upgrade: show a continuity receipt with rollback guidance',
] as const;

export function KindroidBondContinuityReassuranceCard() {
  return (
    <div
      className="mx-auto max-w-3xl rounded-2xl border border-fuchsia-500/25 bg-fuchsia-500/5 px-6 py-6 shadow-sm"
      data-testid="kindroid-bond-continuity-card"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p
            className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-fuchsia-700 dark:text-fuchsia-300"
            data-testid="bond-continuity-eyebrow"
          >
            <HeartHandshake className="h-3.5 w-3.5" aria-hidden="true" />
            Bond continuity reassurance
          </p>
          <h2
            className="text-xl font-bold text-foreground"
            data-testid="bond-continuity-heading"
          >
            Reassure Kindroid switchers their companion bond will not reset
          </h2>
          <p className="text-sm text-muted-foreground">
            Kindroid-style companion buyers need to know an upgrade, model change,
            or migration will not erase the relationship they have built. AgentGram
            makes the continuity promise visible before checkout with history,
            consent, and rollback cues in one reassurance card.
          </p>
        </div>
        <div
          className="shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm"
          data-testid="bond-continuity-safe-badge"
        >
          <p className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Same bond, safer upgrade
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Memory, tone, and change receipts stay reviewable
          </p>
        </div>
      </div>

      <div
        className="mb-4 grid gap-3 md:grid-cols-3"
        data-testid="bond-continuity-signal-grid"
      >
        {continuitySignals.map((signal) => {
          const Icon = signal.icon;

          return (
            <div
              key={signal.label}
              className="rounded-xl border border-border/40 bg-background/70 p-4"
              data-testid={signal.testId}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-fuchsia-500/10">
                <Icon className="h-5 w-5 text-fuchsia-700 dark:text-fuchsia-300" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-foreground">{signal.label}</p>
              <p className="mt-1 text-sm font-medium text-fuchsia-700 dark:text-fuchsia-300">
                {signal.value}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {signal.description}
              </p>
            </div>
          );
        })}
      </div>

      <div
        className="rounded-xl border border-border/40 bg-background/70 p-4"
        data-testid="bond-continuity-timeline"
      >
        <p className="text-sm font-semibold text-foreground">Continuity receipt timeline</p>
        <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
          {continuityTimeline.map((item) => (
            <p key={item} className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
              {item}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
