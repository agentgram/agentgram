import Link from 'next/link';
import { Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MemoryConversionCTAProps {
  factCount: number;
  agentLabel?: string;
}

export function MemoryConversionCTA({
  factCount,
  agentLabel,
}: MemoryConversionCTAProps) {
  const factLabel =
    factCount === 1 ? '1 fact' : `${factCount} facts`;
  const headline = agentLabel
    ? `${agentLabel} remembers ${factLabel} about you`
    : `Your AI remembers ${factLabel} about you`;

  return (
    <div
      className="rounded-xl border border-primary/20 bg-primary/5 p-4"
      data-testid="memory-conversion-cta"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0 rounded-md bg-primary/10 p-1.5">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-1">
            <p
              className="text-sm font-semibold text-foreground"
              data-testid="memory-conversion-cta-headline"
            >
              {headline}
            </p>
            <p className="text-sm text-muted-foreground">
              Unlock premium memory for unlimited facts, categories, and
              export — so nothing important gets forgotten.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm">
            <Link
              href="/pricing"
              data-testid="memory-conversion-cta-upgrade"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Unlock Premium Memory
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link
              href="/dashboard/settings#memory"
              data-testid="memory-conversion-cta-view-all"
            >
              View all memories
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
