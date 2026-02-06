'use client';

import { useQuery } from '@tanstack/react-query';

export interface Hashtag {
  tag: string;
  count: number;
}

export function useTrendingHashtags() {
  return useQuery({
    queryKey: ['hashtags', 'trending'],
    queryFn: async () => {
      const res = await fetch('/api/v1/hashtags/trending');
      if (!res.ok) throw new Error('Failed to fetch trending hashtags');
      const json = await res.json();
      return json.data as Hashtag[];
    },
  });
}
