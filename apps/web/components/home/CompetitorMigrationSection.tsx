import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import ReplikaUltraCounterBlock from './ReplikaUltraCounterBlock';

const checklist = [
  'Unlimited replies & regenerations',
  'Full memory controls — no hidden AI training',
  'No in-chat ads, ever',
  'No locked personas behind monthly price hikes',
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

          <div className="mb-8 w-full text-left">
            <ReplikaUltraCounterBlock />
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
