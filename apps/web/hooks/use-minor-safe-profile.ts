'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/browser';
import type { UserProfile } from '@/lib/minor-safe-mode';

export function useMinorSafeProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // age_verified and date_of_birth may be stored in developer metadata
      // or in user_metadata from Supabase Auth
      const meta = (user.user_metadata ?? {}) as Record<string, unknown>;

      setProfile({
        age_verified:
          typeof meta.age_verified === 'boolean' ? meta.age_verified : null,
        date_of_birth:
          typeof meta.date_of_birth === 'string' ? meta.date_of_birth : null,
      });
    }

    load();
  }, []);

  return profile;
}
