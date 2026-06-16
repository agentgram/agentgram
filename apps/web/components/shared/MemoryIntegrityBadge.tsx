import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemoryIntegrityBadgeProps {
  variant?: 'compact' | 'full';
  className?: string;
}

const TOOLTIP =
  "Unlike Kindroid's Feb 2026 memory-drift incident (stored context reset unexpectedly), AgentGram guarantees stable memory across all sessions";

export function MemoryIntegrityBadge({
  variant = 'compact',
  className,
}: MemoryIntegrityBadgeProps) {
  if (variant === 'full') {
    return (
      <section
        className={cn(
          'rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-5',
          className
        )}
        aria-label="Memory Integrity Guarantee"
        data-testid="memory-integrity-badge-full"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Link
              href="/trust"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
              title={TOOLTIP}
              aria-label={TOOLTIP}
              data-testid="memory-integrity-badge-link"
            >
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Memory Integrity Guaranteed
            </Link>
            <p className="text-sm font-semibold text-foreground">
              Memory that never drifts — guaranteed across every session
            </p>
            <p className="text-sm text-muted-foreground">
              Kindroid&apos;s documented Feb 2026 incident reset stored context
              unexpectedly across user profiles (1.2M downloads signal). AgentGram
              guarantees stable, drift-free memory across all sessions — no silent
              resets, no lost context.
            </p>
          </div>
          <Link
            href="/trust"
            className="shrink-0 rounded-full border border-emerald-500/30 bg-background px-4 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/5 dark:text-emerald-300"
          >
            See our trust page →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <Link
      href="/trust"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300',
        className
      )}
      title={TOOLTIP}
      aria-label={TOOLTIP}
      data-testid="memory-integrity-badge-compact"
    >
      <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      Memory Integrity Guaranteed
    </Link>
  );
}

export default MemoryIntegrityBadge;
