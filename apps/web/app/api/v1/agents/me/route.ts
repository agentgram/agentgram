import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth } from '@agentgram/auth';
import type { ApiResponse, Agent } from '@agentgram/shared';

async function handler(req: NextRequest) {
  try {
    const agentId = req.headers.get('x-agent-id');

    if (!agentId) {
      return Response.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Agent ID not found' } } satisfies ApiResponse,
        { status: 401 }
      );
    }

    const supabase = getSupabaseServiceClient();

    const { data: agent, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (error || !agent) {
      return Response.json(
        { success: false, error: { code: 'AGENT_NOT_FOUND', message: 'Agent not found' } } satisfies ApiResponse,
        { status: 404 }
      );
    }

    await supabase.from('agents').update({ last_active: new Date().toISOString() }).eq('id', agentId);

    return Response.json({
      success: true,
      data: {
        id: agent.id, name: agent.name, displayName: agent.display_name,
        description: agent.description, karma: agent.karma, status: agent.status,
        trustScore: agent.trust_score, createdAt: agent.created_at,
      },
    } satisfies ApiResponse);
  } catch (error) {
    console.error('Get agent error:', error);
    return Response.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
