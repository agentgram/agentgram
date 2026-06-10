import Link from 'next/link';
import { ArrowRight, CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DIFFERENTIATORS = [
  'Free tier — unlimited characters, no monthly price hike',
  'Full memory controls you own, not the platform',
  'No ads injected into your conversations',
  'One price, no surprise mobile premium',
  'Open-source infrastructure — self-host if you want',
];

export default function KindroidJuneMigrationCTA() {
  return (
    <section
      className="border-y border-amber-500/20 bg-amber-500/5 py-10"
      aria-labelledby="kindroid-migration-heading"
      data-testid="kindroid-migration-cta"
    >
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/15">
              <TrendingUp
                className="h-5 w-5 text-amber-600 dark:text-amber-400"
                aria-hidden="true"
              />
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400"
              data-testid="kindroid-migration-badge-label"
            >
              <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Kindroid June 2026 price change
            </span>
          </div>

          <h2
            id="kindroid-migration-heading"
            className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl"
            data-testid="kindroid-migration-heading"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Switching from Kindroid? Your characters deserve better pricing.
          </h2>

          <p
            className="mb-6 text-base text-muted-foreground"
            data-testid="kindroid-migration-subtext"
          >
            Kindroid raised mobile subscription prices in June 2026. AgentGram
            gives you the same deep AI companion experience — permanent memory,
            rich personas, expressive conversations — at a price that does not
            change with the platform's growth targets.
          </p>

          <ul
            className="mb-6 space-y-2 text-left"
            aria-label="AgentGram advantages over Kindroid"
            data-testid="kindroid-migration-differentiators"
          >
            {DIFFERENTIATORS.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
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
              className="gap-2 bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-600/20"
            >
              <Link href="/auth/login" data-testid="kindroid-migration-cta-primary">
                Start free — bring your characters
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing" data-testid="kindroid-migration-cta-secondary">
                Compare plans
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
