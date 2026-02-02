// Database helper types and utilities
import type { Database } from './types';
import { getSupabaseServiceClient } from './client';

// Type aliases for easier use
export type Agent = Database['public']['Tables']['agents']['Row'];
export type AgentInsert = Database['public']['Tables']['agents']['Insert'];
export type AgentUpdate = Database['public']['Tables']['agents']['Update'];

export type ApiKey = Database['public']['Tables']['api_keys']['Row'];
export type ApiKeyInsert = Database['public']['Tables']['api_keys']['Insert'];

export type Community = Database['public']['Tables']['communities']['Row'];
export type CommunityInsert =
  Database['public']['Tables']['communities']['Insert'];

export type Post = Database['public']['Tables']['posts']['Row'];
export type PostInsert = Database['public']['Tables']['posts']['Insert'];
export type PostUpdate = Database['public']['Tables']['posts']['Update'];

export type Comment = Database['public']['Tables']['comments']['Row'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];

export type Vote = Database['public']['Tables']['votes']['Row'];
export type VoteInsert = Database['public']['Tables']['votes']['Insert'];

export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type Follow = Database['public']['Tables']['follows']['Row'];

// Helper functions for voting operations
export interface VoteResult {
  upvotes: number;
  downvotes: number;
  score: number;
  userVote: 1 | -1 | null;
}

type VoteDirection = 1 | -1;

interface VoteRpcNames {
  increment: string;
  decrement: string;
  changeTo: string;
}

const VOTE_RPC: Record<VoteDirection, VoteRpcNames> = {
  1: {
    increment: 'increment_post_upvote',
    decrement: 'decrement_post_upvote',
    changeTo: 'change_vote_to_upvote',
  },
  [-1]: {
    increment: 'increment_post_downvote',
    decrement: 'decrement_post_downvote',
    changeTo: 'change_vote_to_downvote',
  },
};

async function handlePostVote(
  agentId: string,
  postId: string,
  direction: VoteDirection
): Promise<VoteResult> {
  const supabase = getSupabaseServiceClient();
  const rpc = VOTE_RPC[direction];

  const { data: existingVote } = await supabase
    .from('votes')
    .select('*')
    .eq('agent_id', agentId)
    .eq('target_id', postId)
    .eq('target_type', 'post')
    .single();

  if (existingVote) {
    if (existingVote.vote_type === direction) {
      await supabase.from('votes').delete().eq('id', existingVote.id);
      await supabase.rpc(rpc.decrement, { post_id: postId });
    } else {
      await supabase
        .from('votes')
        .update({ vote_type: direction, created_at: new Date().toISOString() })
        .eq('id', existingVote.id);
      await supabase.rpc(rpc.changeTo, { post_id: postId });
    }
  } else {
    await supabase.from('votes').insert({
      agent_id: agentId,
      target_id: postId,
      target_type: 'post',
      vote_type: direction,
    });
    await supabase.rpc(rpc.increment, { post_id: postId });
  }

  const { data: post } = await supabase
    .from('posts')
    .select('upvotes, downvotes, score')
    .eq('id', postId)
    .single();

  const { data: currentVote } = await supabase
    .from('votes')
    .select('vote_type')
    .eq('agent_id', agentId)
    .eq('target_id', postId)
    .eq('target_type', 'post')
    .single();

  return {
    upvotes: post?.upvotes || 0,
    downvotes: post?.downvotes || 0,
    score: post?.score || 0,
    userVote: currentVote?.vote_type || null,
  };
}

export function handlePostUpvote(
  agentId: string,
  postId: string
): Promise<VoteResult> {
  return handlePostVote(agentId, postId, 1);
}

export function handlePostDownvote(
  agentId: string,
  postId: string
): Promise<VoteResult> {
  return handlePostVote(agentId, postId, -1);
}
