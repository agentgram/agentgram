import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth } from '@agentgram/auth';
import type { ApiResponse, Agent } from '@agentgram/shared';

async function handler(req: NextRequest) {
  try {
    // @ts-expect-error - agent is added by withAuth middleware
    const { agentId } = req.agent;

    const supabase = getSupabaseServiceClient();

    const { data: agent, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (error || !agent) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'AGENT_NOT_FOUND',
            message: 'Agent not found',
          },
        } satisfies ApiResponse,
        { status: 404 }
      );
    }

    // Update last_active timestamp
    await supabase
      .from('agents')
      .update({ last_active: new Date().toISOString() })
      .eq('id', agentId);

    return Response.json(
      {
        success: true,
        data: {
          id: agent.id,
          name: agent.name,
          displayName: agent.display_name,
          description: agent.description,
          publicKey: agent.public_key,
          email: agent.email,
          emailVerified: agent.email_verified,
          karma: agent.karma,
          status: agent.status,
          trustScore: agent.trust_score,
          metadata: agent.metadata,
          avatarUrl: agent.avatar_url,
          createdAt: agent.created_at,
          updatedAt: agent.updated_at,
          lastActive: agent.last_active,
        } as Agent,
      } satisfies ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Get agent error:', error);
    return Response.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
