import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth, withRateLimit } from '@agentgram/auth';
import {
  CONTENT_LIMITS,
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  sanitizePersonaName,
  sanitizePersonaText,
  validateUrl,
  transformPersona,
} from '@agentgram/shared';
import type { CreatePersona, PersonaResponse } from '@agentgram/shared';

// GET /api/v1/agents/me/personas - Get all my personas
async function getHandler(req: NextRequest) {
  try {
    const agentId = req.headers.get('x-agent-id');

    if (!agentId) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    const supabase = getSupabaseServiceClient();

    const { data, error } = await supabase
      .from('agent_personas')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch my personas error:', error);
      return jsonResponse(ErrorResponses.databaseError(), 500);
    }

    const personas = (data as PersonaResponse[]).map(transformPersona);

    return jsonResponse(createSuccessResponse(personas));
  } catch (error) {
    console.error('Get my personas error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

// POST /api/v1/agents/me/personas - Create a persona
async function createHandler(req: NextRequest) {
  try {
    const agentId = req.headers.get('x-agent-id');

    if (!agentId) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    const supabase = getSupabaseServiceClient();

    // Check persona count limit
    const { count, error: countError } = await supabase
      .from('agent_personas')
      .select('id', { count: 'exact', head: true })
      .eq('agent_id', agentId);

    if (countError) {
      console.error('Count personas error:', countError);
      return jsonResponse(ErrorResponses.databaseError(), 500);
    }

    if ((count ?? 0) >= CONTENT_LIMITS.MAX_PERSONAS_PER_AGENT) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: 'PERSONA_LIMIT_REACHED',
            message: `Maximum ${CONTENT_LIMITS.MAX_PERSONAS_PER_AGENT} personas per agent`,
          },
        },
        400
      );
    }

    const body = (await req.json()) as CreatePersona;

    if (!body.name || body.name.trim().length < CONTENT_LIMITS.PERSONA_NAME_MIN) {
      return jsonResponse(
        ErrorResponses.invalidInput(
          `Persona name must be at least ${CONTENT_LIMITS.PERSONA_NAME_MIN} characters`
        ),
        400
      );
    }

    if (body.soulUrl && !validateUrl(body.soulUrl)) {
      return jsonResponse(
        ErrorResponses.invalidInput('Invalid soul URL format'),
        400
      );
    }

    // If isActive, deactivate existing active persona first
    if (body.isActive) {
      await supabase
        .from('agent_personas')
        .update({ is_active: false })
        .eq('agent_id', agentId)
        .eq('is_active', true);
    }

    // Sanitize inputs
    const { data, error } = await supabase
      .from('agent_personas')
      .insert({
        agent_id: agentId,
        name: sanitizePersonaName(body.name),
        role: body.role !== undefined
          ? sanitizePersonaText(body.role, CONTENT_LIMITS.PERSONA_ROLE_MAX)
          : null,
        personality: body.personality !== undefined
          ? sanitizePersonaText(body.personality, CONTENT_LIMITS.PERSONA_PERSONALITY_MAX)
          : null,
        backstory: body.backstory !== undefined
          ? sanitizePersonaText(body.backstory, CONTENT_LIMITS.PERSONA_BACKSTORY_MAX)
          : null,
        communication_style: body.communicationStyle !== undefined
          ? sanitizePersonaText(body.communicationStyle, CONTENT_LIMITS.PERSONA_COMMUNICATION_STYLE_MAX)
          : null,
        catchphrase: body.catchphrase !== undefined
          ? sanitizePersonaText(body.catchphrase, CONTENT_LIMITS.PERSONA_CATCHPHRASE_MAX)
          : null,
        soul_url: body.soulUrl ?? null,
        is_active: body.isActive ?? false,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Create persona error:', error);
      return jsonResponse(ErrorResponses.databaseError(), 500);
    }

    const persona = transformPersona(data as PersonaResponse);

    return jsonResponse(createSuccessResponse(persona), 201);
  } catch (error) {
    console.error('Create persona error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const GET = withAuth(getHandler);
export const POST = withRateLimit('persona', withAuth(createHandler));
