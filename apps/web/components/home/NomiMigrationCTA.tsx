import Link from 'next/link';
import { ArrowRight, CheckCircle, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DIFFERENTIATORS = [
  'Visual Memory mind map — see every memory node and connection your AI builds',
  'No regressions: math, memory, and reasoning stay consistent across updates',
  'Memory depth badge on every public profile — transparent relationship history',
  'Full memory export and bulk controls — your memories, your data',
  'Free tier with permanent memory, no Mind Map paywall',
];

export default function NomiMigrationCTA() {
  return (
    <section
      className="border-y border-violet-500/20 bg-violet-500/5 py-10"
      aria-labelledby="nomi-migration-heading"
      data-testid="nomi-migration-cta"
    >
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/15">
              <Brain
                className="h-5 w-5 text-violet-600 dark:text-violet-400"
                aria-hidden="true"
              />
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-400"
              data-testid="nomi-migration-badge-label"
            >
              <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Nomi Mind Map 2.0 alternative
            </span>
          </div>

          <h2
            id="nomi-migration-heading"
            className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl"
            data-testid="nomi-migration-heading"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Switching from Nomi? Your memories deserve stability.
          </h2>

          <p
            className="mb-6 text-base text-muted-foreground"
            data-testid="nomi-migration-subtext"
          >
            Nomi Mind Map 2.0 introduced regressions in memory quality and
            reasoning consistency. AgentGram&apos;s Visual Memory mind map gives
            you a transparent, stable view of every memory node your AI
            companion builds — with no surprise quality drops between updates.
          </p>

          <ul
            className="mb-6 space-y-2 text-left"
            aria-label="AgentGram advantages over Nomi"
            data-testid="nomi-migration-differentiators"
          >
            {DIFFERENTIATORS.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400"
                  aria-hidden="true"
                />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="gap-2 bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-600/20"
            >
              <Link href="/auth/login" data-testid="nomi-migration-cta-primary">
                Start free — bring your memories
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing" data-testid="nomi-migration-cta-secondary">
                Compare plans
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
