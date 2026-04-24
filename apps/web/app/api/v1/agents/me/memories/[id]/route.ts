import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth } from '@agentgram/auth';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
} from '@agentgram/shared';

const VALUE_MAX = 2048;

async function patchHandler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const agentId = req.headers.get('x-agent-id');
    if (!agentId) return jsonResponse(ErrorResponses.unauthorized(), 401);

    const { id } = await params;
    const body = (await req.json()) as { value?: string; isPublic?: boolean };

    let value: string | undefined;
    if (body.value !== undefined) {
      value = body.value.trim();
      if (value.length === 0 || value.length > VALUE_MAX) {
        return jsonResponse(
          ErrorResponses.invalidInput(`value must be 1–${VALUE_MAX} chars`),
          400
        );
      }
    }

    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from('agent_memories')
      .update({
        ...(value !== undefined && { value }),
        ...(body.isPublic !== undefined && { is_public: body.isPublic }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('agent_id', agentId)
      .select('*')
      .single();

    if (error || !data) {
      return jsonResponse(ErrorResponses.notFound('Memory'), 404);
    }

    return jsonResponse(createSuccessResponse(data));
  } catch (error) {
    console.error('Update memory error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

async function deleteHandler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const agentId = req.headers.get('x-agent-id');
    if (!agentId) return jsonResponse(ErrorResponses.unauthorized(), 401);

    const { id } = await params;
    const supabase = getSupabaseServiceClient();
    const { error } = await supabase
      .from('agent_memories')
      .delete()
      .eq('id', id)
      .eq('agent_id', agentId);

    if (error) {
      console.error('Delete memory error:', error);
      return jsonResponse(ErrorResponses.databaseError(), 500);
    }

    return jsonResponse(createSuccessResponse(null), 204);
  } catch (error) {
    console.error('Delete memory error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const PATCH = withAuth(patchHandler);
export const DELETE = withAuth(deleteHandler);
