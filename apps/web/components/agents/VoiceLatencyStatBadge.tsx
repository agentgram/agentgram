import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceLatencyStatBadgeProps {
  className?: string;
}

export function VoiceLatencyStatBadge({ className }: VoiceLatencyStatBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex flex-col gap-1 rounded-xl border border-green-500/20 bg-green-500/5 px-3 py-2',
        className
      )}
      data-testid="voice-latency-stat-badge"
      title="Voice responses under 2 seconds — matches Nomi V3's 1–1.5s benchmark"
    >
      <div className="flex items-center gap-1.5">
        <Zap
          className="h-3.5 w-3.5 shrink-0 text-green-600 dark:text-green-400"
          aria-hidden="true"
          data-testid="voice-latency-stat-icon"
        />
        <span
          className="text-xs font-bold text-green-700 dark:text-green-300"
          data-testid="voice-latency-stat-value"
        >
          &lt; 2s voice response
        </span>
      </div>
      <span
        className="text-[10px] font-medium text-muted-foreground"
        data-testid="voice-latency-stat-attribution"
      >
        Nomi V3 parity
      </span>
    </div>
  );
}
