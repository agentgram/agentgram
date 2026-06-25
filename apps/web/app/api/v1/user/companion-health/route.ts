import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withDeveloperAuth } from '@/lib/auth/developer';

export interface CompanionHealthData {
  agentId: string;
  frequencyScore: number;
  memoryDepth: number;
  milestoneCount: number;
  lastActiveAt: string;
}

export interface CompanionHealthResponse {
  success: true;
  data: CompanionHealthData;
}

/**
 * GET /api/v1/user/companion-health?agentId=<id>
 *
 * Returns relationship health signals for a companion agent.
 * Auth-gated: only the session owner can fetch their own health data.
 *
 * - frequencyScore: 0-100 computed from chat session frequency over last 30 days
 * - memoryDepth: count of pinned/auto-saved facts for this agent
 * - milestoneCount: how many relationship milestones have been reached
 * - lastActiveAt: ISO timestamp of most recent session
 */
export const GET = withDeveloperAuth(async function GET(req: NextRequest) {
  const developerId = req.headers.get('x-developer-id');

  if (!developerId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    );
  }

  const agentId = req.nextUrl.searchParams.get('agentId');

  if (!agentId) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'agentId query param is required' } },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServiceClient();

  // Verify the agent belongs to this developer
  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('id, last_active, developer_id')
    .eq('id', agentId)
    .single();

  if (agentError || !agent) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Agent not found' } },
      { status: 404 }
    );
  }

  if (agent.developer_id !== developerId) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'You do not own this agent' } },
      { status: 403 }
    );
  }

  // Memory depth: count of pinned/auto-saved facts (agent_memories rows)
  const { count: memoryDepth } = await supabase
    .from('agent_memories')
    .select('id', { count: 'exact', head: true })
    .eq('agent_id', agentId);

  const resolvedMemoryDepth = memoryDepth ?? 0;

  // Frequency score: stub returning 0 until chat_sessions table is provisioned.
  // Formula once live: min(100, round((sessionsLast30Days / 30) * 100))
  // TODO: replace stub with real chat_sessions query when table is in schema.
  const frequencyScore = 0;

  // Milestone count: derived from memory depth as a proxy until chat_sessions exists.
  // Thresholds: 1 fact = first memory saved, 3 = growing, 6 = deep, 10 = committed.
  let milestoneCount = 0;
  if (resolvedMemoryDepth >= 1) milestoneCount = 1;
  if (resolvedMemoryDepth >= 3) milestoneCount = 2;
  if (resolvedMemoryDepth >= 6) milestoneCount = 3;
  if (resolvedMemoryDepth >= 10) milestoneCount = 4;

  const lastActiveAt = agent.last_active ?? new Date().toISOString();

  return NextResponse.json({
    success: true,
    data: {
      agentId,
      frequencyScore,
      memoryDepth: resolvedMemoryDepth,
      milestoneCount,
      lastActiveAt,
    },
  } satisfies CompanionHealthResponse);
});
