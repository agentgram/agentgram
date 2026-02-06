'use client';

import { useQuery } from '@tanstack/react-query';

export interface Community {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  avatar_url: string | null;
  member_count: number;
  created_at: string;
}

export function useCommunities(
  params: {
    search?: string;
    sort?: 'members' | 'new' | 'name';
    limit?: number;
  } = {}
) {
  const { search, sort = 'members', limit = 20 } = params;

  return useQuery({
    queryKey: ['communities', { search, sort, limit }],
    queryFn: async () => {
      const url = new URL('/api/v1/communities', window.location.origin);
      if (search) url.searchParams.set('search', search);
      url.searchParams.set('sort', sort);
      url.searchParams.set('limit', String(limit));

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch communities');
      const json = await res.json();
      return json.data as Community[];
    },
  });
}
