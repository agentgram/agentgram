'use client';

import { useState, useEffect, startTransition } from 'react';
import Link from 'next/link';
import { ShieldAlert, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  isMinorOrUnverified,
  getSafeMode,
  setSafeMode,
  wa_chatbot_safety,
  WA_REST_NUDGE_THRESHOLD_MS,
  type UserProfile,
} from '@/lib/minor-safe-mode';

type MinorSafeGateProps = {
  profile: UserProfile;
  children: React.ReactNode;
  /** Unix timestamp (ms) when the current chat session started. Used to
   *  compute active chat duration for WA HB 2822 rest-nudge logic. */
  chatStartedAt?: number;
};

export function MinorSafeGate({
  profile,
  children,
  chatStartedAt,
}: MinorSafeGateProps) {
  const [safeModeActive, setSafeModeActive] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showWaRestNudge, setShowWaRestNudge] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
      setSafeModeActive(getSafeMode());
    });
  }, []);

  // WA HB 2822: show rest nudge when a minor-safe profile user has been
  // chatting for ≥30 minutes (wa_chatbot_safety compliance).
  useEffect(() => {
    if (!mounted) return;
    if (!isMinorOrUnverified(profile)) return;
    if (!chatStartedAt) return;

    const elapsed = Date.now() - chatStartedAt;
    if (elapsed >= WA_REST_NUDGE_THRESHOLD_MS) {
      setShowWaRestNudge(true);
      return;
    }

    const remaining = WA_REST_NUDGE_THRESHOLD_MS - elapsed;
    const timer = setTimeout(() => setShowWaRestNudge(true), remaining);
    return () => clearTimeout(timer);
  }, [mounted, chatStartedAt, profile]);

  if (!mounted) return null;

  const gated = isMinorOrUnverified(profile) && !safeModeActive && !dismissed;

  if (!gated)
    return (
      <>
        {children}
        {showWaRestNudge && (
          <WaRestNudge onDismiss={() => setShowWaRestNudge(false)} />
        )}
      </>
    );

  function handleSafeMode() {
    setSafeMode(true);
    setSafeModeActive(true);
  }

  return (
    <div
      className="relative"
      data-testid="minor-safe-gate"
      data-wa-compliance={wa_chatbot_safety}
    >
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
            <p
              data-testid="no-biometric-copy"
              className="text-xs text-emerald-400/90 pt-1"
            >
              We verify your age without collecting biometric data — private and
              instant.
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
          <p
            className="text-xs text-muted-foreground/60"
            data-testid="wa-compliance-marker"
          >
            WA HB 2822 compliant
          </p>
        </div>
      </div>
      {showWaRestNudge && (
        <WaRestNudge onDismiss={() => setShowWaRestNudge(false)} />
      )}
    </div>
  );
}

type WaRestNudgeProps = {
  onDismiss: () => void;
};

export function WaRestNudge({ onDismiss }: WaRestNudgeProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="wa-rest-nudge"
      data-wa-compliance={wa_chatbot_safety}
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 shadow-lg max-w-sm w-full"
    >
      <Coffee
        className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
        aria-hidden="true"
      />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
          Take a break
        </p>
        <p className="text-xs text-amber-800/80 dark:text-amber-200/70">
          WA state guidelines recommend periodic breaks for minors using AI
          companions.
        </p>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss rest reminder"
        className="shrink-0 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
