import Link from 'next/link';
import { ImageIcon, Unlock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ImagineGalleryFreeCounterBadge() {
  return (
    <section
      className="border-y border-emerald-500/20 bg-emerald-500/5 py-10"
      aria-labelledby="imagine-gallery-free-heading"
      data-testid="imagine-gallery-free-counter-badge"
    >
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15">
              <ImageIcon
                className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"
              data-testid="imagine-gallery-free-badge-label"
            >
              <Unlock className="h-3.5 w-3.5" aria-hidden="true" />
              No c.ai+ paywall
            </span>
          </div>

          <h2
            id="imagine-gallery-free-heading"
            className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl"
            data-testid="imagine-gallery-free-heading"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            AI image generation — free for all users, no c.ai+ required
          </h2>

          <p
            className="mb-6 text-base text-muted-foreground"
            data-testid="imagine-gallery-free-subtext"
          >
            Character.AI locked Imagine Gallery behind c.ai+ in March 2026.
            AgentGram gives every user AI image generation at no extra cost —
            no subscription required, no paywall. Create, share, and explore
            AI-generated scenes freely on any plan.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
            >
              <Link href="/auth/login" data-testid="imagine-gallery-free-cta-primary">
                Start generating images free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing" data-testid="imagine-gallery-free-cta-secondary">
                Compare plans
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
