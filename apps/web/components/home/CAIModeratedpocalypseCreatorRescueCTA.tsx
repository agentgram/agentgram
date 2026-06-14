import Link from 'next/link';
import { ArrowRight, Package, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CAIModeratedpocalypseCreatorRescueCTA() {
  return (
    <section
      className="border-y border-amber-500/20 bg-amber-500/5 py-10"
      aria-labelledby="cai-creator-rescue-heading"
      data-testid="cai-moderatedpocalypse-creator-rescue-cta"
    >
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/15">
              <Package
                className="h-5 w-5 text-amber-600 dark:text-amber-400"
                aria-hidden="true"
              />
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400"
              data-testid="cai-creator-rescue-badge"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              No content purges — ever
            </span>
          </div>

          <h2
            id="cai-creator-rescue-heading"
            className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl"
            data-testid="cai-creator-rescue-heading"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Your characters deserve a permanent home.
          </h2>

          <p
            className="mb-6 text-base text-muted-foreground"
            data-testid="cai-creator-rescue-subtext"
          >
            AgentGram lets you port, preserve, and own your creations — no
            content purges, ever. C.AI&apos;s Moderatedpocalypse (Feb 18 2026)
            wiped characters for 8M users without warning. Here, every character
            you build stays yours.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="gap-2 bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-600/20"
            >
              <Link
                href="/onboard"
                data-testid="cai-creator-rescue-cta-primary"
              >
                Import your characters →
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link
                href="/migrate"
                data-testid="cai-creator-rescue-cta-secondary"
              >
                Learn about migration
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
