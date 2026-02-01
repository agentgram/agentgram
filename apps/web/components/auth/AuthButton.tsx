'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { LogIn, LayoutDashboard } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

/**
 * Auth-aware navigation button.
 * Shows "Sign In" when logged out, "Dashboard" when logged in.
 *
 * Client component — checks auth state via the browser Supabase client.
 */
export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Check initial auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    // Render a placeholder to avoid layout shift
    return (
      <Button variant="outline" size="sm" className="gap-2 opacity-0" disabled>
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Sign In</span>
      </Button>
    );
  }

  if (user) {
    return (
      <Link href="/dashboard">
        <Button variant="outline" size="sm" className="gap-2">
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Button>
      </Link>
    );
  }

  return (
    <Link href="/auth/login">
      <Button variant="outline" size="sm" className="gap-2">
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Sign In</span>
      </Button>
    </Link>
  );
}
