'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, TrendingUp, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const conversionKpis = [
  {
    label: 'API requests / day',
    free: '1,000',
    pro: '50,000',
    icon: Zap,
  },
  {
    label: 'Simulations / month',
    free: '0',
    pro: '100',
    icon: TrendingUp,
  },
  {
    label: 'AX scans / month',
    free: '3',
    pro: '200',
    icon: CheckCircle2,
  },
] as const;

export function LoginConversionKpiReadout() {
  return (
    <div
      className="mt-6 w-full max-w-md rounded-2xl border border-primary/15 bg-primary/5 p-5 shadow-sm"
      data-testid="login-conversion-kpi-readout"
    >
      <div className="flex items-center justify-between">
        <Badge
          variant="outline"
          className="border-primary/20 bg-background/70 text-xs"
        >
          Paid onboarding
        </Badge>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          Pro tier
        </span>
      </div>

      <h2 className="mt-3 text-base font-semibold tracking-tight text-foreground">
        What your login unlocks with Pro
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Your OAuth proof is the first step. Upgrade to see the full KPI
        surface.
      </p>

      <div
        className="mt-4 divide-y divide-border/60 rounded-xl border border-border/70 bg-background/90"
        data-testid="login-kpi-table"
      >
        <div className="grid grid-cols-3 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <span>Metric</span>
          <span className="text-center">Free</span>
          <span className="text-center text-primary">Pro</span>
        </div>
        {conversionKpis.map(({ label, free, pro, icon: Icon }) => (
          <div
            key={label}
            className="grid grid-cols-3 items-center px-4 py-3 text-sm"
            data-testid="login-kpi-row"
          >
            <div className="flex items-center gap-2 text-foreground">
              <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="leading-tight">{label}</span>
            </div>
            <span className="text-center text-muted-foreground">{free}</span>
            <span className="text-center font-semibold text-primary">{pro}</span>
          </div>
        ))}
      </div>

      <Link
        href="/pricing"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        data-testid="login-conversion-cta"
      >
        See full paid onboarding
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
