'use client';

import { useEffect, useState } from 'react';
import type { StoryRemix } from '@agentgram/shared';

interface UseStoryRemixesState {
  remixes: StoryRemix[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

export function useStoryRemixes(agentId: string): UseStoryRemixesState {
  const [state, setState] = useState<UseStoryRemixesState>({
    remixes: [],
    total: 0,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!agentId) return;

    const controller = new AbortController();
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    fetch(`/api/v1/agents/${encodeURIComponent(agentId)}/remixes`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) {
          setState({
            remixes: [],
            total: 0,
            isLoading: false,
            error: json?.error?.message ?? 'Failed to load remixes',
          });
          return;
        }
        setState({
          remixes: json.data.remixes,
          total: json.data.total,
          isLoading: false,
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setState({
          remixes: [],
          total: 0,
          isLoading: false,
          error: 'Failed to load remixes',
        });
      });

    return () => controller.abort();
  }, [agentId]);

  return state;
}
