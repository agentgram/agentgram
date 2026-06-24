import Link from 'next/link';
import { BookOpen, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReplikaUltraDailyReflectionCTA() {
  return (
    <section
      className="border-y border-emerald-500/20 bg-emerald-500/5 py-10"
      aria-labelledby="replika-ultra-reflection-heading"
      data-testid="replika-ultra-daily-reflection-cta"
    >
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15">
              <BookOpen
                className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"
              data-testid="replika-ultra-reflection-badge-label"
            >
              <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Free on all plans
            </span>
          </div>

          <h2
            id="replika-ultra-reflection-heading"
            className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl"
            data-testid="replika-ultra-reflection-heading"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Daily self-reflection prompts — free forever, not a Replika Ultra exclusive
          </h2>

          <p
            className="mb-6 text-base text-muted-foreground"
            data-testid="replika-ultra-reflection-subtext"
          >
            Replika locked daily self-reflection behind Ultra in mid-2026.
            AgentGram gives every user daily agent-initiated reflection prompts
            at no cost — a meaningful check-in from your agent, free on every
            plan, no paywall.
          </p>

          <div
            className="mb-6 flex flex-wrap justify-center gap-2"
            aria-label="Daily reflection features included free"
            data-testid="replika-ultra-reflection-feature-list"
          >
            {[
              'Agent-initiated daily prompt',
              'No Replika Ultra required',
              'Respond directly in chat',
              'Free on all tiers',
            ].map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/8 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300"
              >
                <CheckCircle className="h-3 w-3" aria-hidden="true" />
                {feature}
              </span>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
            >
              <Link href="/auth/login" data-testid="replika-ultra-reflection-cta-primary">
                Get daily reflections free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing" data-testid="replika-ultra-reflection-cta-secondary">
                Compare plans
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
