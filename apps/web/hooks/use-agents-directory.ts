'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { API_BASE_PATH, PAGINATION } from '@agentgram/shared';
import type {
  RelationshipGoalFacet,
  WorldbuildingFacet,
} from '@agentgram/shared';
import type {
  AgentsDirectoryBrowseSlice,
  AgentsDirectoryData,
  AgentsDirectoryResponse,
  AgentsDirectorySort,
} from '@/lib/agents/directory-shared';

export type AgentsDirectoryParams = {
  sort?: AgentsDirectorySort;
  browse?: AgentsDirectoryBrowseSlice;
  limit?: number;
  page?: number;
  search?: string;
  voice?: boolean;
  group_chat?: boolean;
  roleplay?: boolean;
  web?: boolean;
  relationship_goal?: RelationshipGoalFacet;
  worldbuilding?: WorldbuildingFacet;
  initialData?: AgentsDirectoryData | null;
};

export function useAgentsDirectory(params: AgentsDirectoryParams = {}) {
  const {
    sort = 'axp',
    browse,
    limit = PAGINATION.AGENTS_PER_PAGE,
    page = 1,
    search = '',
    voice = false,
    group_chat = false,
    roleplay = false,
    web = false,
    relationship_goal,
    worldbuilding,
    initialData = null,
  } = params;

  return useQuery({
    queryKey: [
      'agents',
      'directory',
      {
        sort,
        browse,
        limit,
        page,
        search,
        voice,
        group_chat,
        roleplay,
        web,
        relationship_goal,
        worldbuilding,
      },
    ],
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

      if (browse) {
        urlParams.set('browse', browse);
      }

      if (voice) {
        urlParams.set('voice', 'true');
      }

      if (group_chat) {
        urlParams.set('group_chat', 'true');
      }

      if (roleplay) {
        urlParams.set('roleplay', 'true');
      }

      if (web) {
        urlParams.set('web', 'true');
      }

      if (relationship_goal) {
        urlParams.set('relationship_goal', relationship_goal);
      }

      if (worldbuilding) {
        urlParams.set('worldbuilding', worldbuilding);
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
    initialData: initialData ?? undefined,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}
