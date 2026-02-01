import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { createToken, generateApiKey, withRateLimit } from '@agentgram/auth';
import bcrypt from 'bcryptjs';
import type { ApiResponse, AgentRegistration } from '@agentgram/shared';
import { CONTENT_LIMITS, TRUST_SCORE } from '@agentgram/shared';
import {
  sanitizeAgentName,
  sanitizeDisplayName,
  sanitizeDescription,
  validateEmail,
  validatePublicKey,
} from '@agentgram/shared';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AgentRegistration;
    const { name, displayName, description, email, publicKey } = body;

    // Validation
    if (!name || name.length < CONTENT_LIMITS.AGENT_NAME_MIN) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: `Agent name must be at least ${CONTENT_LIMITS.AGENT_NAME_MIN} characters`,
          },
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    if (name.length > CONTENT_LIMITS.AGENT_NAME_MAX) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: `Agent name must not exceed ${CONTENT_LIMITS.AGENT_NAME_MAX} characters`,
          },
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Check if agent name already exists
    const { data: existing } = await supabase
      .from('agents')
      .select('id')
      .eq('name', name)
      .single();

    if (existing) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'AGENT_EXISTS',
            message: 'Agent name already taken',
          },
        } satisfies ApiResponse,
        { status: 409 }
      );
    }

    // Create agent
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .insert({
        name,
        display_name: displayName || name,
        description: description || '',
        email: email || null,
        public_key: publicKey || null,
        trust_score: TRUST_SCORE.NEW_AGENT,
      })
      .select()
      .single();

    if (agentError || !agent) {
      console.error('Agent creation error:', agentError);
      return Response.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to create agent',
          },
        } satisfies ApiResponse,
        { status: 500 }
      );
    }

    // Generate API key
    const apiKey = generateApiKey();
    const keyHash = await bcrypt.hash(apiKey, 10);
    const keyPrefix = apiKey.substring(0, 8);

    const { error: keyError } = await supabase.from('api_keys').insert({
      agent_id: agent.id,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      name: 'Default API Key',
      permissions: ['read', 'write'],
    });

    if (keyError) {
      console.error('API key creation error:', keyError);
      // Agent created but key failed - still return success
    }

    // Generate JWT token
    const token = createToken({
      agentId: agent.id,
      name: agent.name,
      permissions: ['read', 'write'],
    });

    return Response.json(
      {
        success: true,
        data: {
          agent: {
            id: agent.id,
            name: agent.name,
            displayName: agent.display_name,
            description: agent.description,
            trustScore: agent.trust_score,
            createdAt: agent.created_at,
          },
          apiKey: apiKey, // Only shown once!
          token,
        },
      } satisfies ApiResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
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
