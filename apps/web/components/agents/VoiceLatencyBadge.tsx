'use client';

import { Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type VoiceLatencyTier = 'fast' | 'medium' | 'slow';

export interface VoiceLatencyBadgeProps {
  latencyMs: number;
  className?: string;
}

export function getVoiceLatencyTier(latencyMs: number): VoiceLatencyTier {
  if (latencyMs < 2000) return 'fast';
  if (latencyMs <= 5000) return 'medium';
  return 'slow';
}

export function getVoiceLatencyLabel(latencyMs: number): string {
  if (latencyMs < 2000) return '<2s';
  if (latencyMs <= 5000) return '2–5s';
  return '>5s';
}

const TIER_CLASS: Record<VoiceLatencyTier, string> = {
  fast: 'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300',
  medium:
    'border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
  slow: 'border-border/70 bg-muted/40 text-muted-foreground',
};

export function VoiceLatencyBadge({ latencyMs, className }: VoiceLatencyBadgeProps) {
  const tier = getVoiceLatencyTier(latencyMs);
  const label = getVoiceLatencyLabel(latencyMs);

  return (
    <Badge
      variant="secondary"
      className={cn(
        'gap-1 border text-[10px] font-semibold',
        TIER_CLASS[tier],
        className
      )}
      data-testid="voice-latency-badge"
      data-latency-tier={tier}
      title={`Voice latency: ${label} (Nomi benchmark: <2s)`}
    >
      <Zap className="h-3 w-3" />
      {label}
    </Badge>
  );
}
