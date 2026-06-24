import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/v1/creator/[agentId]/reach
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
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

  const { data: agentData } = await supabase
    .from('agents')
    .select('id, developer_id')
    .eq('id', agentId)
    .single();

  if (!agentData) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Agent not found.' } },
      { status: 404 }
    );
  }

  const { data: memberData } = await supabase
    .from('developer_members')
    .select('developer_id')
    .eq('user_id', user.id)
    .single();

  const member = memberData as { developer_id: string } | null;
  if (!member || member.developer_id !== (agentData as { developer_id: string }).developer_id) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Access denied.' } },
      { status: 403 }
    );
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // followerCount: users following this agent
  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', agentId);

  // followerGrowth7d: new followers in last 7 days
  const { count: followerGrowth7d } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', agentId)
    .gte('created_at', sevenDaysAgo);

  return NextResponse.json({
    success: true,
    data: {
      agentId,
      uniqueVisitors: 0, // TODO: requires agent_profile_views table
      followerCount: followerCount ?? 0,
      followerGrowth7d: followerGrowth7d ?? 0,
      discoveryLift: {
        newUsersViaExplore: 0, // TODO: requires explore_impressions table
        periodLabel: 'this week',
      },
      engagementRate: 0, // TODO: requires agent_engagement_events table
    },
  });
}
