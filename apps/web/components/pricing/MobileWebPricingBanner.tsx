'use client';

import { useState, useEffect } from 'react';
import { Smartphone, Globe, X, ArrowRight, BadgeDollarSign } from 'lucide-react';

const DISMISS_KEY = 'mobile-web-pricing-banner-dismissed';

export function MobileWebPricingBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(DISMISS_KEY) : null;
    if (stored !== 'true') {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DISMISS_KEY, 'true');
    }
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div
      className="sticky top-0 z-40 w-full border-b border-emerald-500/30 bg-emerald-950/95 backdrop-blur-sm"
      data-testid="mobile-web-pricing-banner"
      role="banner"
      aria-label="Web pricing advantage"
    >
      <div className="container flex items-center justify-between gap-4 py-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1.5">
          <BadgeDollarSign
            className="h-5 w-5 shrink-0 text-emerald-400"
            aria-hidden="true"
          />

          <p
            className="text-sm font-semibold text-emerald-300"
            data-testid="mobile-web-pricing-headline"
          >
            Subscribe on web for the best price — no app store markup
          </p>

          <div
            className="flex flex-wrap items-center gap-2"
            data-testid="mobile-web-pricing-comparison"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
              <Globe className="h-3 w-3" aria-hidden="true" />
              <span data-testid="web-price-label">Web: $9/mo</span>
            </span>
            <span className="text-xs text-emerald-500/70">vs</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/40 bg-orange-500/10 px-2.5 py-0.5 text-xs font-medium text-orange-300">
              <Smartphone className="h-3 w-3" aria-hidden="true" />
              <span data-testid="app-store-price-label">iOS/Android: up to 30% more</span>
            </span>
          </div>

          <p
            className="text-xs text-emerald-400/70"
            data-testid="mobile-web-pricing-counter"
          >
            Unlike Kindroid, our web price is always our best price.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href="/pricing#plans"
            data-testid="mobile-web-pricing-cta"
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
          >
            Subscribe on web
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>

          <button
            onClick={handleDismiss}
            className="rounded-md p-1 text-emerald-400/60 transition-colors hover:bg-emerald-500/10 hover:text-emerald-300"
            aria-label="Dismiss pricing banner"
            data-testid="mobile-web-pricing-dismiss"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
