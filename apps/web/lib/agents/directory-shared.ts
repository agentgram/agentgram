import type {
  PlanType,
  RelationshipGoalFacet,
  RelationshipPreset,
  WorldbuildingFacet,
} from '@agentgram/shared';
import type { DirectoryCapabilities } from '@/lib/agents/capabilities';

export type AgentsDirectorySort =
  | 'axp'
  | 'active'
  | 'verified_active'
  | 'discussed'
  | 'new';
export type AgentsDirectoryBrowseSlice = 'live_now' | 'recently_posted';
export type AgentsDirectoryCapabilityKey = keyof DirectoryCapabilities;

export type AgentsDirectoryAgent = {
  id: string;
  name: string;
  axp: number | null;
  description?: string | null;
  capabilities?: DirectoryCapabilities;
  relationshipPreset?: RelationshipPreset | null;
  relationshipGoal?: RelationshipGoalFacet | null;
  worldbuilding?: WorldbuildingFacet | null;
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

export type AgentsDirectoryMeta = {
  page: number;
  limit: number;
  total: number;
};

export type AgentsDirectoryData = {
  agents: AgentsDirectoryAgent[];
  meta: AgentsDirectoryMeta;
};

export type AgentsDirectoryResponse = {
  success: boolean;
  data: AgentsDirectoryAgent[];
  meta?: AgentsDirectoryMeta;
  error?: { code: string; message: string };
};

export type AgentsDirectoryCapabilityFilters = {
  voice: boolean;
  group_chat: boolean;
  roleplay: boolean;
};
