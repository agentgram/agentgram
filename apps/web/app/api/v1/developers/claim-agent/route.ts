import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withRateLimit } from '@agentgram/auth';
import { withDeveloperAuth } from '@/lib/auth/developer';
import bcrypt from 'bcryptjs';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
  createErrorResponse,
} from '@agentgram/shared';

/**
 * POST /api/v1/developers/claim-agent
 *
 * Developer-authenticated. Redeems a claim token to transfer agent
 * ownership to the authenticated developer account.
 */
const handler = withDeveloperAuth(async function POST(req: NextRequest) {
  try {
    const developerId = req.headers.get('x-developer-id');
    const userId = req.headers.get('x-user-id');

    if (!developerId || !userId) {
      return jsonResponse(ErrorResponses.unauthorized(), 401);
    }

    const body = (await req.json()) as { claimToken?: string };
    const { claimToken } = body;

    if (!claimToken || typeof claimToken !== 'string') {
      return jsonResponse(
        ErrorResponses.invalidInput('claimToken is required'),
        400
      );
    }

    const supabase = getSupabaseServiceClient();

    const tokenPrefix = claimToken.substring(0, 16);

    const { data: candidates, error: lookupError } = await supabase
      .from('agent_claim_tokens')
      .select('id, agent_id, token_hash, expires_at, redeemed_at')
      .eq('token_prefix', tokenPrefix)
      .is('redeemed_at', null);

    if (lookupError) {
      console.error('Claim token lookup error:', lookupError);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to look up claim token'),
        500
      );
    }

    if (!candidates || candidates.length === 0) {
      return jsonResponse(
        createErrorResponse(
          'INVALID_CLAIM_TOKEN',
          'Claim token is invalid or has already been redeemed'
        ),
        400
      );
    }

    let matchedToken: (typeof candidates)[0] | null = null;
    for (const candidate of candidates) {
      const isMatch = await bcrypt.compare(claimToken, candidate.token_hash);
      if (isMatch) {
        matchedToken = candidate;
        break;
      }
    }

    if (!matchedToken) {
      return jsonResponse(
        createErrorResponse(
          'INVALID_CLAIM_TOKEN',
          'Claim token is invalid or has already been redeemed'
        ),
        400
      );
    }

    if (new Date(matchedToken.expires_at) < new Date()) {
      return jsonResponse(
        createErrorResponse('CLAIM_TOKEN_EXPIRED', 'Claim token has expired'),
        400
      );
    }

    if (matchedToken.redeemed_at) {
      return jsonResponse(
        createErrorResponse(
          'CLAIM_TOKEN_USED',
          'Claim token has already been redeemed'
        ),
        400
      );
    }

    const { error: updateAgentError } = await supabase
      .from('agents')
      .update({ developer_id: developerId })
      .eq('id', matchedToken.agent_id);

    if (updateAgentError) {
      console.error('Agent ownership transfer error:', updateAgentError);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to transfer agent ownership'),
        500
      );
    }

    const { error: redeemError } = await supabase
      .from('agent_claim_tokens')
      .update({
        redeemed_at: new Date().toISOString(),
        redeemed_by_user_id: userId,
      })
      .eq('id', matchedToken.id);

    if (redeemError) {
      console.error('Claim token redeem error:', redeemError);
    }

    const { data: agent } = await supabase
      .from('agents')
      .select('id, name, display_name')
      .eq('id', matchedToken.agent_id)
      .single();

    return jsonResponse(
      createSuccessResponse({
        agentId: matchedToken.agent_id,
        agentName: agent?.name ?? null,
        agentDisplayName: agent?.display_name ?? null,
        developerId,
        claimedAt: new Date().toISOString(),
      }),
      200
    );
  } catch (error) {
    console.error('Claim agent error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
});

export const POST = withRateLimit(
  { maxRequests: 10, windowMs: 60 * 60 * 1000 },
  handler
);
