'use client';

import { useState } from 'react';
import { TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AGENTGRAM_MONTHLY = 29;

const REPLIKA_TIERS = [
  { label: 'Replika Plus', monthly: 7.99 },
  { label: 'Replika Pro', monthly: 19.99 },
  { label: 'Replika Ultra', monthly: 29.99 },
] as const;

const DURATIONS: { label: string; months: number }[] = [
  { label: '1 month', months: 1 },
  { label: '3 months', months: 3 },
  { label: '12 months', months: 12 },
];

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}

export function ReplikaSavingsCalculator() {
  const [months, setMonths] = useState(12);

  const agentgramTotal = AGENTGRAM_MONTHLY * months;
  const maxSavings = (REPLIKA_TIERS[2].monthly - AGENTGRAM_MONTHLY) * months;

  return (
    <div
      className="mx-auto max-w-3xl rounded-2xl border border-primary/20 bg-primary/5 px-6 py-6 shadow-sm"
      data-testid="replika-savings-calculator"
    >
      <div className="mb-5 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Price comparison
        </p>
        <h2 className="text-xl font-bold text-foreground">
          Why pay tier prices when one plan covers everything?
        </h2>
        <p className="text-sm text-muted-foreground">
          Compare what you&apos;d spend on Replika&apos;s 4-tier ladder vs AgentGram Pro — one plan, all features.
        </p>
      </div>

      <div
        className="mb-5 flex gap-2"
        data-testid="duration-selector"
        aria-label="Select duration"
      >
        {DURATIONS.map(({ label, months: m }) => (
          <Button
            key={m}
            size="sm"
            variant={months === m ? 'default' : 'outline'}
            onClick={() => setMonths(m)}
            data-testid={`duration-${m}`}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/40">
        <table className="w-full text-sm" data-testid="savings-table">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="p-3 text-left font-medium text-muted-foreground">Plan</th>
              <th className="p-3 text-right font-medium text-muted-foreground">Replika cost</th>
              <th className="p-3 text-right font-medium text-muted-foreground">AgentGram Pro</th>
              <th className="p-3 text-right font-medium text-muted-foreground">You save</th>
            </tr>
          </thead>
          <tbody>
            {REPLIKA_TIERS.map(({ label, monthly }) => {
              const replikaTotal = monthly * months;
              const savings = replikaTotal - agentgramTotal;
              return (
                <tr
                  key={label}
                  className="border-b border-border/30 last:border-0"
                  data-testid={`savings-row-${label.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  <td className="p-3 font-medium">{label}</td>
                  <td className="p-3 text-right text-muted-foreground" data-testid="replika-cost">
                    {fmt(replikaTotal)}
                  </td>
                  <td className="p-3 text-right font-medium text-primary" data-testid="agentgram-cost">
                    {fmt(agentgramTotal)}
                  </td>
                  <td className="p-3 text-right" data-testid="savings-amount">
                    {savings > 0 ? (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {fmt(savings)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">More features</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {maxSavings > 0 && (
        <div
          className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3"
          data-testid="max-savings-callout"
        >
          <TrendingDown className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            Save up to {fmt(maxSavings)} vs Replika Ultra — one plan, every feature, no tier juggling.
          </p>
        </div>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        Replika pricing based on published monthly rates (Plus $7.99/mo, Pro $19.99/mo, Ultra $29.99/mo — annual $119.99/yr).
        AgentGram Pro billed at $29/mo. Replika Plus and Pro do not include Companion Insights — requires Ultra upgrade.
      </p>
    </div>
  );
}
