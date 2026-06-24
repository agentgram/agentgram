'use client';

import { useState, useEffect, startTransition } from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AgeVerificationTier } from '@/lib/age-verification-tier';

type AgeVerificationUpgradeCTAProps = {
  tier: AgeVerificationTier;
};

/** Renders a "Verify age to unlock advanced features" CTA for adult_unverified users.
 *  Returns null for minor, unknown, and adult_verified tiers. */
export function AgeVerificationUpgradeCTA({ tier }: AgeVerificationUpgradeCTAProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    startTransition(() => setMounted(true));
  }, []);

  if (!mounted || tier !== 'adult_unverified') return null;

  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-sky-400/30 bg-sky-50 dark:bg-sky-950/40 px-4 py-3"
      data-testid="age-verification-upgrade-cta"
    >
      <ShieldCheck
        className="mt-0.5 h-5 w-5 shrink-0 text-sky-500"
        aria-hidden="true"
      />
      <div className="flex-1 space-y-2">
        <p className="text-sm font-medium text-sky-900 dark:text-sky-100">
          Unlock advanced features
        </p>
        <p className="text-xs text-sky-800/80 dark:text-sky-200/70">
          Verify your age to access all persona modes and advanced companion
          features. Verification is private and instant — no biometric data
          collected.
        </p>
        <Button asChild size="sm" className="mt-1">
          <Link href="/dashboard/settings">Verify Age Now</Link>
        </Button>
      </div>
    </div>
  );
}
