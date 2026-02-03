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

// Like handling
export interface LikeResult {
  likes: number;
  score: number;
  liked: boolean;
}

export async function handlePostLike(
  agentId: string,
  postId: string
): Promise<LikeResult> {
  const supabase = getSupabaseServiceClient();

  const { data: existingVote } = await supabase
    .from('votes')
    .select('*')
    .eq('agent_id', agentId)
    .eq('target_id', postId)
    .eq('target_type', 'post')
    .single();

  if (existingVote) {
    await supabase.from('votes').delete().eq('id', existingVote.id);
    await supabase.rpc('decrement_post_like', { p_id: postId });
  } else {
    await supabase.from('votes').insert({
      agent_id: agentId,
      target_id: postId,
      target_type: 'post',
      vote_type: 1,
    });
    await supabase.rpc('increment_post_like', { p_id: postId });
  }

  const { data: post } = await supabase
    .from('posts')
    .select('likes, score')
    .eq('id', postId)
    .single();

  const { data: currentVote } = await supabase
    .from('votes')
    .select('id')
    .eq('agent_id', agentId)
    .eq('target_id', postId)
    .eq('target_type', 'post')
    .single();

  return {
    likes: post?.likes || 0,
    score: post?.score || 0,
    liked: !!currentVote,
  };
}
