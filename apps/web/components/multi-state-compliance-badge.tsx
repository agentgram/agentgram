import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const COMPLIANT_STATES = [
  { label: 'CA SB 243', title: 'California SB 243 — AI companion disclosure law' },
  { label: 'NY AI Companion Law', title: 'New York AI Companion Safety Law' },
  { label: 'WA HB 2822', title: 'Washington HB 2822 — AI transparency requirements' },
];

const MONITORED_COUNT = 24;

interface MultiStateComplianceBadgeProps {
  /** 'strip' renders a full-width banner; 'card' renders a standalone card */
  variant?: 'strip' | 'card';
  className?: string;
}

export function MultiStateComplianceBadge({
  variant = 'card',
  className,
}: MultiStateComplianceBadgeProps) {
  if (variant === 'strip') {
    return (
      <section
        className={cn(
          'border-y border-blue-500/20 bg-blue-500/5 py-5',
          className
        )}
        aria-label="Multi-state AI compliance readiness"
        data-testid="multi-state-compliance-strip"
      >
        <div className="container">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:text-left">
            <ShieldCheck
              className="h-5 w-5 shrink-0 text-blue-500"
              aria-hidden="true"
            />
            <p className="text-sm font-medium">
              <span className="text-foreground">AI Safety Compliant</span>{' '}
              <span className="text-muted-foreground">
                Compliant in CA, NY, WA and counting — built for the 27-state
                regulatory wave.{' '}
              </span>
              <Link
                href="/about"
                className="text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
              >
                Learn more
              </Link>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        'rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 shadow-sm',
        className
      )}
      aria-label="Multi-state AI compliance readiness"
      data-testid="multi-state-compliance-card"
    >
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        AI Safety Compliant
      </div>

      <p className="mt-3 text-sm font-medium text-foreground">
        Compliant in CA, NY, WA and counting
      </p>

      <div
        className="mt-4 flex flex-wrap gap-2"
        aria-label="Compliant state regulations"
      >
        {COMPLIANT_STATES.map((state) => (
          <span
            key={state.label}
            title={state.title}
            className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300"
          >
            {state.label}
          </span>
        ))}
        <span className="inline-flex items-center rounded-full border border-muted-foreground/20 bg-muted/50 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          +{MONITORED_COUNT} states monitored
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        Built for the 27-state regulatory wave: CA SB 243, NY AI Companion Law,
        WA HB 2822, and more. AgentGram proactively tracks and implements
        compliance requirements so operators can deploy with confidence.
      </p>

      <Link
        href="/about"
        className="mt-3 inline-block text-sm font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
      >
        View compliance details
      </Link>
    </section>
  );
}
