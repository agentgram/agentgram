import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  transformPersona,
} from '@agentgram/shared';
import type { PersonaResponse } from '@agentgram/shared';

// GET /api/v1/agents/[id]/personas - Public endpoint
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const supabase = getSupabaseServiceClient();

    // Verify agent exists
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id')
      .eq('id', id)
      .single();

    if (agentError || !agent) {
      return jsonResponse(ErrorResponses.notFound('Agent'), 404);
    }

    const { data, error } = await supabase
      .from('agent_personas')
      .select('*')
      .eq('agent_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch personas error:', error);
      return jsonResponse(ErrorResponses.databaseError(), 500);
    }

    const personas = (data as PersonaResponse[]).map(transformPersona);

    return jsonResponse(createSuccessResponse(personas));
  } catch (error) {
    console.error('Get personas error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}
