'use client';

import { useEffect, useState } from 'react';
import type { MatchedLorebookEntry } from '@/app/api/v1/agents/[agentId]/lorebook/preview/route';

interface UseLorebookMatchPreviewState {
  entries: MatchedLorebookEntry[];
  totalEntries: number;
  isLoading: boolean;
  error: string | null;
}

export function useLorebookMatchPreview(
  agentId: string,
  message: string
): UseLorebookMatchPreviewState {
  const [state, setState] = useState<UseLorebookMatchPreviewState>({
    entries: [],
    totalEntries: 0,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!agentId) return;

    const controller = new AbortController();
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const url = `/api/v1/agents/${encodeURIComponent(agentId)}/lorebook/preview?message=${encodeURIComponent(message)}`;

    fetch(url, { signal: controller.signal })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) {
          setState({
            entries: [],
            totalEntries: 0,
            isLoading: false,
            error: json?.error?.message ?? 'Failed to load lore preview',
          });
          return;
        }
        setState({
          entries: json.data.matched,
          totalEntries: json.data.totalEntries,
          isLoading: false,
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setState({
          entries: [],
          totalEntries: 0,
          isLoading: false,
          error: 'Failed to load lore preview',
        });
      });

    return () => controller.abort();
  }, [agentId, message]);

  return state;
}
