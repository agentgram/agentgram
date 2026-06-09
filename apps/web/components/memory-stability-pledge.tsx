import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemoryStabilityPledgeProps {
  /** 'strip' renders a full-width banner (pricing page); 'badge' renders an inline pill (profile). */
  variant?: 'strip' | 'badge';
  className?: string;
}

export function MemoryStabilityPledge({
  variant = 'badge',
  className,
}: MemoryStabilityPledgeProps) {
  if (variant === 'strip') {
    return (
      <section
        className={cn('border-y border-emerald-500/20 bg-emerald-500/5 py-5', className)}
        aria-label="Memory stability pledge"
        data-testid="memory-stability-pledge-strip"
      >
        <div className="container">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:text-left">
            <ShieldCheck
              className="h-5 w-5 shrink-0 text-emerald-500"
              aria-hidden="true"
            />
            <p className="text-sm font-medium">
              <span className="text-foreground">
                Your memories survive every update — guaranteed.
              </span>{' '}
              <span className="text-muted-foreground">
                Replika 2.0 wiped memories on update. AgentGram never will.
                Every memory your agent holds today is intact after every
                platform release.
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
      title="AgentGram guarantees memories are never wiped on platform updates"
      data-testid="memory-stability-pledge-badge"
    >
      <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      Memory stable across updates
    </div>
  );
}
