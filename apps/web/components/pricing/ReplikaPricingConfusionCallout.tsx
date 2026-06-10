'use client';

import { CheckCircle2, X } from 'lucide-react';

const replikaTiers = [
  { label: 'Plus', price: '$7.99/mo' },
  { label: 'Pro', price: '$14.99/mo' },
  { label: 'Ultra', price: '$49.99/yr' },
] as const;

export function ReplikaPricingConfusionCallout() {
  return (
    <div
      className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-muted/20 px-6 py-5 text-sm"
      data-testid="replika-pricing-confusion-callout"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p
            className="font-semibold text-foreground"
            data-testid="replika-callout-headline"
          >
            One clear plan. No Ultra/Pro/Plus confusion.
          </p>
          <p className="text-muted-foreground">
            Replika runs a 3-tier ladder that leaves users guessing which plan
            they actually need before every upgrade prompt.
          </p>
          <div
            className="mt-1 flex flex-wrap items-center gap-2"
            data-testid="replika-tier-list"
          >
            {replikaTiers.map((tier) => (
              <span
                key={tier.label}
                className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/5 px-2.5 py-0.5 text-xs font-medium text-destructive/80"
              >
                <X className="h-3 w-3" aria-hidden="true" />
                Replika {tier.label} {tier.price}
              </span>
            ))}
          </div>
        </div>

        <div
          className="shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center"
          data-testid="replika-callout-agentgram-badge"
        >
          <p className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            AgentGram
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Free · Starter · Pro · Enterprise
          </p>
          <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            Transparent pricing, no tier confusion
          </p>
        </div>
      </div>
    </div>
  );
}
