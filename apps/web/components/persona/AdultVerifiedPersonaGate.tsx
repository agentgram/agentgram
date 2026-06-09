'use client';

import { useState, useEffect, startTransition } from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isAdultVerified } from '@/lib/persona';
import type { UserProfile } from '@/lib/minor-safe-mode';

type AdultVerifiedPersonaGateProps = {
  profile: UserProfile;
  children: React.ReactNode;
};

export function AdultVerifiedPersonaGate({
  profile,
  children,
}: AdultVerifiedPersonaGateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  if (!mounted) return null;

  if (isAdultVerified(profile)) return <>{children}</>;

  return (
    <div className="relative" data-testid="adult-verified-persona-gate">
      <div
        aria-hidden="true"
        className="pointer-events-none select-none blur-sm"
      >
        {children}
      </div>
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
        <div className="mx-4 max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg text-center space-y-4">
          <div className="flex justify-center">
            <ShieldCheck className="h-10 w-10 text-violet-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              Verify your age to unlock mature persona modes
            </h3>
            <p className="text-sm text-muted-foreground">
              Bolder persona tiers are available to verified adults only, keeping
              the platform SB&nbsp;243 and NY AI Companion Law compliant.
            </p>
            <p
              data-testid="adult-gate-privacy-copy"
              className="text-xs text-emerald-400/90 pt-1"
            >
              Age verification is private and instant — no biometric data
              collected.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/settings">Verify Age</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
