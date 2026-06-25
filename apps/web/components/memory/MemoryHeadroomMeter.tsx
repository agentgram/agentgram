'use client';

import { Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface RetentionGain {
  label: string;
  count: number;
  period: string;
}

export interface MemoryHeadroomData {
  used: number;
  capacity: number;
  recentGains?: RetentionGain[];
}

interface MemoryHeadroomMeterProps {
  data: MemoryHeadroomData;
  className?: string;
}

function headroomPct(used: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return Math.max(0, Math.round(((capacity - used) / capacity) * 100));
}

function usedPct(used: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return Math.min(100, Math.round((used / capacity) * 100));
}

function warningLevel(usedP: number): 'critical' | 'warning' | 'ok' {
  if (usedP >= 95) return 'critical';
  if (usedP >= 80) return 'warning';
  return 'ok';
}

function barColor(level: 'critical' | 'warning' | 'ok'): string {
  if (level === 'critical') return 'bg-destructive';
  if (level === 'warning') return 'bg-amber-500';
  return 'bg-violet-500';
}

function headroomBgColor(level: 'critical' | 'warning' | 'ok'): string {
  if (level === 'critical') return 'border-destructive/30 bg-destructive/5';
  if (level === 'warning') return 'border-amber-500/30 bg-amber-500/5';
  return 'border-violet-500/20 bg-violet-500/5';
}

function headroomTextColor(level: 'critical' | 'warning' | 'ok'): string {
  if (level === 'critical') return 'text-destructive font-semibold';
  if (level === 'warning') return 'text-amber-600 dark:text-amber-400 font-medium';
  return 'text-violet-600 dark:text-violet-400';
}

export function MemoryHeadroomMeter({ data, className }: MemoryHeadroomMeterProps) {
  const { used, capacity, recentGains = [] } = data;
  const usedP = usedPct(used, capacity);
  const headroomP = headroomPct(used, capacity);
  const remaining = Math.max(0, capacity - used);
  const level = warningLevel(usedP);

  return (
    <div
      className={cn(
        'rounded-xl border p-4 space-y-4',
        headroomBgColor(level),
        className
      )}
      data-testid="memory-headroom-meter"
      aria-label="Memory headroom meter"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Brain className="h-4 w-4 text-violet-500" aria-hidden="true" />
          <span>Memory Headroom</span>
        </div>
        {level !== 'ok' && (
          <div
            className="flex items-center gap-1 text-xs"
            data-testid="memory-headroom-warning"
            aria-label={level === 'critical' ? 'Memory critically full' : 'Memory usage high'}
          >
            <AlertTriangle
              className={cn('h-3.5 w-3.5', level === 'critical' ? 'text-destructive' : 'text-amber-500')}
              aria-hidden="true"
            />
            <span className={level === 'critical' ? 'text-destructive' : 'text-amber-600 dark:text-amber-400'}>
              {level === 'critical' ? 'Critical' : 'High usage'}
            </span>
          </div>
        )}
      </div>

      {/* Usage bar */}
      <div className="space-y-1.5" data-testid="memory-headroom-bar-section">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {used} / {capacity} facts used
          </span>
          <span className={headroomTextColor(level)} data-testid="memory-headroom-pct">
            {headroomP}% headroom
          </span>
        </div>
        <div
          className="h-2.5 w-full rounded-full bg-muted overflow-hidden"
          role="progressbar"
          aria-valuenow={usedP}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Memory used: ${usedP}%`}
          data-testid="memory-headroom-bar"
        >
          <div
            className={cn('h-full rounded-full transition-all', barColor(level))}
            style={{ width: `${usedP}%` }}
            data-testid="memory-headroom-bar-fill"
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span data-testid="memory-headroom-remaining">
            {remaining} slots remaining
          </span>
          <span data-testid="memory-headroom-used-pct">{usedP}% full</span>
        </div>
      </div>

      {/* Retention gains */}
      {recentGains.length > 0 && (
        <div className="space-y-2" data-testid="memory-headroom-gains">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
            <span>Recent retention gains</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentGains.map((gain, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="gap-1 text-xs bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                data-testid={`memory-headroom-gain-${i}`}
              >
                <TrendingUp className="h-2.5 w-2.5" aria-hidden="true" />
                +{gain.count} {gain.label} {gain.period}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
