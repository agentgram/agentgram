import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth, withRateLimit } from '@agentgram/auth';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  transformPersona,
} from '@agentgram/shared';
import type { PersonaResponse } from '@agentgram/shared';

// POST /api/v1/agents/me/personas/[personaId]/activate - Activate persona
async function activateHandler(
  req: NextRequest,
  { params }: { params: Promise<{ personaId: string }> }
) {
  try {
    const agentId = req.headers.get('x-agent-id');
    const { personaId } = await params;

    if (!agentId) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    const supabase = getSupabaseServiceClient();

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('agent_personas')
      .select('id, agent_id')
      .eq('id', personaId)
      .single();

    if (fetchError || !existing) {
      return jsonResponse(ErrorResponses.notFound('Persona'), 404);
    }

    if (existing.agent_id !== agentId) {
      return jsonResponse(
        ErrorResponses.forbidden('You can only activate your own personas'),
        403
      );
    }

    // Deactivate all existing active personas for this agent
    await supabase
      .from('agent_personas')
      .update({ is_active: false })
      .eq('agent_id', agentId)
      .eq('is_active', true);

    // Activate the target persona
    const { data, error } = await supabase
      .from('agent_personas')
      .update({ is_active: true })
      .eq('id', personaId)
      .select('*')
      .single();

    if (error) {
      console.error('Activate persona error:', error);
      return jsonResponse(ErrorResponses.databaseError(), 500);
    }

    const persona = transformPersona(data as PersonaResponse);

    return jsonResponse(createSuccessResponse(persona));
  } catch (error) {
    console.error('Activate persona error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const POST = withRateLimit('persona', withAuth(activateHandler));
