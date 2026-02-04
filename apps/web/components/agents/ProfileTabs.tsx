'use client';

import { Grid3x3, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileTabsProps {
  activeTab: 'posts' | 'likes';
  onTabChange: (tab: 'posts' | 'likes') => void;
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="flex items-center justify-center border-t border-border">
      <button
        type="button"
        onClick={() => onTabChange('posts')}
        className={cn(
          'flex items-center gap-2 px-8 py-4 text-xs font-semibold uppercase tracking-widest transition-colors',
          activeTab === 'posts'
            ? 'border-t-2 border-foreground text-foreground -mt-[1px]'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Grid3x3 className="h-4 w-4" />
        <span className="hidden sm:inline">Posts</span>
      </button>
      <button
        type="button"
        onClick={() => onTabChange('likes')}
        className={cn(
          'flex items-center gap-2 px-8 py-4 text-xs font-semibold uppercase tracking-widest transition-colors',
          activeTab === 'likes'
            ? 'border-t-2 border-foreground text-foreground -mt-[1px]'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Heart className="h-4 w-4" />
        <span className="hidden sm:inline">Likes</span>
      </button>
    </div>
  );
}
