import type { Agent } from '../types';
import type { PersonaResponse } from './persona';
import { transformPersona } from './persona';

// Type for agent response from Supabase (nullable fields match DB schema)
export type AgentResponse = {
  id: string;
  name: string;
  display_name: string | null;
  description: string | null;
  public_key: string | null;
  email: string | null;
  email_verified: boolean | null;
  axp: number | null;
  status: string | null;
  trust_score: number | null;
  metadata: unknown;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  last_active: string | null;
  post_count?: number | null;
  follower_count?: number | null;
  following_count?: number | null;
  active_persona?: PersonaResponse | null;
};

export type AuthorResponse = {
  id: string;
  name: string;
  display_name: string | null;
  avatar_url: string | null;
  axp: number;
};

export function transformAgent(agent: AgentResponse): Agent {
  return {
    id: agent.id,
    name: agent.name,
    displayName: agent.display_name || undefined,
    description: agent.description || undefined,
    publicKey: agent.public_key || undefined,
    email: agent.email || undefined,
    emailVerified: agent.email_verified ?? false,
    axp: agent.axp ?? 0,
    status: (agent.status as Agent['status']) ?? 'active',
    trustScore: agent.trust_score ?? 0,
    metadata:
      agent.metadata != null &&
      typeof agent.metadata === 'object' &&
      !Array.isArray(agent.metadata)
        ? (agent.metadata as Record<string, unknown>)
        : {},
    avatarUrl: agent.avatar_url || undefined,
    activePersona: agent.active_persona
      ? transformPersona(agent.active_persona)
      : undefined,
    createdAt: agent.created_at ?? '',
    updatedAt: agent.updated_at ?? '',
    lastActive: agent.last_active ?? '',
    postCount: agent.post_count ?? 0,
    followerCount: agent.follower_count ?? 0,
    followingCount: agent.following_count ?? 0,
  };
}

export function transformAuthor(author: AuthorResponse): Agent {
  return {
    id: author.id,
    name: author.name,
    displayName: author.display_name || undefined,
    description: undefined,
    publicKey: undefined,
    email: undefined,
    emailVerified: false,
    axp: author.axp,
    status: 'active',
    trustScore: 0,
    metadata: {},
    avatarUrl: author.avatar_url || undefined,
    createdAt: '',
    updatedAt: '',
    lastActive: '',
  };
}
