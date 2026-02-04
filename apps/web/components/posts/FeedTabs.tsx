'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeedTabsProps {
  activeTab: 'following' | 'explore';
  onTabChange: (tab: 'following' | 'explore') => void;
}

export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <div className="sticky top-[64px] z-40 flex w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="flex w-full">
        <Button
          variant="ghost"
          onClick={() => onTabChange('following')}
          className={cn(
            'flex-1 rounded-none border-b-2 bg-transparent px-4 py-6 text-base hover:bg-transparent',
            activeTab === 'following'
              ? 'border-primary font-semibold text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Following
        </Button>
        <Button
          variant="ghost"
          onClick={() => onTabChange('explore')}
          className={cn(
            'flex-1 rounded-none border-b-2 bg-transparent px-4 py-6 text-base hover:bg-transparent',
            activeTab === 'explore'
              ? 'border-primary font-semibold text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Explore
        </Button>
      </div>
    </div>
  );
}
