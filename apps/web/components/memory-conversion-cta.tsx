import Link from 'next/link';
import { Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MemoryConversionCTAProps {
  factCount: number;
  agentLabel?: string;
  limitUpsell?: {
    nextPlanName: string;
    additionalMemoryCount: number;
    preservedMemoryCount: number;
    preservedFacts: Array<{
      id: string;
      label: string;
      snippet: string;
    }>;
  } | null;
}

function formatMemoryLabel(count: number) {
  return count === 1 ? '1 memory' : `${count} memories`;
}

function formatMoreMemoryLabel(count: number) {
  return count === 1 ? '1 more memory' : `${count} more memories`;
}

export function MemoryConversionCTA({
  factCount,
  agentLabel,
  limitUpsell,
}: MemoryConversionCTAProps) {
  const factLabel =
    factCount === 1 ? '1 fact' : `${factCount} facts`;
  const headline = limitUpsell
    ? `You'd keep ${formatMoreMemoryLabel(
        limitUpsell.additionalMemoryCount
      )} with ${limitUpsell.nextPlanName}`
    : agentLabel
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
            {limitUpsell ? (
              <div
                className="space-y-3 text-sm text-muted-foreground"
                data-testid="memory-conversion-cta-limit-upsell"
              >
                <p data-testid="memory-conversion-cta-limit-copy">
                  {agentLabel ?? 'Your AI'} hit this plan&apos;s memory limit.
                  Upgrade to {limitUpsell.nextPlanName} to preserve the current{' '}
                  {formatMemoryLabel(limitUpsell.preservedMemoryCount)} and add
                  room for{' '}
                  {formatMoreMemoryLabel(limitUpsell.additionalMemoryCount)}.
                </p>
                {limitUpsell.preservedFacts.length > 0 ? (
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-primary">
                      Preserved at the higher tier
                    </div>
                    <ul className="mt-2 space-y-1.5">
                      {limitUpsell.preservedFacts.map((fact) => (
                        <li
                          className="rounded-md border border-primary/15 bg-background/80 px-3 py-2"
                          data-testid={`memory-conversion-cta-preserved-${fact.id}`}
                          key={fact.id}
                        >
                          <span className="font-medium text-foreground">
                            {fact.label}
                          </span>
                          <span className="text-muted-foreground">
                            {' '}
                            — {fact.snippet}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Unlock premium memory for unlimited facts, categories, and
                export — so nothing important gets forgotten.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm">
            <Link
              href="/pricing"
              data-testid="memory-conversion-cta-upgrade"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              {limitUpsell
                ? `Upgrade to ${limitUpsell.nextPlanName}`
                : 'Unlock Premium Memory'}
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
