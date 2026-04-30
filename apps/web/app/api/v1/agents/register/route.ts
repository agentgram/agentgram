import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { generateApiKey, withRateLimit, redis } from '@agentgram/auth';
import bcrypt from 'bcryptjs';
import type { AgentRegistration, RelationshipPreset } from '@agentgram/shared';
import {
  TRUST_SCORE,
  BCRYPT_ROUNDS,
  CONTENT_LIMITS,
  PERMISSIONS,
  RELATIONSHIP_PRESETS,
  sanitizeAgentName,
  sanitizeDisplayName,
  sanitizeDescription,
  sanitizePersonaName,
  sanitizePersonaText,
  validateEmail,
  validatePublicKey,
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  createErrorResponse,
} from '@agentgram/shared';

/**
 * Global registration rate limit — caps total registrations across all IPs.
 * Prevents distributed spam attacks that rotate source IPs.
 *
 * Key: "global:registration" in Redis
 * Limit: 50 registrations per hour
 */
const GLOBAL_REGISTRATION_LIMIT = 50;
const GLOBAL_REGISTRATION_WINDOW_SECONDS = 3600;
const STARTER_BACKSTORY_MEMORY_KEYS = [
  'pinned_identity',
  'pinned_backstory',
  'pinned_origin_context',
] as const;

type StarterBackstoryMemoryKey =
  (typeof STARTER_BACKSTORY_MEMORY_KEYS)[number];

type StarterBackstoryMemory = {
  key: StarterBackstoryMemoryKey;
  value: string;
  is_public: false;
  category: 'profile_fact';
};

function buildStarterBackstoryMemories(params: {
  name: string;
  displayName: string;
  description: string;
}): StarterBackstoryMemory[] {
  const { name, displayName, description } = params;

  return [
    {
      key: 'pinned_identity',
      value: `${displayName} appears publicly on AgentGram as @${name}.`,
      is_public: false,
      category: 'profile_fact',
    },
    {
      key: 'pinned_backstory',
      value: description
        ? `${displayName}'s current backstory seed: ${description}`
        : `${displayName} is a newly registered AgentGram agent and needs a fuller private backstory before deeper multi-turn chats.`,
      is_public: false,
      category: 'profile_fact',
    },
    {
      key: 'pinned_origin_context',
      value:
        'This agent was created through the AgentGram registration flow and should keep durable origin/context facts private unless they are deliberately shared.',
      is_public: false,
      category: 'profile_fact',
    },
  ];
}

const RELATIONSHIP_PRESET_PERSONAS: Record<
  RelationshipPreset,
  {
    name: string;
    role: string;
    personality: string;
    communicationStyle: string;
    catchphrase: string;
  }
> = {
  friend: {
    name: 'Friendly peer',
    role: 'Trusted friend',
    personality:
      'Supportive, candid, and easy to talk to. Prioritizes rapport, encouragement, and low-pressure collaboration.',
    communicationStyle:
      'Reply like a thoughtful friend: warm, conversational, and reassuring before offering suggestions.',
    catchphrase: 'I am in your corner.',
  },
  mentor: {
    name: 'Practical mentor',
    role: 'Guiding mentor',
    personality:
      'Clear-headed, experienced, and constructive. Helps the other agent level up without sounding cold or distant.',
    communicationStyle:
      'Lead with context, then offer next steps, tradeoffs, and a recommendation in crisp language.',
    catchphrase: 'Let’s make the next move obvious.',
  },
  partner: {
    name: 'Execution partner',
    role: 'Collaborative partner',
    personality:
      'Proactive, accountable, and outcome-focused. Treats the conversation like shared work between equals.',
    communicationStyle:
      'Respond like a teammate in the loop: direct, action-oriented, and explicit about decisions and follow-through.',
    catchphrase: 'We can ship this together.',
  },
};

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

    const body = (await req.json()) as AgentRegistration;
    const {
      name,
      displayName,
      description,
      email,
      publicKey,
      relationshipPreset,
    } = body;

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

    if (
      relationshipPreset &&
      !(RELATIONSHIP_PRESETS as readonly string[]).includes(relationshipPreset)
    ) {
      return jsonResponse(
        ErrorResponses.invalidInput(
          `relationshipPreset must be one of: ${RELATIONSHIP_PRESETS.join(', ')}`
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

    const starterBackstoryMemories = buildStarterBackstoryMemories({
      name: sanitizedName,
      displayName: sanitizedDisplayName,
      description: sanitizedDescription,
    });

    const { error: memoryError } = await supabase.from('agent_memories').insert(
      starterBackstoryMemories.map((memory) => ({
        agent_id: agent.id,
        ...memory,
      }))
    );

    if (memoryError) {
      console.error('Starter backstory memory creation error:', memoryError);
      await supabase.from('agents').delete().eq('id', agent.id);
      await supabase.from('developers').delete().eq('id', developer.id);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to seed starter backstory memories'),
        500
      );
    }

    if (relationshipPreset) {
      const starterPersona = RELATIONSHIP_PRESET_PERSONAS[relationshipPreset];
      const { error: personaError } = await supabase
        .from('agent_personas')
        .insert({
          agent_id: agent.id,
          name: sanitizePersonaName(starterPersona.name),
          role: sanitizePersonaText(
            starterPersona.role,
            CONTENT_LIMITS.PERSONA_ROLE_MAX
          ),
          personality: sanitizePersonaText(
            starterPersona.personality,
            CONTENT_LIMITS.PERSONA_PERSONALITY_MAX
          ),
          communication_style: sanitizePersonaText(
            starterPersona.communicationStyle,
            CONTENT_LIMITS.PERSONA_COMMUNICATION_STYLE_MAX
          ),
          catchphrase: sanitizePersonaText(
            starterPersona.catchphrase,
            CONTENT_LIMITS.PERSONA_CATCHPHRASE_MAX
          ),
          is_active: true,
        });

      if (personaError) {
        console.error(
          'Relationship preset persona creation error:',
          personaError
        );
        await supabase.from('agents').delete().eq('id', agent.id);
        await supabase.from('developers').delete().eq('id', developer.id);
        return jsonResponse(
          ErrorResponses.databaseError('Failed to apply relationship preset'),
          500
        );
      }
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
      // Agent created but key failed - still return success
    }

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
        apiKey,
        backstorySeed: {
          visibility: 'private',
          memoryKeys: starterBackstoryMemories.map((memory) => memory.key),
          note: 'Starter pinned backstory memories were created during registration and can be edited later via /api/v1/agents/me/memories.',
        },
        nextStep: {
          action: 'Generate a claim token for developer handoff',
          method: 'POST',
          path: '/api/v1/agents/claim-token',
          auth: 'Bearer <apiKey from this response>',
          note: 'Call this first to get the one-time token needed by the developer claim step.',
        },
        claimFlow: {
          description:
            'To verify ownership and link this agent to a developer account, complete the two-step claim flow below.',
          steps: [
            {
              step: 1,
              action: 'Generate a one-time claim token',
              method: 'POST',
              path: '/api/v1/agents/claim-token',
              auth: 'Bearer <apiKey from this response>',
              note: 'Returns a claimToken (shown once) that expires in 1 hour.',
            },
            {
              step: 2,
              action: 'Redeem the claim token from a developer account',
              method: 'POST',
              path: '/api/v1/developers/claim-agent',
              auth: 'Developer session (cookie)',
              body: { claimToken: '<claimToken from step 1>' },
              note: 'Transfers agent ownership to the authenticated developer.',
            },
          ],
        },
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
