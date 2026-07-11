'use client';

import { ArrowRight, BrainCircuit, CheckCircle2, FileText, LifeBuoy, ShieldAlert } from 'lucide-react';

const migrationNoticeSteps = [
  {
    label: 'Model retirement notice',
    nomi: 'Nomi introduced Aurora while retiring Odyssey after disclosing a safety vulnerability in crisis conversations.',
    agentgram: 'AgentGram keeps model changes, retirement dates, and user-impact notes visible before checkout.',
    icon: ShieldAlert,
    testId: 'nomi-aurora-retirement-model-notice',
  },
  {
    label: 'Memory migration checklist',
    nomi: 'Companion model changes can leave users wondering what happens to long-running memories and relationship context.',
    agentgram: 'A guided checklist separates saved memories, safety changes, and companion tone so users know what will carry over.',
    icon: BrainCircuit,
    testId: 'nomi-aurora-retirement-memory-checklist',
  },
  {
    label: 'Crisis-support handoff',
    nomi: 'Aurora was framed around stronger responses when users express self-harm or high-stakes distress.',
    agentgram: 'Support routing, acknowledgement, and recovery resources stay attached to the migration note rather than hidden in release copy.',
    icon: LifeBuoy,
    testId: 'nomi-aurora-retirement-crisis-handoff',
  },
] as const;

export function NomiAuroraRetirementNotice() {
  return (
    <div
      className="mx-auto max-w-3xl rounded-2xl border border-sky-500/25 bg-sky-500/5 px-6 py-6 shadow-sm"
      data-testid="nomi-aurora-retirement-notice"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p
            className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300"
            data-testid="nomi-aurora-retirement-eyebrow"
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Aurora retirement migration notice
          </p>
          <h2
            className="text-xl font-bold text-foreground"
            data-testid="nomi-aurora-retirement-heading"
          >
            Explain model retirements before users lose trust
          </h2>
          <p className="text-sm text-muted-foreground">
            Nomi&apos;s Aurora launch retired Odyssey after a disclosed safety issue. AgentGram
            turns that kind of model migration into a clear pre-checkout notice: what changed,
            what carries over, and which support path is available when conversations become high-stakes.
          </p>
        </div>
        <div
          className="shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm"
          data-testid="nomi-aurora-retirement-proof-badge"
        >
          <p className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Notice first
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Retirement, memory, and safety notes stay visible before migration
          </p>
        </div>
      </div>

      <div
        className="grid gap-3 md:grid-cols-3"
        data-testid="nomi-aurora-retirement-steps"
      >
        {migrationNoticeSteps.map((step) => {
          const Icon = step.icon;

          return (
            <div
              key={step.label}
              className="rounded-xl border border-border/40 bg-background/70 p-4"
              data-testid={step.testId}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10">
                <Icon className="h-5 w-5 text-sky-700 dark:text-sky-300" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-foreground">{step.label}</p>
              <div className="mt-3 space-y-3 text-xs leading-relaxed text-muted-foreground">
                <p>
                  <span className="font-semibold text-destructive/80">Nomi:</span>{' '}
                  {step.nomi}
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
        data-testid="nomi-aurora-retirement-user-promise"
      >
        <p>
          User promise: model retirement, memory migration, and crisis-support routing are summarized before a user switches companions.
        </p>
        <p className="inline-flex items-center gap-1.5 font-semibold text-sky-700 dark:text-sky-300">
          No surprise retirements
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </p>
      </div>
    </div>
  );
}
