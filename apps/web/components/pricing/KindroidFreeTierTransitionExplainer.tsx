'use client';

import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Route,
  ShieldCheck,
} from 'lucide-react';

const litePathSteps = [
  {
    label: '1. Lite starts as a preview',
    value:
      'Core chat stays available while usage, memory, and media limits are visible upfront.',
    description:
      'Users can decide whether the companion is worth keeping before any checkout screen appears.',
    icon: Route,
    testId: 'kindroid-lite-path-preview',
  },
  {
    label: '2. Transition date is explicit',
    value:
      'If free access becomes time-boxed, the end date and next checkpoint are shown together.',
    description:
      'No one has to infer whether Lite is still a permanent home, a trial, or a paid-plan bridge.',
    icon: CalendarClock,
    testId: 'kindroid-lite-path-date',
  },
  {
    label: '3. Upgrade impact is bounded',
    value:
      'Memories, persona tone, and export options are listed before a user chooses to upgrade.',
    description:
      'The decision is framed around what remains safe, what changes, and what can be downloaded.',
    icon: ShieldCheck,
    testId: 'kindroid-lite-path-impact',
  },
] as const;

const policyAnswers = [
  'Lite conversations stay readable during the transition window.',
  'Before a free access window ends, users see save, export, and upgrade choices in one place.',
  'Paid access is never presented as a surprise lock; the CTA explains which limits lift and which safeguards remain.',
] as const;

export function KindroidFreeTierTransitionExplainer() {
  return (
    <div
      className="mx-auto max-w-3xl rounded-2xl border border-amber-500/25 bg-amber-500/5 px-6 py-6 shadow-sm"
      data-testid="kindroid-free-tier-transition-explainer"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300"
            data-testid="kindroid-free-tier-eyebrow"
          >
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            Free-tier transition explainer
          </p>
          <h2
            className="text-xl font-bold text-foreground"
            data-testid="kindroid-free-tier-heading"
          >
            Explain the bounded Lite path before free access stops feeling
            permanent
          </h2>
          <p className="text-sm text-muted-foreground">
            Kindroid is reframing indefinite free Lite access as a bounded
            trial. AgentGram answers that anxiety directly: users see how long
            the free path lasts, what happens when it changes, and which
            companion data stays safe before choosing a paid plan.
          </p>
        </div>
        <div
          className="shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm"
          data-testid="kindroid-free-tier-policy-badge"
        >
          <p className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            No surprise lockout
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Trial limits, transition dates, and save/export options stay visible
          </p>
        </div>
      </div>

      <div
        className="mb-4 grid gap-3 md:grid-cols-3"
        data-testid="kindroid-lite-path-grid"
      >
        {litePathSteps.map((step) => {
          const Icon = step.icon;

          return (
            <div
              key={step.label}
              className="rounded-xl border border-border/40 bg-background/70 p-4"
              data-testid={step.testId}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                <Icon
                  className="h-5 w-5 text-amber-700 dark:text-amber-300"
                  aria-hidden="true"
                />
              </div>
              <p className="text-sm font-semibold text-foreground">
                {step.label}
              </p>
              <p className="mt-1 text-sm font-medium text-amber-700 dark:text-amber-300">
                {step.value}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

      <div
        className="rounded-xl border border-border/40 bg-background/70 p-4"
        data-testid="kindroid-free-tier-policy-faq"
      >
        <p className="text-sm font-semibold text-foreground">
          What happens when free access is no longer permanent?
        </p>
        <div className="mt-3 space-y-2 text-xs text-muted-foreground">
          {policyAnswers.map((answer) => (
            <p
              key={answer}
              className="rounded-lg border border-border/30 bg-background/60 px-3 py-2"
            >
              {answer}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
