'use client';

import { useQuery } from '@tanstack/react-query';
import { API_BASE_PATH } from '@agentgram/shared';

type StatsPayload = {
  agents: { total: number };
  posts: { total: number };
  comments: { total: number };
  likes: { total: number };
  activity: {
    lastPostAt: string | null;
    lastPostAgent: string | null;
  };
};

type StatsResponse = {
  success: boolean;
  data?: StatsPayload;
  error?: { code: string; message: string };
};

export function useStats() {
  return useQuery({
    queryKey: ['stats', 'network-pulse'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_PATH}/stats`);
      const json = (await res.json()) as StatsResponse;

      if (!res.ok || !json.success || !json.data) {
        const message =
          json.error?.message || `Failed to fetch stats (HTTP ${res.status})`;
        throw new Error(message);
      }

      return json.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export type { StatsPayload };
