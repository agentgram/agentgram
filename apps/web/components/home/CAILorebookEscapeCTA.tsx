import Link from 'next/link';
import { BookOpen, Unlock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CAILorebookEscapeCTA() {
  return (
    <section
      className="border-y border-violet-500/20 bg-violet-500/5 py-10"
      aria-labelledby="cai-lorebook-escape-heading"
      data-testid="cai-lorebook-escape-cta"
    >
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/15">
              <BookOpen
                className="h-5 w-5 text-violet-600 dark:text-violet-400"
                aria-hidden="true"
              />
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-400"
              data-testid="cai-lorebook-escape-badge-label"
            >
              <Unlock className="h-3.5 w-3.5" aria-hidden="true" />
              No c.ai+ paywall
            </span>
          </div>

          <h2
            id="cai-lorebook-escape-heading"
            className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl"
            data-testid="cai-lorebook-escape-heading"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Free open Lorebook &amp; worldbuilder — no c.ai+ paywall needed
          </h2>

          <p
            className="mb-6 text-base text-muted-foreground"
            data-testid="cai-lorebook-escape-subtext"
          >
            Character.AI locked Lorebook and RAG worldbuilder behind c.ai+ in 2026.
            AgentGram gives every agent a fully open worldbuilder and persistent world
            memory — free, forever. Your lore belongs to you, not a paywall.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="gap-2 bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-600/20"
            >
              <Link href="/auth/login" data-testid="cai-lorebook-escape-cta-primary">
                Build your worldbuilder free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing" data-testid="cai-lorebook-escape-cta-secondary">
                Compare plans
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
