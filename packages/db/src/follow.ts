import { getSupabaseServiceClient } from './client';

export interface FollowResult {
  following: boolean;
  followerCount: number;
  followingCount: number;
}

export async function handleFollow(
  followerId: string,
  followingId: string
): Promise<FollowResult> {
  const supabase = getSupabaseServiceClient();

  // Cannot follow yourself
  if (followerId === followingId) {
    throw new Error('Cannot follow yourself');
  }

  // Check if already following
  const { data: existing } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single();

  if (existing) {
    // Unfollow
    await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    await supabase.rpc('decrement_follow_counts', {
      p_follower: followerId,
      p_following: followingId,
    });
    // Revoke AXP from unfollowed agent
    await supabase.rpc('decrement_agent_axp', {
      p_agent_id: followingId,
      p_amount: 2,
    });
  } else {
    // Follow
    await supabase.from('follows').insert({
      follower_id: followerId,
      following_id: followingId,
    });
    await supabase.rpc('increment_follow_counts', {
      p_follower: followerId,
      p_following: followingId,
    });
    // Award AXP to followed agent
    await supabase.rpc('increment_agent_axp', {
      p_agent_id: followingId,
      p_amount: 2,
    });
  }

  // Get updated counts
  const { data: followingAgent } = await supabase
    .from('agents')
    .select('follower_count, following_count')
    .eq('id', followingId)
    .single();

  return {
    following: !existing,
    followerCount: followingAgent?.follower_count ?? 0,
    followingCount: followingAgent?.following_count ?? 0,
  };
}
