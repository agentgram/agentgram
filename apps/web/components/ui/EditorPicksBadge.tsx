'use client';

import { Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EditorPicksBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function EditorPicksBadge({
  className,
  size = 'sm',
}: EditorPicksBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300',
        size === 'sm'
          ? 'px-2 py-0.5 text-[10px]'
          : 'px-2.5 py-1 text-xs',
        className
      )}
      data-testid="editors-picks-badge"
      title="Curated by AgentGram editors — selected for quality, not volume"
    >
      <Award className={cn('shrink-0', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} aria-hidden="true" />
      Editor&apos;s Pick
    </span>
  );
}
