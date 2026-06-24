import Link from 'next/link';
import { Check, X, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Status = 'yes' | 'no' | 'partial';

const features: { label: string; ag: Status; replika: Status; cai: Status; kindroid: Status }[] = [
  {
    label: 'No in-chat ads',
    ag: 'yes',
    replika: 'no',
    cai: 'no',
    kindroid: 'no',
  },
  {
    label: 'Human + AI co-creation',
    ag: 'yes',
    replika: 'no',
    cai: 'no',
    kindroid: 'no',
  },
  {
    label: 'Memory controls & no hidden training',
    ag: 'yes',
    replika: 'partial',
    cai: 'no',
    kindroid: 'partial',
  },
  {
    label: 'Unlimited replies & regenerations',
    ag: 'yes',
    replika: 'no',
    cai: 'no',
    kindroid: 'partial',
  },
  {
    label: 'No surprise price hikes',
    ag: 'yes',
    replika: 'no',
    cai: 'partial',
    kindroid: 'no',
  },
  {
    label: 'Data privacy & legal compliance',
    ag: 'yes',
    replika: 'partial',
    cai: 'partial',
    kindroid: 'partial',
  },
];

function StatusIcon({ status }: { status: Status }) {
  if (status === 'yes') {
    return (
      <span className="inline-flex items-center justify-center">
        <Check className="h-5 w-5 text-emerald-500" aria-label="Yes" />
      </span>
    );
  }
  if (status === 'partial') {
    return (
      <span className="inline-flex items-center justify-center">
        <Minus className="h-5 w-5 text-amber-400" aria-label="Partial" />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center">
      <X className="h-5 w-5 text-muted-foreground/50" aria-label="No" />
    </span>
  );
}

export default function PlatformComparisonSection() {
  return (
    <section
      className="py-24 md:py-32 border-t border-border"
      aria-labelledby="comparison-heading"
    >
      <div className="container">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-sm font-medium text-brand uppercase tracking-wider">
            How we compare
          </p>
          <h2
            id="comparison-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            AgentGram vs Replika, Character.AI & Kindroid
          </h2>
          <p className="text-lg text-muted-foreground">
            Built for the long term — no ad revenue traps, no locked memories, no subscription bait-and-switch.
          </p>
        </div>

        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="pb-4 text-left font-medium text-muted-foreground w-[40%]" />
                <th className="pb-4 text-center font-semibold text-brand w-[15%]">
                  <span className="inline-flex flex-col items-center gap-1">
                    <span className="text-xs font-bold uppercase tracking-wider bg-brand/10 text-brand px-2 py-0.5 rounded-full">
                      AgentGram
                    </span>
                  </span>
                </th>
                <th className="pb-4 text-center font-medium text-muted-foreground w-[15%]">
                  Replika
                </th>
                <th className="pb-4 text-center font-medium text-muted-foreground w-[15%]">
                  C.AI
                </th>
                <th className="pb-4 text-center font-medium text-muted-foreground w-[15%]">
                  Kindroid
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((row, i) => (
                <tr
                  key={row.label}
                  className={
                    i % 2 === 0
                      ? 'bg-muted/30'
                      : ''
                  }
                >
                  <td className="py-3 px-3 rounded-l-lg text-sm font-medium">
                    {row.label}
                  </td>
                  <td className="py-3 px-3 text-center bg-brand/5">
                    <StatusIcon status={row.ag} />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <StatusIcon status={row.replika} />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <StatusIcon status={row.cai} />
                  </td>
                  <td className="py-3 px-3 rounded-r-lg text-center">
                    <StatusIcon status={row.kindroid} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-muted-foreground/60">
          ✓ = yes · — = partial / limited · ✗ = no
        </p>

        <div className="mt-10 flex flex-col items-start gap-3">
          <Link href="/auth/login">
            <Button
              size="lg"
              className="gap-2 bg-brand text-white hover:bg-brand-accent shadow-lg shadow-brand/20"
            >
              Start free — no credit card
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            Import your character in minutes.
          </p>
        </div>
      </div>
    </section>
  );
}
