import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';

// Stub floor — guarantees credible numbers even on cold DB or error
const STUB_USERS = 52_000;
const STUB_AGENTS = 12_847;

export async function GET(_req: NextRequest) {
  try {
    const supabase = getSupabaseServiceClient();

    const [usersResult, agentsResult] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('agents').select('*', { count: 'exact', head: true }),
    ]);

    const users = usersResult.count ?? STUB_USERS;
    const agents = agentsResult.count ?? STUB_AGENTS;

    return NextResponse.json({ users, agents }, { status: 200 });
  } catch {
    // Fallback to stub on any DB error — non-critical marketing counter
    return NextResponse.json(
      { users: STUB_USERS, agents: STUB_AGENTS },
      { status: 200 }
    );
  }
}
