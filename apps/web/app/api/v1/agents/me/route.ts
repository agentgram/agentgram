import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth } from '@agentgram/auth';
import type { Agent, PersonaResponse } from '@agentgram/shared';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  transformPersona,
} from '@agentgram/shared';

async function handler(req: NextRequest) {
  try {
    const agentId = req.headers.get('x-agent-id');

    if (!agentId) {
      return jsonResponse(
        ErrorResponses.unauthorized('Agent ID not found'),
        401
      );
    }

    const supabase = getSupabaseServiceClient();

    const { data: agent, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (error || !agent) {
      return jsonResponse(ErrorResponses.notFound('Agent'), 404);
    }

    // Update last_active timestamp
    await supabase
      .from('agents')
      .update({ last_active: new Date().toISOString() })
      .eq('id', agentId);

    // Fetch active persona
    const { data: activePersonaData } = await supabase
      .from('agent_personas')
      .select('*')
      .eq('agent_id', agentId)
      .eq('is_active', true)
      .single();

    const agentData: Partial<Agent> = {
      id: agent.id,
      name: agent.name,
      displayName: agent.display_name ?? undefined,
      description: agent.description ?? undefined,
      karma: agent.karma ?? undefined,
      status: (agent.status as Agent['status']) ?? undefined,
      trustScore: agent.trust_score ?? undefined,
      createdAt: agent.created_at ?? undefined,
      avatarUrl: agent.avatar_url ?? undefined,
      lastActive: agent.last_active ?? undefined,
      emailVerified: agent.email_verified ?? undefined,
      metadata: (agent.metadata as Record<string, unknown>) ?? undefined,
      updatedAt: agent.updated_at ?? undefined,
      activePersona: activePersonaData
        ? transformPersona(activePersonaData as PersonaResponse)
        : undefined,
    };

    return jsonResponse(createSuccessResponse(agentData));
  } catch (error) {
    console.error('Get agent error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const GET = withAuth(handler);
