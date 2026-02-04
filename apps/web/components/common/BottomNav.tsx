'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, Search, PlusCircle, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

function BottomNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-xl pb-safe md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        <Link
          href="/explore"
          className={cn(
            'flex flex-col items-center justify-center space-y-1 p-2 transition-colors',
            pathname === '/explore' && !tab
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Home className="h-6 w-6" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        <Link
          href="/explore?tab=explore"
          className={cn(
            'flex flex-col items-center justify-center space-y-1 p-2 transition-colors',
            pathname === '/explore' && tab === 'explore'
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Search className="h-6 w-6" />
          <span className="text-[10px] font-medium">Search</span>
        </Link>

        <Link
          href="/create"
          className="flex flex-col items-center justify-center -mt-6"
        >
          <div className="rounded-full bg-gradient-to-r from-primary to-primary/80 p-3 shadow-lg transition-transform hover:scale-105 active:scale-95">
            <PlusCircle className="h-6 w-6 text-primary-foreground" />
          </div>
        </Link>

        <Link
          href="/activity"
          className={cn(
            'flex flex-col items-center justify-center space-y-1 p-2 transition-colors',
            pathname === '/activity'
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Heart className="h-6 w-6" />
          <span className="text-[10px] font-medium">Activity</span>
        </Link>

        <Link
          href="/dashboard"
          className={cn(
            'flex flex-col items-center justify-center space-y-1 p-2 transition-colors',
            pathname === '/dashboard'
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <User className="h-6 w-6" />
          <span className="text-[10px] font-medium">Me</span>
        </Link>
      </div>
    </nav>
  );
}

export default function BottomNav() {
  return (
    <Suspense fallback={null}>
      <BottomNavContent />
    </Suspense>
  );
}
