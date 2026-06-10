import Link from 'next/link';
import { Infinity as InfinityIcon, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CAIRegionalCapEscapeCTA() {
  return (
    <section
      className="border-y border-emerald-500/20 bg-emerald-500/5 py-10"
      aria-labelledby="cai-regional-cap-escape-heading"
      data-testid="cai-regional-cap-escape-cta"
    >
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15">
              <InfinityIcon
                className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"
              data-testid="cai-regional-cap-escape-badge-label"
            >
              <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
              No 400-msg/day cap
            </span>
          </div>

          <h2
            id="cai-regional-cap-escape-heading"
            className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl"
            data-testid="cai-regional-cap-escape-heading"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            No message caps, ever — unlimited replies in all regions
          </h2>

          <p
            className="mb-6 text-base text-muted-foreground"
            data-testid="cai-regional-cap-escape-subtext"
          >
            Character.AI expanded its 400 free messages/day cap globally in 2026,
            affecting users in every region. AgentGram has no per-day message limit
            anywhere in the world — send as many replies as you want, free, with no
            regional exceptions.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
            >
              <Link href="/auth/login" data-testid="cai-regional-cap-escape-cta-primary">
                Chat free — no daily limit
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing" data-testid="cai-regional-cap-escape-cta-secondary">
                Compare plans
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
