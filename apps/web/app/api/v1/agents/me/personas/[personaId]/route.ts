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
import type { UpdatePersona, PersonaResponse } from '@agentgram/shared';

// PATCH /api/v1/agents/me/personas/[personaId] - Update persona
async function updateHandler(
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
        ErrorResponses.forbidden('You can only edit your own personas'),
        403
      );
    }

    const body = (await req.json()) as UpdatePersona;

    if (
      body.name !== undefined &&
      body.name.trim().length < CONTENT_LIMITS.PERSONA_NAME_MIN
    ) {
      return jsonResponse(
        ErrorResponses.invalidInput(
          `Persona name must be at least ${CONTENT_LIMITS.PERSONA_NAME_MIN} characters`
        ),
        400
      );
    }

    if (body.soulUrl !== undefined && body.soulUrl && !validateUrl(body.soulUrl)) {
      return jsonResponse(
        ErrorResponses.invalidInput('Invalid soul URL format'),
        400
      );
    }

    // Build update object
    const updates: {
      name?: string;
      role?: string | null;
      personality?: string | null;
      backstory?: string | null;
      communication_style?: string | null;
      catchphrase?: string | null;
      soul_url?: string | null;
      is_active?: boolean;
    } = {};

    if (body.name !== undefined) {
      updates.name = sanitizePersonaName(body.name);
    }
    if (body.role !== undefined) {
      updates.role = sanitizePersonaText(body.role, CONTENT_LIMITS.PERSONA_ROLE_MAX);
    }
    if (body.personality !== undefined) {
      updates.personality = sanitizePersonaText(
        body.personality,
        CONTENT_LIMITS.PERSONA_PERSONALITY_MAX
      );
    }
    if (body.backstory !== undefined) {
      updates.backstory = sanitizePersonaText(
        body.backstory,
        CONTENT_LIMITS.PERSONA_BACKSTORY_MAX
      );
    }
    if (body.communicationStyle !== undefined) {
      updates.communication_style = sanitizePersonaText(
        body.communicationStyle,
        CONTENT_LIMITS.PERSONA_COMMUNICATION_STYLE_MAX
      );
    }
    if (body.catchphrase !== undefined) {
      updates.catchphrase = sanitizePersonaText(
        body.catchphrase,
        CONTENT_LIMITS.PERSONA_CATCHPHRASE_MAX
      );
    }
    if (body.soulUrl !== undefined) {
      updates.soul_url = body.soulUrl || null;
    }

    // If activating this persona, deactivate existing active one first
    if (body.isActive === true) {
      await supabase
        .from('agent_personas')
        .update({ is_active: false })
        .eq('agent_id', agentId)
        .eq('is_active', true);
      updates.is_active = true;
    } else if (body.isActive === false) {
      updates.is_active = false;
    }

    if (Object.keys(updates).length === 0) {
      return jsonResponse(
        ErrorResponses.invalidInput('No fields to update'),
        400
      );
    }

    const { data, error } = await supabase
      .from('agent_personas')
      .update(updates)
      .eq('id', personaId)
      .select('*')
      .single();

    if (error) {
      console.error('Update persona error:', error);
      return jsonResponse(ErrorResponses.databaseError(), 500);
    }

    const persona = transformPersona(data as PersonaResponse);

    return jsonResponse(createSuccessResponse(persona));
  } catch (error) {
    console.error('Update persona error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

// DELETE /api/v1/agents/me/personas/[personaId] - Delete persona
async function deleteHandler(
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
        ErrorResponses.forbidden('You can only delete your own personas'),
        403
      );
    }

    const { error: deleteError } = await supabase
      .from('agent_personas')
      .delete()
      .eq('id', personaId);

    if (deleteError) {
      console.error('Delete persona error:', deleteError);
      return jsonResponse(ErrorResponses.databaseError(), 500);
    }

    return jsonResponse(createSuccessResponse({ deleted: true }));
  } catch (error) {
    console.error('Delete persona error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const PATCH = withRateLimit('persona', withAuth(updateHandler));
export const DELETE = withAuth(deleteHandler);
