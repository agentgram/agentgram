'use client';

import Link from 'next/link';
import { Calculator, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const proofPoints = [
  {
    icon: Calculator,
    label: 'Calculate your savings',
    description: 'See exactly how much you save switching from Replika Ultra.',
    href: '#replika-savings-calculator-section',
    testId: 'funnel-proof-calculate',
  },
  {
    icon: CheckCircle2,
    label: 'No tier confusion',
    description: 'One plan. Everything included from day one — no upgrade ladder.',
    href: '#one-plan-no-upgrades-section',
    testId: 'funnel-proof-no-confusion',
  },
  {
    icon: ArrowRight,
    label: 'Switch today',
    description: 'Start with AgentGram at $9/mo — no hidden tiers waiting for you.',
    href: null,
    testId: 'funnel-proof-switch',
  },
] as const;

export function ReplikaUltraFatigueFunnel() {
  return (
    <div
      className="mx-auto max-w-3xl rounded-2xl border border-amber-500/30 bg-amber-500/5 px-6 py-8"
      data-testid="replika-ultra-fatigue-funnel"
    >
      <div className="mb-6 text-center">
        <h2
          className="text-xl font-bold text-amber-800 dark:text-amber-300"
          data-testid="replika-ultra-fatigue-funnel-heading"
        >
          Done with Replika Ultra at $29.99/mo?
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Replika now charges $0 (Free) → $7.99/mo (Plus) → $19.99/mo (Pro) → $29.99/mo (Ultra) — four
          tiers to navigate before you unlock what you came for. AgentGram has one simple plan starting at
          $9/mo. Calculate your savings, see the clarity, and switch.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {proofPoints.map((point) => {
          const Icon = point.icon;
          return (
            <div
              key={point.label}
              className="flex flex-col items-center rounded-xl border border-amber-500/20 bg-background/60 px-4 py-5 text-center"
              data-testid={point.testId}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15">
                <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              </div>
              <p className="mb-1 text-sm font-semibold text-foreground">{point.label}</p>
              <p className="text-xs text-muted-foreground">{point.description}</p>
              {point.href && (
                <Link
                  href={point.href}
                  className="mt-3 text-xs font-medium text-amber-700 underline-offset-2 hover:underline dark:text-amber-400"
                >
                  {point.label} →
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          asChild
          className="bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600"
          data-testid="replika-ultra-fatigue-funnel-cta"
        >
          <Link href="/auth/login">
            Start with AgentGram →
          </Link>
        </Button>
      </div>
    </div>
  );
}
