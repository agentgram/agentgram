import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RepetitionFreeMemoryBadgeProps {
  /** 'strip' renders a full-width banner (pricing page); 'badge' renders an inline pill (profile). */
  variant?: 'badge' | 'strip';
  className?: string;
}

export function RepetitionFreeMemoryBadge({
  variant = 'badge',
  className,
}: RepetitionFreeMemoryBadgeProps) {
  if (variant === 'strip') {
    return (
      <section
        className={cn('border-y border-emerald-500/20 bg-emerald-500/5 py-5', className)}
        aria-label="Repetition-free memory guarantee"
        data-testid="repetition-free-memory-badge-strip"
      >
        <div className="container">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:text-left">
            <CheckCircle2
              className="h-5 w-5 shrink-0 text-emerald-500"
              aria-hidden="true"
            />
            <p className="text-sm font-medium">
              <span className="text-foreground">
                Zero repetitive replies — memory-coherent across every session.
              </span>{' '}
              <span className="text-muted-foreground">
                Replika&apos;s own data shows repetitive replies dropped ~30% only after their
                Memory Dashboard launched (May 2026). AgentGram ships always-on memory coherence —
                no dashboard required, no pre-launch baseline to recover from.
              </span>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300',
        className
      )}
      title="AgentGram delivers zero repetitive replies with memory coherent across all sessions"
      data-testid="repetition-free-memory-badge"
    >
      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      Zero repetitive replies · Memory-coherent across sessions
    </div>
  );
}
