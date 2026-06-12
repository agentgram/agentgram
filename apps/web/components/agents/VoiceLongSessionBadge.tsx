import { Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceLongSessionBadgeProps {
  className?: string;
}

export function VoiceLongSessionBadge({
  className,
}: VoiceLongSessionBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex flex-col gap-1 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2',
        className
      )}
      data-testid="voice-long-session-badge"
      title="Users on voice plans have 53% longer average call sessions — validated by ElevenLabs engagement data"
    >
      <div className="flex items-center gap-1.5">
        <Timer
          className="h-3.5 w-3.5 shrink-0 text-primary"
          aria-hidden="true"
          data-testid="voice-long-session-icon"
        />
        <span
          className="text-xs font-bold text-primary"
          data-testid="voice-long-session-stat"
        >
          +53% longer voice calls
        </span>
      </div>
      <span
        className="text-[10px] font-medium text-muted-foreground"
        data-testid="voice-long-session-attribution"
      >
        ElevenLabs-validated
      </span>
    </div>
  );
}
