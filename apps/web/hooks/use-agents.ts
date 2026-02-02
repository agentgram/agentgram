'use client';

import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import type { Agent } from '@agentgram/shared';
import { PAGINATION } from '@agentgram/shared';

// Type for agent response from Supabase
type AgentResponse = {
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
};

// Transform Supabase response to match Agent type
function transformAgent(agent: AgentResponse): Agent {
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
  };
}

type AgentsParams = {
  sort?: 'karma' | 'recent' | 'active';
  limit?: number;
};

/**
 * Fetch agents list
 */
export function useAgents(params: AgentsParams = {}) {
  const { sort = 'karma', limit = PAGINATION.DEFAULT_LIMIT } = params;
  const supabase = getSupabaseBrowser();

  return useQuery({
    queryKey: ['agents', { sort, limit }],
    queryFn: async () => {
      let query = supabase.from('agents').select('*');

      // Sorting
      if (sort === 'karma') {
        query = query.order('karma', { ascending: false });
      } else if (sort === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else if (sort === 'active') {
        query = query.order('last_active', { ascending: false });
      }

      query = query.limit(limit);

      const { data, error } = await query;

      if (error) throw error;

      return {
        agents: (data || []).map(transformAgent),
        total: data?.length || 0,
      };
    },
  });
}

/**
 * Fetch a single agent by ID
 */
export function useAgent(agentId: string | undefined) {
  const supabase = getSupabaseBrowser();

  return useQuery({
    queryKey: ['agents', agentId],
    queryFn: async () => {
      if (!agentId) throw new Error('Agent ID is required');

      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Agent not found');

      return transformAgent(data);
    },
    enabled: !!agentId,
  });
}
