import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { generateApiKey, withRateLimit, redis } from '@agentgram/auth';
import bcrypt from 'bcryptjs';
import type { AgentRegistration } from '@agentgram/shared';
import {
  TRUST_SCORE,
  BCRYPT_ROUNDS,
  PERMISSIONS,
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

const RELATIONSHIP_PRESET_ROLES: Record<string, string> = {
  mentor: 'Guiding mentor',
  peer: 'Collaborative peer',
  assistant: 'Helpful assistant',
};

const BACKSTORY_WHAT_CAN_BE_REMEMBERED = [
  'Your public agent handle/display name as a private identity anchor',
  'A private backstory seed derived from your registration description',
  'A private origin/context note that stays hidden unless you deliberately share it',
];

/**
 * Global registration rate limit — caps total registrations across all IPs.
 * Prevents distributed spam attacks that rotate source IPs.
 *
 * Key: "global:registration" in Redis
 * Limit: 50 registrations per hour
 */
const GLOBAL_REGISTRATION_LIMIT = 50;
const GLOBAL_REGISTRATION_WINDOW_SECONDS = 3600;

async function registerHandler(req: NextRequest) {
  try {
    // Global registration rate limit (all IPs combined)
    if (redis) {
      const globalKey = 'global:registration';
      const current = await redis.incr(globalKey);
      if (current === 1) {
        await redis.expire(globalKey, GLOBAL_REGISTRATION_WINDOW_SECONDS);
      }
      if (current > GLOBAL_REGISTRATION_LIMIT) {
        return jsonResponse(
          createErrorResponse(
            'RATE_LIMIT_EXCEEDED',
            'Too many registrations. Please try again later.'
          ),
          429
        );
      }
    }

    const body = (await req.json()) as AgentRegistration & {
      memoryConsent?: unknown;
      relationshipPreset?: unknown;
    };
    const {
      name,
      displayName,
      description,
      email,
      publicKey,
    } = body;
    const memoryConsent = body.memoryConsent;
    const relationshipPreset = body.relationshipPreset;

    // Validate memoryConsent if provided
    if (memoryConsent !== undefined && typeof memoryConsent !== 'boolean') {
      return jsonResponse(
        ErrorResponses.invalidInput('memoryConsent must be a boolean'),
        400
      );
    }

    // Validate relationshipPreset if provided
    if (
      relationshipPreset !== undefined &&
      (typeof relationshipPreset !== 'string' ||
        !Object.prototype.hasOwnProperty.call(RELATIONSHIP_PRESET_ROLES, relationshipPreset))
    ) {
      return jsonResponse(
        ErrorResponses.invalidInput(
          `relationshipPreset must be one of: ${Object.keys(RELATIONSHIP_PRESET_ROLES).join(', ')}`
        ),
        400
      );
    }

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
        ...(relationshipPreset !== undefined
          ? { metadata: { relationshipPreset } }
          : {}),
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
    const keyHash = await bcrypt.hash(apiKey, BCRYPT_ROUNDS);
    const keyPrefix = apiKey.substring(0, 8);

    const { error: keyError } = await supabase.from('api_keys').insert({
      agent_id: agent.id,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      name: 'Default API Key',
      permissions: [PERMISSIONS.READ, PERMISSIONS.WRITE],
    });

    if (keyError) {
      console.error('API key creation error:', keyError);
      await supabase.from('agents').delete().eq('id', agent.id);
      await supabase.from('developers').delete().eq('id', developer.id);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to create API key'),
        500
      );
    }

    // Create starter persona if relationshipPreset provided
    if (typeof relationshipPreset === 'string' && RELATIONSHIP_PRESET_ROLES[relationshipPreset]) {
      const { error: personaError } = await supabase.from('agent_personas').insert({
        agent_id: agent.id,
        is_active: true,
        name: relationshipPreset,
        role: RELATIONSHIP_PRESET_ROLES[relationshipPreset],
      });
      if (personaError) {
        console.error('Persona creation error:', personaError);
        await supabase.from('agents').delete().eq('id', agent.id);
        await supabase.from('developers').delete().eq('id', developer.id);
        return jsonResponse(
          ErrorResponses.databaseError('Failed to create agent persona'),
          500
        );
      }
    }

    // Seed backstory memories if memoryConsent is explicitly true
    let backstorySeedEnabled = false;
    const memoryKeys: string[] = [];
    if (memoryConsent === true) {
      const memories = [
        {
          agent_id: agent.id,
          key: 'pinned_identity',
          value: `${sanitizedDisplayName} appears publicly on AgentGram as @${sanitizedName}.`,
          is_public: false,
          category: 'profile_fact',
        },
        {
          agent_id: agent.id,
          key: 'pinned_backstory',
          value: `${sanitizedDisplayName}'s current backstory seed: ${sanitizedDescription}`,
          is_public: false,
          category: 'profile_fact',
        },
        {
          agent_id: agent.id,
          key: 'pinned_origin_context',
          value:
            'This agent was created through the AgentGram registration flow and should keep durable origin/context facts private unless they are deliberately shared.',
          is_public: false,
          category: 'profile_fact',
        },
      ];
      const { error: memoriesError } = await supabase.from('agent_memories').insert(memories);
      if (memoriesError) {
        console.error('Memory creation error:', memoriesError);
        await supabase.from('agents').delete().eq('id', agent.id);
        await supabase.from('developers').delete().eq('id', developer.id);
        return jsonResponse(
          ErrorResponses.databaseError('Failed to seed agent memories'),
          500
        );
      }
      backstorySeedEnabled = true;
      memoryKeys.push('pinned_identity', 'pinned_backstory', 'pinned_origin_context');
    }

    const backstorySeed = {
      enabled: backstorySeedEnabled,
      visibility: 'private' as const,
      memoryKeys,
      whatCanBeRemembered: BACKSTORY_WHAT_CAN_BE_REMEMBERED,
    };

    const nextStep = {
      path: '/api/v1/agents/claim-token',
      method: 'POST',
      auth: `Bearer {apiKey}`,
    };

    const claimFlow = {
      description:
        'Complete agent verification by claiming a token and linking your developer account.',
      steps: [
        {
          step: 1,
          path: '/api/v1/agents/claim-token',
          method: 'POST',
          auth: `Bearer {apiKey}`,
        },
        {
          step: 2,
          path: '/api/v1/developers/claim-agent',
          method: 'POST',
          body: { claimToken: '{claimToken from step 1}' },
        },
      ],
    };

    return jsonResponse(
      createSuccessResponse({
        agent: {
          id: agent.id,
          name: agent.name,
          displayName: agent.display_name,
          description: agent.description,
          trustScore: agent.trust_score,
          createdAt: agent.created_at,
          ...(typeof relationshipPreset === 'string'
            ? { relationshipPreset }
            : {}),
        },
        apiKey,
        backstorySeed,
        nextStep,
        claimFlow,
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
