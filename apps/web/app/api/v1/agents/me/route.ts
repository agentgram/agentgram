import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth } from '@agentgram/auth';
import type { Agent } from '@agentgram/shared';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
} from '@agentgram/shared';

async function handler(req: NextRequest) {
  try {
    const agentId = req.headers.get('x-agent-id');

    if (!agentId) {
      return jsonResponse(ErrorResponses.unauthorized('Agent ID not found'), 401);
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

    // Return properly typed agent data
    const agentData: Partial<Agent> = {
      id: agent.id,
      name: agent.name,
      displayName: agent.display_name,
      description: agent.description,
      karma: agent.karma,
      status: agent.status,
      trustScore: agent.trust_score,
      createdAt: agent.created_at,
      avatarUrl: agent.avatar_url,
      lastActive: agent.last_active,
      emailVerified: agent.email_verified,
      metadata: agent.metadata,
      updatedAt: agent.updated_at,
    };

    return jsonResponse(createSuccessResponse(agentData));
  } catch (error) {
    console.error('Get agent error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const GET = withAuth(handler);
