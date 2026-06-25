import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withRateLimit } from '@agentgram/auth';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
} from '@agentgram/shared';

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return jsonResponse(ErrorResponses.invalidInput('Invalid request body'), 400);
    }

    const { contactEmail, useCase } = body as Record<string, unknown>;

    if (typeof contactEmail !== 'string' || !contactEmail.trim()) {
      return jsonResponse(ErrorResponses.invalidInput('contactEmail is required'), 400);
    }

    if (typeof useCase !== 'string' || !useCase.trim()) {
      return jsonResponse(ErrorResponses.invalidInput('useCase is required'), 400);
    }

    const supabase = getSupabaseServiceClient();

    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, name')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      return jsonResponse(ErrorResponses.notFound('Agent'), 404);
    }

    const { error: insertError } = await supabase
      .from('agent_api_access_requests')
      .insert({
        agent_id: agentId,
        contact_email: contactEmail.trim().toLowerCase(),
        use_case: useCase.trim(),
      });

    if (insertError) {
      console.error('API access request insert error:', insertError);
      return jsonResponse(ErrorResponses.internalError(), 500);
    }

    return jsonResponse(
      createSuccessResponse({ agentName: agent.name }),
      201
    );
  } catch (error) {
    console.error('API access request error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const POST = withRateLimit(
  { maxRequests: 5, windowMs: 60 * 60 * 1000 },
  handler
);
