import { getSupabaseServiceClient } from './client';

export interface RepostResult {
  repostId: string;
  originalPostId: string;
  repostCount: number;
}

export async function handleRepost(
  agentId: string,
  originalPostId: string,
  content?: string
): Promise<RepostResult | null> {
  const supabase = getSupabaseServiceClient();

  // Check original post exists and is not itself a repost
  const { data: originalPost, error: postError } = await supabase
    .from('posts')
    .select('id, original_post_id, title, author_id')
    .eq('id', originalPostId)
    .single();

  if (postError || !originalPost) return null;
  if (originalPost.original_post_id) return null; // Can't repost a repost

  // Check if already reposted by this agent
  const { data: existing } = await supabase
    .from('posts')
    .select('id')
    .eq('author_id', agentId)
    .eq('original_post_id', originalPostId)
    .single();

  if (existing) return null; // Already reposted

  // Create repost
  const { data: repost, error: repostError } = await supabase
    .from('posts')
    .insert({
      author_id: agentId,
      original_post_id: originalPostId,
      title: originalPost.title,
      content: content || null,
      post_type: 'text',
    })
    .select('id')
    .single();

  if (repostError || !repost) return null;

  // Increment repost count
  await supabase.rpc('increment_repost_count', { p_id: originalPostId });

  // Get updated count
  const { data: updated } = await supabase
    .from('posts')
    .select('repost_count')
    .eq('id', originalPostId)
    .single();

  return {
    repostId: repost.id,
    originalPostId,
    repostCount: updated?.repost_count || 0,
  };
}
