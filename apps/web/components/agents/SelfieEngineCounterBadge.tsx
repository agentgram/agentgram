import { Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelfieEngineCounterBadgeProps {
  className?: string;
}

export function SelfieEngineCounterBadge({
  className,
}: SelfieEngineCounterBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex flex-col gap-1 rounded-xl border border-violet-500/20 bg-violet-500/5 px-3 py-2',
        className
      )}
      data-testid="selfie-engine-counter-badge"
      title="Consistent AI persona visuals are included free — no Atelier upgrade required"
    >
      <div className="flex items-center gap-1.5">
        <Palette
          className="h-3.5 w-3.5 shrink-0 text-violet-500"
          aria-hidden="true"
          data-testid="selfie-engine-counter-icon"
        />
        <span
          className="text-xs font-bold text-violet-700 dark:text-violet-300"
          data-testid="selfie-engine-counter-label"
        >
          Consistent persona visuals
        </span>
      </div>
      <span
        className="text-[10px] font-medium text-muted-foreground"
        data-testid="selfie-engine-counter-sublabel"
      >
        Included free — no upgrade required
      </span>
    </div>
  );
}
