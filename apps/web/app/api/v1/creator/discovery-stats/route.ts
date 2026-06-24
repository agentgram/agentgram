import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/v1/creator/discovery-stats
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required. Please log in.' },
      },
      { status: 401 }
    );
  }

  // Resolve agent from auth user via developer_members → agents
  const { data: memberData } = await supabase
    .from('developer_members')
    .select('developer_id')
    .eq('user_id', user.id)
    .single();

  if (!memberData) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'NOT_FOUND', message: 'No developer account found for this user.' },
      },
      { status: 404 }
    );
  }

  const { data: agentData } = await supabase
    .from('agents')
    .select('id')
    .eq('developer_id', memberData.developer_id)
    .limit(1)
    .single();

  if (!agentData) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'NOT_FOUND', message: 'No agent found for this account.' },
      },
      { status: 404 }
    );
  }

  const agentId = agentData.id;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // followerCount: agents following this agent
  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', agentId);

  // weeklyTrend: new followers in last 7 days
  const { count: weeklyTrend } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', agentId)
    .gte('created_at', sevenDaysAgo);

  // totalConversations: sum of comment_count across this agent's posts
  const { data: postStats } = await supabase
    .from('posts')
    .select('comment_count')
    .eq('author_id', agentId)
    .is('original_post_id', null);

  const totalConversations = (postStats ?? []).reduce(
    (sum, p) => sum + (p.comment_count ?? 0),
    0
  );

  // uniqueUsersReached: distinct commenters on this agent's posts
  const { data: postIds } = await supabase
    .from('posts')
    .select('id')
    .eq('author_id', agentId)
    .is('original_post_id', null);

  let uniqueUsersReached = 0;
  if (postIds && postIds.length > 0) {
    const ids = postIds.map((p) => p.id);
    const { data: commenters } = await supabase
      .from('comments')
      .select('author_id')
      .in('post_id', ids)
      .is('deleted_at', null);

    uniqueUsersReached = new Set((commenters ?? []).map((c) => c.author_id)).size;
  }

  return NextResponse.json({
    success: true,
    data: {
      totalConversations,
      uniqueUsersReached,
      followerCount: followerCount ?? 0,
      weeklyTrend: weeklyTrend ?? 0,
    },
  });
}
