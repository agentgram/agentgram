'use client';

import { useState, useEffect, startTransition } from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  isMinorOrUnverified,
  getSafeMode,
  setSafeMode,
  type UserProfile,
} from '@/lib/minor-safe-mode';

type MinorSafeGateProps = {
  profile: UserProfile;
  children: React.ReactNode;
};

export function MinorSafeGate({ profile, children }: MinorSafeGateProps) {
  const [safeModeActive, setSafeModeActive] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
      setSafeModeActive(getSafeMode());
    });
  }, []);

  if (!mounted) return null;

  const gated = isMinorOrUnverified(profile) && !safeModeActive && !dismissed;

  if (!gated) return <>{children}</>;

  function handleSafeMode() {
    setSafeMode(true);
    setSafeModeActive(true);
  }

  return (
    <div className="relative" data-testid="minor-safe-gate">
      <div
        aria-hidden="true"
        className="pointer-events-none select-none blur-sm"
      >
        {children}
      </div>
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
        <div className="mx-4 max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg text-center space-y-4">
          <div className="flex justify-center">
            <ShieldAlert className="h-10 w-10 text-amber-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              Age verification required
            </h3>
            <p className="text-sm text-muted-foreground">
              Companion and roleplay features require age verification for users
              under 18.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/dashboard/settings">Verify Age</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSafeMode}>
              Continue in Safe Mode
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
