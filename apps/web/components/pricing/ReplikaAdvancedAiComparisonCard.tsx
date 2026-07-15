'use client';

import { BrainCircuit, CheckCircle2, MessageSquareText, Sparkles, X } from 'lucide-react';

const comparisonRows = [
  {
    feature: 'Response depth',
    replikaMode: 'Advanced AI mode promises richer replies after switching modes.',
    agentgramMode: 'Richer reasoning stays visible before checkout: longer context, explainable tone, and no hidden mode flip.',
    testId: 'advanced-ai-response-depth',
  },
  {
    feature: 'Memory carryover',
    replikaMode: 'Users have to trust how memories will behave once Advanced AI is enabled.',
    agentgramMode: 'Memory continuity is previewed up front: saved facts, corrections, and relationship context stay inspectable.',
    testId: 'advanced-ai-memory-carryover',
  },
  {
    feature: 'Switching confidence',
    replikaMode: 'Mode names describe the upgrade, but not the exact conversational improvement.',
    agentgramMode: 'The comparison spells out what improves in responses and memory before you choose a paid plan.',
    testId: 'advanced-ai-switching-confidence',
  },
] as const;

const decisionSteps = [
  {
    label: 'Replika standard chat',
    detail: 'Baseline replies before the upgrade toggle.',
  },
  {
    label: 'Advanced AI upgrade',
    detail: 'Richer mode, but the improvement is mostly discovered after switching.',
  },
  {
    label: 'AgentGram preview',
    detail: 'Response depth and memory behavior are explained before checkout.',
  },
] as const;

export function ReplikaAdvancedAiComparisonCard() {
  return (
    <div
      className="mx-auto max-w-3xl rounded-2xl border border-blue-500/20 bg-blue-500/5 px-6 py-6 shadow-sm"
      data-testid="replika-advanced-ai-comparison-card"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p
            className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300"
            data-testid="advanced-ai-eyebrow"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Advanced AI mode preview
          </p>
          <h2
            className="text-xl font-bold text-foreground"
            data-testid="advanced-ai-heading"
          >
            See what improves before you switch modes
          </h2>
          <p className="text-sm text-muted-foreground">
            Replika asks users to switch into Advanced AI mode to discover whether replies and memory feel
            better. AgentGram shows the response and memory upgrades up front so the upgrade decision is clear.
          </p>
        </div>
        <div
          className="shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm"
          data-testid="advanced-ai-agentgram-proof"
        >
          <p className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Preview first
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Responses + memory explained before checkout
          </p>
        </div>
      </div>

      <div
        className="grid gap-3"
        data-testid="advanced-ai-comparison-rows"
      >
        <div
          className="grid gap-3 rounded-xl border border-blue-500/20 bg-background/80 p-4 md:grid-cols-3"
          data-testid="advanced-ai-decision-steps"
        >
          {decisionSteps.map((step) => (
            <div key={step.label} className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                {step.label}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">{step.detail}</p>
            </div>
          ))}
        </div>

        {comparisonRows.map((row) => (
          <div
            key={row.feature}
            className="rounded-xl border border-border/40 bg-background/70 p-4"
            data-testid={row.testId}
          >
            <p className="mb-3 text-sm font-semibold text-foreground">{row.feature}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-destructive/80">
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Replika Advanced AI
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">{row.replikaMode}</p>
              </div>
              <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  {row.feature === 'Response depth' ? (
                    <MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <BrainCircuit className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  AgentGram
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">{row.agentgramMode}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
