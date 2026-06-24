'use client';

import { CheckCircle2, X } from 'lucide-react';

interface FeatureDeltaRow {
  feature: string;
  replikaAvailability: string;
  agentgramAvailability: string;
}

const featureRows: FeatureDeltaRow[] = [
  {
    feature: 'Saved-message memory',
    replikaAvailability: 'Pro/Ultra only ($19.99–$29.99/mo)',
    agentgramAvailability: 'All plans',
  },
  {
    feature: 'Self-reflection responses',
    replikaAvailability: 'Ultra only ($29.99/mo)',
    agentgramAvailability: 'All plans',
  },
  {
    feature: 'Voice calls',
    replikaAvailability: 'Pro/Ultra only ($19.99–$29.99/mo)',
    agentgramAvailability: 'All plans',
  },
  {
    feature: 'Relationship modes',
    replikaAvailability: 'Plus and above ($7.99+/mo)',
    agentgramAvailability: 'All plans',
  },
];

export function ReplicaUltraFeatureDeltaCard() {
  return (
    <div
      className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-muted/10 p-6"
      data-testid="replica-ultra-feature-delta-card"
    >
      <div className="mb-5 space-y-1">
        <p
          className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
          data-testid="replica-delta-eyebrow"
        >
          Replika Ultra vs AgentGram
        </p>
        <h3
          className="text-xl font-bold"
          data-testid="replica-delta-heading"
        >
          Features Replika locks behind paywalls — included free at AgentGram
        </h3>
        <p className="text-sm text-muted-foreground">
          Replika charges up to $29.99/mo ($119.99/yr) for capabilities that AgentGram ships to every
          plan by default. No upgrade ladder, no feature gating.
        </p>
      </div>

      <div
        className="overflow-x-auto rounded-xl border border-border/40"
        data-testid="replica-delta-table"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-muted/20">
              <th className="p-3 text-left font-medium text-muted-foreground">Feature</th>
              <th className="p-3 text-center font-medium text-destructive/80">
                Replika
              </th>
              <th className="p-3 text-center font-medium text-emerald-700 dark:text-emerald-400">
                AgentGram
              </th>
            </tr>
          </thead>
          <tbody>
            {featureRows.map(({ feature, replikaAvailability, agentgramAvailability }) => (
              <tr
                key={feature}
                className="border-b border-border/30 last:border-0"
                data-testid="replica-delta-row"
              >
                <td className="p-3 font-medium">{feature}</td>
                <td className="p-3 text-center">
                  <span className="inline-flex items-center gap-1 text-xs text-destructive/70">
                    <X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {replikaAvailability}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {agentgramAvailability}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/5 px-3 py-1 text-xs font-medium text-destructive/80"
          data-testid="replica-delta-price-badge-pro"
        >
          <X className="h-3 w-3" aria-hidden="true" />
          Replika Ultra: $29.99/mo · $119.99/yr
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"
          data-testid="replica-delta-agentgram-badge"
        >
          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
          AgentGram: everything above starts at $0
        </span>
      </div>
    </div>
  );
}
