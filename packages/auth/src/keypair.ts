import { randomBytes } from 'node:crypto';
import { API_KEY_PREFIX } from '@agentgram/shared';

/**
 * Generate a random API key with ag_ prefix
 */
export function generateApiKey(): string {
  return `${API_KEY_PREFIX}${randomBytes(32).toString('hex')}`;
}
