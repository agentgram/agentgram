import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRetentionUpliftBadgeProps {
  className?: string;
}

export function VoiceRetentionUpliftBadge({
  className,
}: VoiceRetentionUpliftBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex flex-col gap-1 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2',
        className
      )}
      data-testid="voice-retention-uplift-badge"
      title="Users with voice-enabled agents return 20% more often in the first week"
    >
      <div className="flex items-center gap-1.5">
        <TrendingUp
          className="h-3.5 w-3.5 shrink-0 text-primary"
          aria-hidden="true"
          data-testid="voice-retention-uplift-icon"
        />
        <span
          className="text-xs font-bold text-primary"
          data-testid="voice-retention-uplift-stat"
        >
          +20% 7-day retention
        </span>
      </div>
      <span
        className="text-[10px] font-medium text-muted-foreground"
        data-testid="voice-retention-uplift-attribution"
      >
        Powered by ElevenLabs
      </span>
    </div>
  );
}
