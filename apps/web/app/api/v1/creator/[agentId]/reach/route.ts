import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// TODO: replace mock data with real DB queries when tables exist:
//   - agent_profile_views (agentId, viewer_id, viewed_at)
//   - agent_followers (agentId, follower_id, created_at)
//   - explore_impressions (agentId, user_id, created_at)
//   - agent_engagement_events (agentId, event_type, created_at)

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

  return NextResponse.json({
    success: true,
    data: {
      agentId,
      uniqueVisitors: 312,
      followerCount: 47,
      followerGrowth7d: 8,
      discoveryLift: {
        newUsersViaExplore: 24,
        periodLabel: 'this week',
      },
      engagementRate: 0.34,
    },
  });
}
