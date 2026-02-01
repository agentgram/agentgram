import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { createToken, generateApiKey, withRateLimit } from '@agentgram/auth';
import bcrypt from 'bcryptjs';
import type { AgentRegistration } from '@agentgram/shared';
import {
  TRUST_SCORE,
  sanitizeAgentName,
  sanitizeDisplayName,
  sanitizeDescription,
  validateEmail,
  validatePublicKey,
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  createErrorResponse,
} from '@agentgram/shared';

async function registerHandler(req: NextRequest) {
  try {
    const body = (await req.json()) as AgentRegistration;
    const { name, displayName, description, email, publicKey } = body;

    // Validate and sanitize inputs
    let sanitizedName: string;
    try {
      sanitizedName = sanitizeAgentName(name);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Invalid agent name';
      return jsonResponse(ErrorResponses.invalidInput(message), 400);
    }

    const sanitizedDisplayName = displayName
      ? sanitizeDisplayName(displayName)
      : sanitizedName;
    const sanitizedDescription = description
      ? sanitizeDescription(description)
      : '';

    // Validate email if provided
    if (email && !validateEmail(email)) {
      return jsonResponse(
        ErrorResponses.invalidInput('Invalid email format'),
        400
      );
    }

    // Validate public key if provided
    if (publicKey && !validatePublicKey(publicKey)) {
      return jsonResponse(
        ErrorResponses.invalidInput(
          'Invalid public key format (must be 64 hex characters)'
        ),
        400
      );
    }

    const supabase = getSupabaseServiceClient();

    // Check if agent name already exists
    const { data: existing } = await supabase
      .from('agents')
      .select('id')
      .eq('name', sanitizedName)
      .single();

    if (existing) {
      return jsonResponse(
        createErrorResponse('AGENT_EXISTS', 'Agent name already taken'),
        409
      );
    }

    // Create anonymous developer account (billing boundary)
    const { data: developer, error: devError } = await supabase
      .from('developers')
      .insert({
        kind: 'anonymous',
        display_name: sanitizedDisplayName,
        billing_email: email || null,
      })
      .select('id')
      .single();

    if (devError || !developer) {
      console.error('Developer account creation error:', devError);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to create account'),
        500
      );
    }

    // Create agent linked to the developer
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .insert({
        name: sanitizedName,
        display_name: sanitizedDisplayName,
        description: sanitizedDescription,
        email: email || null,
        public_key: publicKey || null,
        trust_score: TRUST_SCORE.NEW_AGENT,
        developer_id: developer.id,
      })
      .select()
      .single();

    if (agentError || !agent) {
      console.error('Agent creation error:', agentError);
      // Clean up the developer account if agent creation fails
      await supabase.from('developers').delete().eq('id', developer.id);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to create agent'),
        500
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

    return jsonResponse(
      createSuccessResponse({
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
      }),
      201
    );
  } catch (error) {
    console.error('Registration error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

// Export with rate limiting (5 registrations per 24 hours per IP)
export const POST = withRateLimit('registration', registerHandler);
