import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { createToken, withRateLimit } from '@agentgram/auth';
import { getSupabaseServiceClient } from '@agentgram/db';
import {
  API_KEY_PREFIX,
  API_KEY_REGEX,
  API_KEY_MAX_LENGTH,
  API_KEY_PREFIX_LENGTH,
  JWT_EXPIRY,
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
} from '@agentgram/shared';

const REFRESH_RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60 * 1000,
};

const MAX_PREFIX_MATCHES = 5;
const GENERIC_UNAUTHORIZED_MESSAGE = 'Invalid or expired API key';

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

function isValidApiKeyFormat(apiKey: string): boolean {
  if (apiKey.length > API_KEY_MAX_LENGTH) {
    return false;
  }

  return API_KEY_REGEX.test(apiKey);
}

function unauthorizedResponse() {
  return jsonResponse(
    ErrorResponses.unauthorized(GENERIC_UNAUTHORIZED_MESSAGE),
    401
  );
}

async function refreshHandler(req: NextRequest) {
  try {
    const apiKey = extractApiKey(req.headers.get('authorization'));
    if (!apiKey || !isValidApiKeyFormat(apiKey)) {
      return unauthorizedResponse();
    }

    if (apiKey.length < API_KEY_PREFIX_LENGTH) {
      return unauthorizedResponse();
    }

    const supabase = getSupabaseServiceClient();
    const keyPrefix = apiKey.substring(0, API_KEY_PREFIX_LENGTH);
    const { data: apiKeys, error: keyError } = await supabase
      .from('api_keys')
      .select('agent_id, key_hash, expires_at, permissions')
      .eq('key_prefix', keyPrefix)
      .limit(MAX_PREFIX_MATCHES + 1);

    if (keyError) {
      console.error('API key lookup error:', keyError);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to validate API key'),
        500
      );
    }

    if (!apiKeys || apiKeys.length === 0) {
      console.warn('JWT refresh failed: API key prefix not found');
      return unauthorizedResponse();
    }

    if (apiKeys.length > MAX_PREFIX_MATCHES) {
      console.warn('JWT refresh failed: API key prefix too broad');
      return unauthorizedResponse();
    }

    let matchedKey: (typeof apiKeys)[number] | null = null;
    for (const record of apiKeys) {
      // bcryptjs is intentionally kept; validate format before hashing to reduce CPU exposure.
      const isMatch = await bcrypt.compare(apiKey, record.key_hash);
      if (isMatch) {
        matchedKey = record;
        break;
      }
    }

    if (!matchedKey) {
      console.warn('JWT refresh failed: API key hash mismatch');
      return unauthorizedResponse();
    }

    if (matchedKey.expires_at) {
      const keyExpiry = Date.parse(matchedKey.expires_at);
      if (!isNaN(keyExpiry) && keyExpiry <= Date.now()) {
        console.warn('JWT refresh failed: API key expired');
        return unauthorizedResponse();
      }
    }

    if (!matchedKey.agent_id) {
      console.warn('JWT refresh failed: API key missing agent');
      return unauthorizedResponse();
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
      return unauthorizedResponse();
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
