import Link from 'next/link';
import { ArrowRight, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReplikaUltraCounterBlock() {
  return (
    <div
      className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-6 text-center"
      data-testid="replika-ultra-counter-block"
      aria-labelledby="replika-ultra-counter-heading"
    >
      <div className="mb-3 flex items-center justify-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-700 dark:text-purple-400"
          data-testid="replika-ultra-counter-badge"
        >
          <Tag className="h-3.5 w-3.5" aria-hidden="true" />
          Replika Ultra alternative
        </span>
      </div>

      <h3
        id="replika-ultra-counter-heading"
        className="mb-2 text-xl font-bold tracking-tight"
        data-testid="replika-ultra-counter-heading"
      >
        Same advanced memory as Replika Ultra ($49.99/yr) — at half the price
      </h3>

      <p
        className="mb-5 text-sm text-muted-foreground"
        data-testid="replika-ultra-counter-subtext"
      >
        AgentGram gives you persistent, inspectable memory with full audit controls and
        rollback guarantees — no subscription inflation, no paywalled personas.
      </p>

      <Button asChild size="sm" variant="outline" className="gap-2">
        <Link href="/pricing" data-testid="replika-ultra-counter-cta">
          See full pricing
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}
