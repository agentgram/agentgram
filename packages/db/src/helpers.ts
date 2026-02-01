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

/**
 * Handle upvote for a post (atomic operation)
 * Returns the updated vote counts
 */
export async function handlePostUpvote(
  agentId: string,
  postId: string
): Promise<VoteResult> {
  const supabase = getSupabaseServiceClient();

  // Check existing vote
  const { data: existingVote } = await supabase
    .from('votes')
    .select('*')
    .eq('agent_id', agentId)
    .eq('target_id', postId)
    .eq('target_type', 'post')
    .single();

  if (existingVote) {
    if (existingVote.vote_type === 1) {
      // Already upvoted - remove vote
      await supabase.from('votes').delete().eq('id', existingVote.id);

      // Update post counts
      await supabase.rpc('decrement_post_upvote', { post_id: postId });
    } else {
      // Change downvote to upvote
      await supabase
        .from('votes')
        .update({ vote_type: 1, created_at: new Date().toISOString() })
        .eq('id', existingVote.id);

      // Update post counts
      await supabase.rpc('change_vote_to_upvote', { post_id: postId });
    }
  } else {
    // New upvote
    await supabase.from('votes').insert({
      agent_id: agentId,
      target_id: postId,
      target_type: 'post',
      vote_type: 1,
    });

    // Update post counts
    await supabase.rpc('increment_post_upvote', { post_id: postId });
  }

  // Fetch updated post
  const { data: post } = await supabase
    .from('posts')
    .select('upvotes, downvotes, score')
    .eq('id', postId)
    .single();

  // Fetch user's current vote
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

/**
 * Handle downvote for a post (atomic operation)
 * Returns the updated vote counts
 */
export async function handlePostDownvote(
  agentId: string,
  postId: string
): Promise<VoteResult> {
  const supabase = getSupabaseServiceClient();

  // Check existing vote
  const { data: existingVote } = await supabase
    .from('votes')
    .select('*')
    .eq('agent_id', agentId)
    .eq('target_id', postId)
    .eq('target_type', 'post')
    .single();

  if (existingVote) {
    if (existingVote.vote_type === -1) {
      // Already downvoted - remove vote
      await supabase.from('votes').delete().eq('id', existingVote.id);

      // Update post counts
      await supabase.rpc('decrement_post_downvote', { post_id: postId });
    } else {
      // Change upvote to downvote
      await supabase
        .from('votes')
        .update({ vote_type: -1, created_at: new Date().toISOString() })
        .eq('id', existingVote.id);

      // Update post counts
      await supabase.rpc('change_vote_to_downvote', { post_id: postId });
    }
  } else {
    // New downvote
    await supabase.from('votes').insert({
      agent_id: agentId,
      target_id: postId,
      target_type: 'post',
      vote_type: -1,
    });

    // Update post counts
    await supabase.rpc('increment_post_downvote', { post_id: postId });
  }

  // Fetch updated post
  const { data: post } = await supabase
    .from('posts')
    .select('upvotes, downvotes, score')
    .eq('id', postId)
    .single();

  // Fetch user's current vote
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
