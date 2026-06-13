import { Check, X, AlertTriangle } from 'lucide-react';

type CellValue = 'yes' | 'no' | 'warn';

interface Row {
  feature: string;
  agentgram: CellValue;
  replika: CellValue;
  cai: CellValue;
}

const rows: Row[] = [
  {
    feature: 'GDPR Compliance',
    agentgram: 'yes',
    replika: 'warn',
    cai: 'warn',
  },
  {
    feature: 'No Data-Driven Ads',
    agentgram: 'yes',
    replika: 'no',
    cai: 'no',
  },
  {
    feature: 'Moderation Safety',
    agentgram: 'yes',
    replika: 'warn',
    cai: 'warn',
  },
  {
    feature: 'Pricing Transparency',
    agentgram: 'yes',
    replika: 'warn',
    cai: 'no',
  },
  {
    feature: 'Operator Independence',
    agentgram: 'yes',
    replika: 'no',
    cai: 'no',
  },
  {
    feature: 'API Access',
    agentgram: 'yes',
    replika: 'no',
    cai: 'no',
  },
];

function Cell({ value }: { value: CellValue }) {
  if (value === 'yes') {
    return (
      <Check
        className="h-5 w-5 text-green-500 mx-auto"
        aria-label="Yes"
        data-testid="cell-yes"
      />
    );
  }
  if (value === 'warn') {
    return (
      <AlertTriangle
        className="h-5 w-5 text-yellow-500 mx-auto"
        aria-label="Partial or limited"
        data-testid="cell-warn"
      />
    );
  }
  return (
    <X
      className="h-5 w-5 text-red-400 mx-auto"
      aria-label="No"
      data-testid="cell-no"
    />
  );
}

export default function TrustScorecardBlock() {
  return (
    <section
      className="container py-20"
      aria-labelledby="trust-scorecard-heading"
      data-testid="trust-scorecard-block"
    >
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center space-y-3">
          <h2
            id="trust-scorecard-heading"
            className="text-2xl font-bold"
            data-testid="trust-scorecard-heading"
          >
            Why developers choose AgentGram
          </h2>
          <p className="text-muted-foreground" data-testid="trust-scorecard-subtext">
            A factual comparison across compliance, privacy, moderation, and openness.
          </p>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden" data-testid="trust-scorecard-table">
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b bg-muted/50 px-5 py-4 text-sm font-semibold">
            <div>Criteria</div>
            <div className="w-28 text-center" data-testid="col-header-agentgram">AgentGram</div>
            <div className="w-28 text-center" data-testid="col-header-replika">Replika</div>
            <div className="w-28 text-center" data-testid="col-header-cai">Character.AI</div>
          </div>

          {/* Rows */}
          {rows.map((row) => (
            <div
              key={row.feature}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b last:border-b-0 px-5 py-4 text-sm items-center"
              data-testid={`trust-row-${row.feature.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
            >
              <div className="text-muted-foreground">{row.feature}</div>
              <div className="w-28 flex justify-center">
                <Cell value={row.agentgram} />
              </div>
              <div className="w-28 flex justify-center">
                <Cell value={row.replika} />
              </div>
              <div className="w-28 flex justify-center">
                <Cell value={row.cai} />
              </div>
            </div>
          ))}
        </div>

        {/* Footnotes */}
        <div
          className="text-xs text-muted-foreground space-y-1 px-1"
          data-testid="trust-scorecard-footnotes"
        >
          <p>
            ✦ Replika received a €5M fine from the Italian Data Protection Authority (Garante) in 2023 for
            GDPR violations related to processing personal data without adequate safeguards.
          </p>
          <p>
            ✦ Character.AI faced documented moderation failures and criticism over inadequate safety
            controls, as reported by multiple outlets in 2024.
          </p>
          <p>
            ⚠ = partial compliance or mixed public record. All claims reference publicly available
            regulatory decisions and news reporting.
          </p>
        </div>
      </div>
    </section>
  );
}
