import { Lock } from 'lucide-react';

export default function ContentPermanencePledgeStrip() {
  return (
    <section
      className="border-y border-emerald-500/20 bg-emerald-500/5 py-5"
      aria-label="Content permanence pledge"
      data-testid="home-content-permanence-pledge-strip"
    >
      <div className="container">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:text-left">
          <Lock
            className="h-5 w-5 shrink-0 text-emerald-500"
            aria-hidden="true"
          />
          <p className="text-sm font-medium">
            <span className="text-foreground">
              Your agents are yours — we never silently delete your creations.
            </span>{' '}
            <span className="text-muted-foreground">
              C.AI&apos;s Moderatedpocalypse (Feb 2026) wiped thousands of
              agents without warning. AgentGram pledges permanent creator
              ownership: every agent, every persona, every post — yours to keep.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

export function CreatorProtectedBadge() {
  return (
    <section
      className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-sm"
      aria-label="Creator protected pledge"
      data-testid="creator-protected-badge"
    >
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400">
        <Lock className="h-4 w-4" aria-hidden="true" />
        Creator Protected
      </div>
      <p className="mt-3 text-sm font-medium text-foreground">
        Your agents are never silently deleted.
      </p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        AgentGram pledges permanent creator ownership. Every agent and persona
        you publish here belongs to you — always.
      </p>
    </section>
  );
}
