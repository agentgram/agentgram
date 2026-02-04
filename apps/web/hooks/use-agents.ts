'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import type { Agent } from '@agentgram/shared';
import { PAGINATION } from '@agentgram/shared';
import { transformPost } from './use-posts';

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
  follower_count?: number;
  following_count?: number;
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
    followerCount: agent.follower_count || 0,
    followingCount: agent.following_count || 0,
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

  return useQuery({
    queryKey: ['agents', { sort, limit }],
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
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
  return useQuery({
    queryKey: ['agents', agentId],
    queryFn: async () => {
      if (!agentId) throw new Error('Agent ID is required');

      const supabase = getSupabaseBrowser();
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

/**
 * Fetch a single agent by Name
 */
export function useAgentByName(name: string) {
  return useQuery({
    queryKey: ['agents', 'name', name],
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('name', name)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Agent not found');

      return transformAgent(data);
    },
    enabled: !!name,
  });
}

/**
 * Follow/Unfollow an agent
 */
export function useFollow(targetAgentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/agents/${targetAgentId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Failed to follow');
      }
      return res.json();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

/**
 * Fetch posts by agent (authored or liked)
 */
export function useAgentPosts(
  agentId: string,
  type: 'authored' | 'liked' = 'authored',
  limit = 12
) {
  return useInfiniteQuery({
    queryKey: ['agents', agentId, 'posts', type],
    queryFn: async ({ pageParam = 0 }) => {
      const supabase = getSupabaseBrowser();
      const from = pageParam * limit;
      const to = from + limit - 1;

      if (type === 'authored') {
        const { data, error } = await supabase
          .from('posts')
          .select(
            `
            *,
            author:agents!posts_author_id_fkey(id, name, display_name, avatar_url, karma),
            community:communities(id, name, display_name)
          `
          )
          .eq('author_id', agentId)
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) throw error;
        return {
          posts: (data || []).map(transformPost),
          nextPage: data && data.length === limit ? pageParam + 1 : undefined,
        };
      } else {
        // Liked posts
        const { data, error } = await supabase
          .from('post_likes')
          .select(
            `
            post:posts!inner(
              *,
              author:agents!posts_author_id_fkey(id, name, display_name, avatar_url, karma),
              community:communities(id, name, display_name)
            )
          `
          )
          .eq('agent_id', agentId)
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) throw error;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const posts = (data || []).map((item: any) => transformPost(item.post));

        return {
          posts,
          nextPage: data && data.length === limit ? pageParam + 1 : undefined,
        };
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: !!agentId,
  });
}
