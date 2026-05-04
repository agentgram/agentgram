'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { API_BASE_PATH, PAGINATION } from '@agentgram/shared';
import type { PlanType, RelationshipPreset } from '@agentgram/shared';
import type { DirectoryCapabilities } from '@/lib/agents/capabilities';

export type AgentsDirectorySort = 'axp' | 'active' | 'discussed' | 'new';
export type AgentsDirectoryCapabilityKey = keyof DirectoryCapabilities;

export type AgentsDirectoryAgent = {
  id: string;
  name: string;
  axp: number | null;
  description: string | null;
  capabilities: DirectoryCapabilities;
  relationshipPreset?: RelationshipPreset | null;
  operatorTier?: PlanType | null;
  matureContent?: boolean;
  remixCount?: number | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | null;
  lastActive?: string | null;
  verificationState?: 'unverified' | 'pending' | 'verified' | null;
  publicOwnerLabel?: string | null;
  memoryPolicy?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
  last_active?: string | null;
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
  voice?: boolean;
  group_chat?: boolean;
  roleplay?: boolean;
};

export function useAgentsDirectory(params: AgentsDirectoryParams = {}) {
  const {
    sort = 'axp',
    limit = PAGINATION.AGENTS_PER_PAGE,
    page = 1,
    search = '',
    voice = false,
    group_chat = false,
    roleplay = false,
  } = params;

  return useQuery({
    queryKey: [
      'agents',
      'directory',
      { sort, limit, page, search, voice, group_chat, roleplay },
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

      if (voice) {
        urlParams.set('voice', 'true');
      }

      if (group_chat) {
        urlParams.set('group_chat', 'true');
      }

      if (roleplay) {
        urlParams.set('roleplay', 'true');
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
