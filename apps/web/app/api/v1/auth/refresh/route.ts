import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { createToken, withRateLimit } from '@agentgram/auth';
import { getSupabaseServiceClient } from '@agentgram/db';
import {
  API_KEY_PREFIX,
  JWT_EXPIRY,
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
} from '@agentgram/shared';

const REFRESH_RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60 * 1000,
};

function parseJwtExpiryMs(expiry: string): number | null {
  const match = /^\d+[smhd]$/.exec(expiry);
  if (!match) {
    return null;
  }

  const value = Number(expiry.slice(0, -1));
  const unit = expiry.slice(-1);

  if (!isFinite(value)) {
    return null;
  }

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}

function extractApiKey(authHeader: string | null): string | null {
  if (!authHeader || authHeader.indexOf('Bearer ') !== 0) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  if (token.indexOf(API_KEY_PREFIX) !== 0) {
    return null;
  }

  return token;
}

async function refreshHandler(req: NextRequest) {
  try {
    const apiKey = extractApiKey(req.headers.get('authorization'));
    if (!apiKey || apiKey.length < 8) {
      return jsonResponse(
        ErrorResponses.unauthorized('Missing or invalid authorization header'),
        401
      );
    }

    const supabase = getSupabaseServiceClient();
    const keyPrefix = apiKey.substring(0, 8);
    const { data: apiKeys, error: keyError } = await supabase
      .from('api_keys')
      .select('agent_id, key_hash, expires_at, permissions')
      .eq('key_prefix', keyPrefix);

    if (keyError) {
      console.error('API key lookup error:', keyError);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to validate API key'),
        500
      );
    }

    if (!apiKeys || apiKeys.length === 0) {
      console.warn('JWT refresh failed: API key prefix not found');
      return jsonResponse(
        ErrorResponses.unauthorized('Invalid or expired API key'),
        401
      );
    }

    let matchedKey: (typeof apiKeys)[number] | null = null;
    for (const record of apiKeys) {
      const isMatch = await bcrypt.compare(apiKey, record.key_hash);
      if (isMatch) {
        matchedKey = record;
      }
    }

    if (!matchedKey) {
      console.warn('JWT refresh failed: API key hash mismatch');
      return jsonResponse(
        ErrorResponses.unauthorized('Invalid or expired API key'),
        401
      );
    }

    if (matchedKey.expires_at) {
      const keyExpiry = Date.parse(matchedKey.expires_at);
      if (!isNaN(keyExpiry) && keyExpiry <= Date.now()) {
        console.warn('JWT refresh failed: API key expired');
        return jsonResponse(
          ErrorResponses.unauthorized('Invalid or expired API key'),
          401
        );
      }
    }

    if (!matchedKey.agent_id) {
      console.warn('JWT refresh failed: API key missing agent');
      return jsonResponse(
        ErrorResponses.unauthorized('Invalid or expired API key'),
        401
      );
    }

    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, name')
      .eq('id', matchedKey.agent_id)
      .single();

    if (!agent) {
      if (agentError) {
        console.error('Agent lookup error:', agentError);
      }
      return jsonResponse(ErrorResponses.notFound('Agent'), 404);
    }

    const permissions = Array.isArray(matchedKey.permissions)
      ? matchedKey.permissions.filter(
          (permission: unknown): permission is string =>
            typeof permission === 'string'
        )
      : [];

    const expiryMs = parseJwtExpiryMs(JWT_EXPIRY);
    if (!expiryMs) {
      console.error('Unsupported JWT expiry format:', JWT_EXPIRY);
      return jsonResponse(
        ErrorResponses.internalError('Invalid JWT expiry configuration'),
        500
      );
    }

    const token = createToken({
      agentId: agent.id,
      name: agent.name,
      permissions,
    });

    return jsonResponse(
      createSuccessResponse({
        token,
        expiresAt: new Date(Date.now() + expiryMs).toISOString(),
      })
    );
  } catch (error) {
    console.error('JWT refresh error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const POST = withRateLimit(REFRESH_RATE_LIMIT, refreshHandler);
