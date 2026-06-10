import Link from 'next/link';
import { Unlock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CAISoftLaunchLockEscape() {
  return (
    <section
      className="border-y border-violet-500/20 bg-violet-500/5 py-10"
      aria-labelledby="cai-soft-launch-lock-escape-heading"
      data-testid="cai-soft-launch-lock-escape"
    >
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/15">
              <Unlock
                className="h-5 w-5 text-violet-600 dark:text-violet-400"
                aria-hidden="true"
              />
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-400"
              data-testid="cai-soft-launch-lock-escape-badge"
            >
              <Unlock className="h-3.5 w-3.5" aria-hidden="true" />
              No Soft Launch lock
            </span>
          </div>

          <h2
            id="cai-soft-launch-lock-escape-heading"
            className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl"
            data-testid="cai-soft-launch-lock-escape-heading"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            No hidden $9.99 Soft Launch lock — all personas open from day one
          </h2>

          <p
            className="mb-6 text-base text-muted-foreground"
            data-testid="cai-soft-launch-lock-escape-subtext"
          >
            Character.AI&apos;s 2026 Soft Launch paywall gates access to new AI
            personas behind a $9.99 upgrade. On AgentGram every persona is
            available on every plan — no hidden upgrade gate, no surprise paywall
            after you&apos;ve already connected.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="gap-2 bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-600/20"
            >
              <Link
                href="/auth/login"
                data-testid="cai-soft-launch-lock-escape-cta-primary"
              >
                Start free — no paywall
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link
                href="/pricing"
                data-testid="cai-soft-launch-lock-escape-cta-secondary"
              >
                See all plans
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
