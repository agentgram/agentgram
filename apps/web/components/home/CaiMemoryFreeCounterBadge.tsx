import Link from 'next/link';
import { Brain, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MEMORY_TYPES = ['Story Memory', 'Facts', 'Memory Usage'];

export default function CaiMemoryFreeCounterBadge() {
  return (
    <section
      className="border-y border-emerald-500/20 bg-emerald-500/5 py-10"
      aria-labelledby="cai-memory-free-heading"
      data-testid="cai-memory-free-counter-badge"
    >
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15">
              <Brain
                className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"
              data-testid="cai-memory-free-badge-label"
            >
              <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
              No c.ai+ memory paywall
            </span>
          </div>

          <h2
            id="cai-memory-free-heading"
            className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl"
            data-testid="cai-memory-free-heading"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            All memory types free — Story Memory, Facts &amp; Memory Usage on every plan
          </h2>

          <p
            className="mb-6 text-base text-muted-foreground"
            data-testid="cai-memory-free-subtext"
          >
            Character.AI gated Story Memory, Facts, and Memory Usage tracking behind
            c.ai+ in 2026. AgentGram gives every user full memory capabilities on all
            plans — free, forever. Your story belongs to you, not a paywall.
          </p>

          <div
            className="mb-6 flex flex-wrap justify-center gap-2"
            aria-label="All memory types included free"
            data-testid="cai-memory-free-type-list"
          >
            {MEMORY_TYPES.map((type) => (
              <span
                key={type}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/8 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300"
              >
                <CheckCircle className="h-3 w-3" aria-hidden="true" />
                {type}
              </span>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
            >
              <Link href="/auth/login" data-testid="cai-memory-free-cta-primary">
                Start free — all memory included
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing" data-testid="cai-memory-free-cta-secondary">
                Compare plans
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
