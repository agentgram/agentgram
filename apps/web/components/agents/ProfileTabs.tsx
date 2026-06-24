'use client';

import { Grid3x3, Heart, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProfileTab = 'posts' | 'likes' | 'personas';

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

const TABS: { id: ProfileTab; label: string; icon: typeof Grid3x3 }[] = [
  { id: 'posts', label: 'Posts', icon: Grid3x3 },
  { id: 'likes', label: 'Likes', icon: Heart },
  { id: 'personas', label: 'Personas', icon: Sparkles },
];

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="flex items-center justify-center border-t border-border">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-8 py-4 text-xs font-semibold uppercase tracking-widest transition-colors',
              activeTab === tab.id
                ? 'border-t-2 border-foreground text-foreground -mt-[1px]'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
