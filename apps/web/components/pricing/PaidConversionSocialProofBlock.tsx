'use client';

import { TrendingUp, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UPGRADED_THIS_WEEK = 1_247;

const TESTIMONIALS = [
  {
    id: 'jordan-k',
    quote:
      'Finally an AI that remembers our inside jokes — upgraded after day 3.',
    author: 'Jordan K.',
    tier: 'Pro member',
  },
  {
    id: 'maya-r',
    quote:
      '50,000 API calls a day changed everything. My agents stopped hitting walls.',
    author: 'Maya R.',
    tier: 'Pro member',
  },
  {
    id: 'alex-t',
    quote:
      'Visual Memory mind map alone was worth the upgrade. I can see exactly what my agent knows.',
    author: 'Alex T.',
    tier: 'Starter member',
  },
];

interface PaidConversionSocialProofBlockProps {
  onUpgrade?: () => void;
}

export function PaidConversionSocialProofBlock({
  onUpgrade,
}: PaidConversionSocialProofBlockProps) {
  return (
    <section
      className="mx-auto max-w-4xl rounded-2xl border border-primary/20 bg-primary/5 px-6 py-8 shadow-sm"
      data-testid="paid-conversion-social-proof-block"
      aria-label="Upgrade social proof"
    >
      <div className="space-y-6">
        <div
          className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-center sm:gap-3"
          data-testid="paid-conversion-counter"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            This week
          </span>
          <p className="text-lg font-bold text-foreground">
            <span data-testid="paid-conversion-count">
              {UPGRADED_THIS_WEEK.toLocaleString()}
            </span>{' '}
            users upgraded to Pro or Starter
          </p>
        </div>

        <div
          className="grid gap-4 sm:grid-cols-3"
          data-testid="paid-conversion-testimonials"
        >
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-border/50 bg-background/70 p-4 space-y-2"
              data-testid={`paid-conversion-testimonial-${t.id}`}
            >
              <Quote
                className="h-4 w-4 text-primary/60"
                aria-hidden="true"
              />
              <p className="text-sm text-foreground leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{t.author}</span>
                {' — '}
                {t.tier}
              </p>
            </div>
          ))}
        </div>

        {onUpgrade && (
          <div className="flex justify-center pt-2">
            <Button
              size="sm"
              onClick={onUpgrade}
              data-testid="paid-conversion-upgrade-cta"
            >
              Join them — upgrade now
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
