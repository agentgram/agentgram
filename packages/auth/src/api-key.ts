import bcrypt from 'bcryptjs';
import {
  API_KEY_PREFIX,
  API_KEY_REGEX,
  API_KEY_MAX_LENGTH,
  API_KEY_PREFIX_LENGTH,
} from '@agentgram/shared';

const MAX_PREFIX_MATCHES = 5;

export interface VerifiedAgent {
  agentId: string;
  name: string;
  permissions: string[];
}

function getSupabaseConfig(): { url: string; serviceKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return { url, serviceKey };
}

/**
 * Extract API key from Bearer authorization header.
 * Only accepts tokens with the ag_ prefix.
 */
export function extractApiKey(authHeader: string | null): string | null {
  if (!authHeader || authHeader.indexOf('Bearer ') !== 0) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  if (token.indexOf(API_KEY_PREFIX) !== 0) {
    return null;
  }

  return token;
}

/**
 * Validate API key format (ag_ prefix + 32-64 hex chars)
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  if (apiKey.length > API_KEY_MAX_LENGTH) {
    return false;
  }

  return API_KEY_REGEX.test(apiKey);
}

/**
 * Verify an API key against the database and return the associated agent info.
 *
 * Uses raw fetch to the Supabase REST API to avoid importing @supabase/supabase-js
 * in the auth package (keeps it lightweight, avoids circular dependencies).
 */
export async function verifyApiKey(
  apiKey: string
): Promise<VerifiedAgent | null> {
  if (!isValidApiKeyFormat(apiKey)) {
    return null;
  }

  if (apiKey.length < API_KEY_PREFIX_LENGTH) {
    return null;
  }

  const config = getSupabaseConfig();
  if (!config) {
    console.error('Supabase configuration missing for API key verification');
    return null;
  }

  const keyPrefix = apiKey.substring(0, API_KEY_PREFIX_LENGTH);

  const keysRes = await fetch(
    `${config.url}/rest/v1/api_keys?select=agent_id,key_hash,expires_at,permissions&key_prefix=eq.${encodeURIComponent(keyPrefix)}&limit=${String(MAX_PREFIX_MATCHES + 1)}`,
    {
      headers: {
        apikey: config.serviceKey,
        Authorization: `Bearer ${config.serviceKey}`,
      },
    }
  );

  if (!keysRes.ok) {
    console.error('API key lookup error:', keysRes.statusText);
    return null;
  }

  const apiKeys = (await keysRes.json()) as {
    agent_id: string | null;
    key_hash: string;
    expires_at: string | null;
    permissions: unknown;
  }[];

  if (!apiKeys || apiKeys.length === 0) {
    return null;
  }

  if (apiKeys.length > MAX_PREFIX_MATCHES) {
    return null;
  }

  let matchedKey: (typeof apiKeys)[number] | null = null;
  for (const record of apiKeys) {
    const isMatch = await bcrypt.compare(apiKey, record.key_hash);
    if (isMatch) {
      matchedKey = record;
      break;
    }
  }

  if (!matchedKey) {
    return null;
  }

  if (matchedKey.expires_at) {
    const keyExpiry = Date.parse(matchedKey.expires_at);
    if (!isNaN(keyExpiry) && keyExpiry <= Date.now()) {
      return null;
    }
  }

  if (!matchedKey.agent_id) {
    return null;
  }

  const agentRes = await fetch(
    `${config.url}/rest/v1/agents?select=id,name&id=eq.${encodeURIComponent(matchedKey.agent_id)}`,
    {
      headers: {
        apikey: config.serviceKey,
        Authorization: `Bearer ${config.serviceKey}`,
      },
    }
  );

  if (!agentRes.ok) {
    return null;
  }

  const agents = (await agentRes.json()) as { id: string; name: string }[];
  const agent = agents[0];

  if (!agent) {
    return null;
  }

  const permissions = Array.isArray(matchedKey.permissions)
    ? matchedKey.permissions.filter(
        (permission: unknown): permission is string =>
          typeof permission === 'string'
      )
    : [];

  return {
    agentId: agent.id,
    name: agent.name,
    permissions,
  };
}
