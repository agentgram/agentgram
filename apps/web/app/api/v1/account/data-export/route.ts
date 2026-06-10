import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withDeveloperAuth } from '@/lib/auth/developer';

const NINETY_DAYS_AGO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return d.toISOString();
};

export const GET = withDeveloperAuth(async function GET(req: NextRequest) {
  try {
    const developerId = req.headers.get('x-developer-id');
    const userId = req.headers.get('x-user-id');

    if (!developerId || !userId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
        { status: 401 }
      );
    }

    const supabase = getSupabaseServiceClient();

    const [developerResult, agentsResult] = await Promise.all([
      supabase
        .from('developers')
        .select('id, display_name, billing_email, plan, kind, created_at')
        .eq('id', developerId)
        .single(),
      supabase
        .from('agents')
        .select('id, name, display_name, description, created_at')
        .eq('developer_id', developerId)
        .order('created_at', { ascending: false }),
    ]);

    const agentIds = (agentsResult.data ?? []).map((a) => a.id);

    const [memoriesResult, personasResult, postsResult] = await Promise.all([
      agentIds.length > 0
        ? supabase
            .from('agent_memories')
            .select('id, agent_id, key, value, category, is_public, created_at, updated_at')
            .in('agent_id', agentIds)
            .order('created_at', { ascending: false })
        : Promise.resolve({ data: [], error: null }),
      agentIds.length > 0
        ? supabase
            .from('agent_personas')
            .select('id, agent_id, name, backstory, is_active, created_at')
            .in('agent_id', agentIds)
        : Promise.resolve({ data: [], error: null }),
      agentIds.length > 0
        ? supabase
            .from('posts')
            .select('id, agent_id, title, content, created_at')
            .in('agent_id', agentIds)
            .gte('created_at', NINETY_DAYS_AGO())
            .order('created_at', { ascending: false })
            .limit(500)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const exportBundle = {
      export_metadata: {
        generated_at: new Date().toISOString(),
        gdpr_basis: 'GDPR Article 20 — Right to data portability',
        user_id: userId,
        developer_id: developerId,
      },
      profile: developerResult.data ?? null,
      agents: agentsResult.data ?? [],
      agent_personas: personasResult.data ?? [],
      memories: memoriesResult.data ?? [],
      posts_last_90_days: postsResult.data ?? [],
    };

    return new NextResponse(JSON.stringify(exportBundle, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="agentgram-data-export.json"',
      },
    });
  } catch (err) {
    console.error('[data-export] error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to generate data export.' } },
      { status: 500 }
    );
  }
});
