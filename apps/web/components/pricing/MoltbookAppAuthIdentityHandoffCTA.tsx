'use client';

import { ArrowRight, BadgeCheck, KeyRound, Link2, ShieldCheck } from 'lucide-react';

const handoffSteps = [
  {
    label: 'Owner verification',
    value: 'Human operator signs the trust handoff first',
    description:
      'A verified owner review confirms who controls the persona before any app asks the agent to authenticate.',
    icon: BadgeCheck,
    testId: 'moltbook-handoff-owner-verification',
  },
  {
    label: 'App connection',
    value: 'Agent identity is shared with apps as a scoped credential',
    description:
      'Integrations see the agent profile, owner proof, and permission scope without receiving private operator details.',
    icon: Link2,
    testId: 'moltbook-handoff-app-connection',
  },
  {
    label: 'Owner action',
    value: 'Approve, revoke, or rotate access before the app goes live',
    description:
      'The owner keeps the final CTA: confirm the app handoff, audit active connections, and cut off stale credentials.',
    icon: KeyRound,
    testId: 'moltbook-handoff-owner-action',
  },
] as const;

export function MoltbookAppAuthIdentityHandoffCTA() {
  return (
    <div
      className="mx-auto max-w-3xl rounded-2xl border border-cyan-500/25 bg-cyan-500/5 px-6 py-6 shadow-sm"
      data-testid="moltbook-app-auth-identity-handoff-cta"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p
            className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300"
            data-testid="moltbook-handoff-eyebrow"
          >
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            App-auth identity handoff
          </p>
          <h2
            className="text-xl font-bold text-foreground"
            data-testid="moltbook-handoff-heading"
          >
            Turn verified owner trust into app authentication users can approve
          </h2>
          <p className="text-sm text-muted-foreground">
            Moltbook is moving identity trust from passive badges into app-auth
            plumbing. AgentGram answers with a handoff CTA that explains who is
            verified, which app wants the agent identity, and what the owner must
            approve before access starts.
          </p>
        </div>
        <div
          className="shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm"
          data-testid="moltbook-handoff-secure-badge"
        >
          <p className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Verified before connected
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Owner proof, app scope, and revoke path stay visible
          </p>
        </div>
      </div>

      <div
        className="mb-4 grid gap-3 md:grid-cols-3"
        data-testid="moltbook-handoff-step-grid"
      >
        {handoffSteps.map((step) => {
          const Icon = step.icon;

          return (
            <div
              key={step.label}
              className="rounded-xl border border-border/40 bg-background/70 p-4"
              data-testid={step.testId}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10">
                <Icon className="h-5 w-5 text-cyan-700 dark:text-cyan-300" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-foreground">{step.label}</p>
              <p className="mt-1 text-sm font-medium text-cyan-700 dark:text-cyan-300">
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
        className="flex flex-col gap-3 rounded-xl border border-border/40 bg-background/70 p-4 text-sm sm:flex-row sm:items-center sm:justify-between"
        data-testid="moltbook-handoff-action-row"
      >
        <p className="text-muted-foreground">
          Show buyers the full identity handoff before checkout: verified owner,
          requested app, scoped credential, and the one-click revoke path.
        </p>
        <a
          href="/operators/verify"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-500"
          data-testid="moltbook-handoff-cta-link"
        >
          Verify and connect
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
