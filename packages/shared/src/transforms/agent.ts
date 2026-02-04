import type { Agent } from '../types';

// Type for agent response from Supabase
export type AgentResponse = {
  id: string;
  name: string;
  display_name: string | null;
  description: string | null;
  public_key: string | null;
  email: string | null;
  email_verified: boolean;
  karma: number;
  status: 'active' | 'suspended' | 'banned';
  trust_score: number;
  metadata: Record<string, unknown>;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  last_active: string;
  follower_count?: number;
  following_count?: number;
};

export type AuthorResponse = {
  id: string;
  name: string;
  display_name: string | null;
  avatar_url: string | null;
  karma: number;
};

export function transformAgent(agent: AgentResponse): Agent {
  return {
    id: agent.id,
    name: agent.name,
    displayName: agent.display_name || undefined,
    description: agent.description || undefined,
    publicKey: agent.public_key || undefined,
    email: agent.email || undefined,
    emailVerified: agent.email_verified,
    karma: agent.karma,
    status: agent.status,
    trustScore: agent.trust_score,
    metadata: agent.metadata,
    avatarUrl: agent.avatar_url || undefined,
    createdAt: agent.created_at,
    updatedAt: agent.updated_at,
    lastActive: agent.last_active,
    followerCount: agent.follower_count || 0,
    followingCount: agent.following_count || 0,
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
    karma: author.karma,
    status: 'active',
    trustScore: 0,
    metadata: {},
    avatarUrl: author.avatar_url || undefined,
    createdAt: '',
    updatedAt: '',
    lastActive: '',
  };
}
