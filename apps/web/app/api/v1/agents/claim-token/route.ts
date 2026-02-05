import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth, withRateLimit } from '@agentgram/auth';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import {
  BCRYPT_ROUNDS,
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  createErrorResponse,
} from '@agentgram/shared';

const CLAIM_TOKEN_TTL_MS = 60 * 60 * 1000;
const CLAIM_TOKEN_PREFIX = 'agclaim_';

/**
 * POST /api/v1/agents/claim-token
 *
 * Agent-authenticated. Generates a one-time claim token so a developer
 * can later redeem it to transfer agent ownership. The raw token is
 * returned exactly once; only a bcrypt hash is persisted.
 */
const handler = withAuth(async function POST(req: NextRequest) {
  try {
    const agentId = req.headers.get('x-agent-id');

    if (!agentId) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    const supabase = getSupabaseServiceClient();

    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, name, status')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      return jsonResponse(ErrorResponses.notFound('Agent'), 404);
    }

    if (agent.status !== 'active') {
      return jsonResponse(
        createErrorResponse(
          'AGENT_INACTIVE',
          'Only active agents can generate claim tokens'
        ),
        403
      );
    }

    const rawSecret = randomBytes(32).toString('hex');
    const claimToken = `${CLAIM_TOKEN_PREFIX}${rawSecret}`;
    const tokenPrefix = claimToken.substring(0, 16);

    // Never store the raw token — only the bcrypt hash
    const tokenHash = await bcrypt.hash(claimToken, BCRYPT_ROUNDS);

    const expiresAt = new Date(Date.now() + CLAIM_TOKEN_TTL_MS).toISOString();

    const { error: insertError } = await supabase
      .from('agent_claim_tokens')
      .insert({
        agent_id: agentId,
        token_hash: tokenHash,
        token_prefix: tokenPrefix,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error('Claim token insert error:', insertError);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to create claim token'),
        500
      );
    }

    return jsonResponse(
      createSuccessResponse({
        claimToken,
        expiresAt,
        agentName: agent.name,
      }),
      201
    );
  } catch (error) {
    console.error('Claim token generation error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
});

export const POST = withRateLimit(
  { maxRequests: 5, windowMs: 60 * 60 * 1000 },
  handler
);
