import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, ShieldCheck } from 'lucide-react';
import ReplikaUltraCounterBlock from './ReplikaUltraCounterBlock';

const checklist = [
  'Unlimited replies & regenerations',
  'Full memory controls — no hidden AI training',
  'No in-chat ads, ever',
  'No locked personas behind monthly price hikes',
  'No silent quality cuts — memory, personas & responses stay consistent',
];

export default function CompetitorMigrationSection() {
  return (
    <section
      className="py-24 md:py-32 border-y border-border"
      aria-labelledby="competitor-migration-heading"
    >
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="competitor-migration-heading"
            className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Switching from Replika or Kindroid?
          </h2>
          <p className="mb-10 text-lg text-muted-foreground">
            Everything you miss, none of the new paywalls.
          </p>

          <ul className="mb-10 space-y-4 text-left inline-block">
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check
                  className="mt-0.5 h-5 w-5 shrink-0 text-brand"
                  aria-hidden="true"
                />
                <span className="text-base">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mb-4 w-full text-left">
            <ReplikaUltraCounterBlock />
          </div>

          <div
            className="mb-8 w-full rounded-lg border border-blue-500/20 bg-blue-500/5 p-5 text-left"
            data-testid="cai-quality-counter-block"
            aria-labelledby="cai-quality-counter-heading"
          >
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
              <span
                className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400"
                data-testid="cai-quality-counter-badge"
              >
                Quality-first, no silent regressions
              </span>
            </div>
            <h3
              id="cai-quality-counter-heading"
              className="mb-1.5 text-base font-bold"
              data-testid="cai-quality-counter-heading"
            >
              Unlike C.AI — no hidden quality cuts, no silent regression updates
            </h3>
            <p
              className="text-sm text-muted-foreground"
              data-testid="cai-quality-counter-body"
            >
              Character.AI masked cost-reduction changes as product updates in 2025–2026,
              silently degrading memory, personas, and response quality without notifying users
              (RoboRhythms analysis, June 2026). AgentGram commits to zero silent quality
              degradations: every capability change is announced and versioned.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Link href="/auth/login">
              <Button
                size="lg"
                className="gap-2 bg-brand text-white hover:bg-brand-accent shadow-lg shadow-brand/20"
              >
                Start free — no credit card
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              Import your character in minutes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
