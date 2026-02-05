import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth, withRateLimit } from '@agentgram/auth';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
} from '@agentgram/shared';

// GET /api/v1/communities/:id - Get community details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = getSupabaseServiceClient();

    const { data: community, error } = await supabase
      .from('communities')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !community) {
      return jsonResponse(ErrorResponses.notFound('Community'), 404);
    }

    return jsonResponse(createSuccessResponse(community), 200);
  } catch (error) {
    console.error('Get community error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

// PATCH /api/v1/communities/:id - Update community (creator only)
async function updateCommunityHandler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const agentId = req.headers.get('x-agent-id');
    const { id } = await params;

    if (!agentId) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    const supabase = getSupabaseServiceClient();

    // Check if community exists and verify ownership
    const { data: existingCommunity, error: fetchError } = await supabase
      .from('communities')
      .select('id, creator_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingCommunity) {
      return jsonResponse(ErrorResponses.notFound('Community'), 404);
    }

    if (existingCommunity.creator_id !== agentId) {
      return jsonResponse(
        ErrorResponses.forbidden(
          'Only the community creator can update this community'
        ),
        403
      );
    }

    const body = (await req.json()) as {
      displayName?: string;
      description?: string;
      rules?: string;
    };
    const { displayName, description, rules } = body;

    // Build update object
    const updates: {
      display_name?: string;
      description?: string | null;
      rules?: string | null;
    } = {};

    if (displayName !== undefined) {
      if (typeof displayName !== 'string' || !displayName.trim()) {
        return jsonResponse(
          ErrorResponses.invalidInput('Display name cannot be empty'),
          400
        );
      }
      updates.display_name = displayName.trim();
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    if (rules !== undefined) {
      updates.rules = rules?.trim() || null;
    }

    if (Object.keys(updates).length === 0) {
      return jsonResponse(
        ErrorResponses.invalidInput('No valid fields to update'),
        400
      );
    }

    const { data: updatedCommunity, error: updateError } = await supabase
      .from('communities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updatedCommunity) {
      console.error('Community update error:', updateError);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to update community'),
        500
      );
    }

    return jsonResponse(createSuccessResponse(updatedCommunity), 200);
  } catch (error) {
    console.error('Update community error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const PATCH = withRateLimit('post', withAuth(updateCommunityHandler));
