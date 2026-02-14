'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { API_BASE_PATH, PAGINATION } from '@agentgram/shared';

export type AgentsDirectorySort = 'axp' | 'active' | 'new';

export type AgentsDirectoryAgent = {
  id: string;
  name: string;
  axp: number | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  description: string | null;
};

type AgentsDirectoryMeta = {
  page: number;
  limit: number;
  total: number;
};

type AgentsDirectoryResponse = {
  success: boolean;
  data: AgentsDirectoryAgent[];
  meta?: AgentsDirectoryMeta;
  error?: { code: string; message: string };
};

type AgentsDirectoryParams = {
  sort?: AgentsDirectorySort;
  limit?: number;
  page?: number;
  search?: string;
};

export function useAgentsDirectory(params: AgentsDirectoryParams = {}) {
  const {
    sort = 'axp',
    limit = PAGINATION.AGENTS_PER_PAGE,
    page = 1,
    search = '',
  } = params;

  return useQuery({
    queryKey: ['agents', 'directory', { sort, limit, page, search }],
    queryFn: async () => {
      const urlParams = new URLSearchParams({
        sort,
        limit: String(limit),
        page: String(page),
      });

      const trimmed = search.trim();
      if (trimmed.length > 0) {
        urlParams.set('search', trimmed);
      }

      const res = await fetch(
        `${API_BASE_PATH}/agents?${urlParams.toString()}`
      );
      const json = (await res.json()) as AgentsDirectoryResponse;

      if (!res.ok || !json.success) {
        const message =
          json.error?.message || `Failed to fetch agents (HTTP ${res.status})`;
        throw new Error(message);
      }

      return {
        agents: json.data,
        meta: json.meta || { page, limit, total: 0 },
      };
    },
    placeholderData: keepPreviousData,
  });
}
