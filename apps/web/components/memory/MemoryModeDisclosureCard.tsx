import Link from 'next/link';
import { Clock, Pin, Crown, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FREE_FEATURES = [
  'Context from the last 5–10 messages',
  'Session recap on re-entry (summarised)',
  'Facts may fade after inactivity',
  'No cross-device persistence',
];

const PREMIUM_FEATURES = [
  'Pinned facts — durable across all sessions',
  'Unlimited persistent memory entries',
  'Cross-device and cross-agent continuity',
  'Priority recall in long conversations',
];

interface MemoryModeDisclosureCardProps {
  onContinue?: () => void;
  className?: string;
  isPremium?: boolean;
}

export default function MemoryModeDisclosureCard({
  onContinue,
  className = '',
  isPremium = false,
}: MemoryModeDisclosureCardProps) {
  return (
    <div
      data-testid="memory-mode-disclosure-card"
      className={`rounded-xl border border-border bg-card p-6 shadow-sm ${className}`}
      role="region"
      aria-labelledby="memory-disclosure-heading"
    >
      <div className="mb-5 text-center">
        <p
          className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground"
          data-testid="memory-disclosure-eyebrow"
        >
          How memory works
        </p>
        <h2
          id="memory-disclosure-heading"
          className="text-lg font-bold tracking-tight"
          data-testid="memory-disclosure-heading"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Retrievable vs Persistent Memory
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground" data-testid="memory-disclosure-subtext">
          Understand what your agent remembers — and for how long — before upgrading.
        </p>
      </div>

      <div
        className="grid gap-4 sm:grid-cols-2"
        data-testid="memory-disclosure-comparison"
      >
        {/* Free tier column */}
        <div
          data-testid="memory-disclosure-free-column"
          className="rounded-lg border border-border bg-muted/30 p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <span
              className="text-sm font-semibold"
              data-testid="memory-disclosure-free-label"
            >
              Retrievable Memory
            </span>
            <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              Free
            </span>
          </div>

          <ul className="space-y-2" aria-label="Free memory features">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <AlertCircle
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="text-xs text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Premium tier column */}
        <div
          data-testid="memory-disclosure-premium-column"
          className="rounded-lg border border-violet-500/30 bg-violet-500/6 p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-500/15">
              <Pin className="h-4 w-4 text-violet-600 dark:text-violet-400" aria-hidden="true" />
            </div>
            <span
              className="text-sm font-semibold"
              data-testid="memory-disclosure-premium-label"
            >
              Persistent Memory
            </span>
            <span className="ml-auto flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-700 dark:text-violet-400">
              <Crown className="h-3 w-3" aria-hidden="true" />
              Premium
            </span>
          </div>

          <ul className="space-y-2" aria-label="Premium memory features">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <CheckCircle
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-600 dark:text-violet-400"
                  aria-hidden="true"
                />
                <span className="text-xs">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p
        className="mt-4 text-center text-xs text-muted-foreground"
        data-testid="memory-disclosure-ultra-note"
      >
        <Crown className="mr-1 inline h-3 w-3 text-violet-500" aria-hidden="true" />
        Some persistent memory features (unlimited pins, cross-agent continuity) require a paid Ultra tier.
      </p>

      <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
        {isPremium ? (
          <div
            className="flex items-center gap-1.5 rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1.5 text-sm font-medium text-violet-700 dark:text-violet-400"
            data-testid="memory-disclosure-premium-active"
          >
            <CheckCircle className="h-4 w-4" aria-hidden="true" />
            Persistent Memory Active
          </div>
        ) : (
          <Button
            asChild
            size="sm"
            className="gap-1.5 bg-violet-600 text-white hover:bg-violet-700 shadow-sm shadow-violet-600/20"
          >
            <Link href="/pricing" data-testid="memory-disclosure-upgrade-cta">
              <Crown className="h-3.5 w-3.5" aria-hidden="true" />
              Unlock 이어하기+기억 제어
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        )}

        {onContinue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onContinue}
            data-testid="memory-disclosure-continue-btn"
          >
            Continue with free memory
          </Button>
        )}
      </div>
    </div>
  );
}
