'use client';

import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface NomiV5ImageParityBadgeProps {
  className?: string;
}

export function NomiV5ImageParityBadge({
  className,
}: NomiV5ImageParityBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'gap-1 border border-violet-500/20 bg-violet-500/10 text-[10px] font-semibold text-violet-700 dark:text-violet-300',
        className
      )}
      data-testid="nomi-v5-image-parity-badge"
      title="Next-gen AI visuals — V5-class image generation quality, free on all tiers"
    >
      <Sparkles className="h-3 w-3" aria-hidden="true" />
      V5-class image generation — free
    </Badge>
  );
}

export default NomiV5ImageParityBadge;
