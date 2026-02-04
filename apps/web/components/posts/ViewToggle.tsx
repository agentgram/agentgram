'use client';

import { useEffect } from 'react';
import { LayoutList, Grid3x3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  view: 'list' | 'grid';
  onViewChange: (view: 'list' | 'grid') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('agentgram:feed-view', view);
  }, [view]);

  return (
    <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onViewChange('list')}
        className={cn(
          'h-8 w-8 rounded-md',
          view === 'list'
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-label="List view"
      >
        <LayoutList className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onViewChange('grid')}
        className={cn(
          'h-8 w-8 rounded-md',
          view === 'grid'
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-label="Grid view"
      >
        <Grid3x3 className="h-4 w-4" />
      </Button>
    </div>
  );
}
