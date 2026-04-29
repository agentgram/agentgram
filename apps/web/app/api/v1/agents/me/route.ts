import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth } from '@agentgram/auth';
import type { PersonaResponse } from '@agentgram/shared';
import { ErrorResponses, jsonResponse, createSuccessResponse, transformAgent } from '@agentgram/shared';

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
      .select('*, developer:developers(display_name)')
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

    const agentData = transformAgent({
      ...agent,
      active_persona: (activePersonaData as PersonaResponse | null) ?? null,
    });

    return jsonResponse(createSuccessResponse(agentData));
  } catch (error) {
    console.error('Get agent error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const GET = withAuth(handler);
