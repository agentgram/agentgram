'use client';

import { useState, useEffect, startTransition } from 'react';
import { ShieldAlert, ShieldCheck, ShieldQuestion, Clock } from 'lucide-react';
import {
  TIER_LABELS,
  TIER_DESCRIPTIONS,
  TIER_CONTENT_ACCESS,
  type AgeVerificationTier,
} from '@/lib/age-verification-tier';
import { wa_chatbot_safety as WA_FLAG } from '@/lib/minor-safe-mode';

const TIER_ICON: Record<AgeVerificationTier, React.ReactNode> = {
  unknown: <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />,
  minor: <ShieldAlert className="h-4 w-4 text-amber-500" aria-hidden="true" />,
  adult_unverified: (
    <ShieldQuestion className="h-4 w-4 text-sky-400" aria-hidden="true" />
  ),
  adult_verified: (
    <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" />
  ),
};

const TIER_BADGE_CLASS: Record<AgeVerificationTier, string> = {
  unknown: 'border-border text-muted-foreground bg-muted/40',
  minor: 'border-amber-500/40 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
  adult_unverified:
    'border-sky-400/40 text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40',
  adult_verified:
    'border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
};

type AgeVerificationTierBadgeProps = {
  tier: AgeVerificationTier;
};

export function AgeVerificationTierBadge({ tier }: AgeVerificationTierBadgeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    startTransition(() => setMounted(true));
  }, []);

  if (!mounted) return null;

  const access = TIER_CONTENT_ACCESS[tier];
  const isWaActive = access.waRestNudgeRequired;

  return (
    <div
      className="space-y-2"
      data-testid="age-verification-tier-badge"
      data-tier={tier}
    >
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${TIER_BADGE_CLASS[tier]}`}
      >
        {TIER_ICON[tier]}
        <span>{TIER_LABELS[tier]}</span>
      </div>
      <p className="text-xs text-muted-foreground">{TIER_DESCRIPTIONS[tier]}</p>
      {isWaActive && (
        <p
          className="text-xs text-amber-600/80 dark:text-amber-400/70"
          data-testid="wa-compliance-note"
          data-wa-compliance={WA_FLAG}
        >
          WA HB 2822 compliant — rest reminders active
        </p>
      )}
    </div>
  );
}
