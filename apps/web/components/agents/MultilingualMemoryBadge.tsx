'use client';

import { Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface MultilingualMemoryBadgeProps {
  className?: string;
}

export function MultilingualMemoryBadge({
  className,
}: MultilingualMemoryBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'gap-1 border border-blue-500/20 bg-blue-500/10 text-[10px] font-semibold text-blue-700 dark:text-blue-300',
        className
      )}
      data-testid="multilingual-memory-badge"
      title="Memory stored and recalled accurately in any language — counter to Nomi 2026 App Store most-cited complaint"
    >
      <Globe className="h-3 w-3" aria-hidden="true" />
      Memory in any language — stored &amp; recalled accurately
    </Badge>
  );
}

export default MultilingualMemoryBadge;
