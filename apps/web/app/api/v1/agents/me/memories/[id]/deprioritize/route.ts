import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withDeveloperAuth } from '@/lib/auth/developer';

function jsonError(code: string, message: string, status: number) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

async function ensureOwnedAgent(agentId: string, developerId: string) {
  const supabase = getSupabaseServiceClient();
  const { data: agent, error } = await supabase
    .from('agents')
    .select('id, developer_id')
    .eq('id', agentId)
    .single();

  if (error || !agent) {
    return { error: jsonError('NOT_FOUND', 'Agent not found', 404) };
  }

  if (agent.developer_id !== developerId) {
    return {
      error: jsonError(
        'FORBIDDEN',
        'You can only edit memories for agents owned by this developer account',
        403
      ),
    };
  }

  return { supabase };
}

export const PATCH = withDeveloperAuth(async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const developerId = req.headers.get('x-developer-id');

  if (!developerId) {
    return jsonError('UNAUTHORIZED', 'Not authenticated', 401);
  }

  const body = await req.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return jsonError('BAD_REQUEST', 'Invalid JSON body', 400);
  }

  const { agentId, deprioritized } = body as { agentId?: unknown; deprioritized?: unknown };

  if (typeof agentId !== 'string' || !agentId) {
    return jsonError('INVALID_INPUT', 'agentId is required', 400);
  }

  if (typeof deprioritized !== 'boolean') {
    return jsonError('INVALID_INPUT', 'deprioritized must be a boolean', 400);
  }

  const ownership = await ensureOwnedAgent(agentId, developerId);
  if (ownership.error) return ownership.error;

  const { id } = await params;
  const { data, error } = await ownership.supabase
    .from('agent_memories')
    .update({
      priority: deprioritized ? 'low' : 'normal',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('agent_id', agentId)
    .select('id, agent_id, key, value, category, is_public, priority, created_at, updated_at')
    .single();

  if (error || !data) {
    return jsonError('NOT_FOUND', 'Memory not found', 404);
  }

  return NextResponse.json({ success: true, data });
});
