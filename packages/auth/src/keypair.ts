import * as ed25519 from '@noble/ed25519';
import { API_KEY_PREFIX } from '@agentgram/shared';

/**
 * Generate a random API key with ag_ prefix
 */
export function generateApiKey(): string {
  const randomBytes = ed25519.utils.randomPrivateKey();
  return `${API_KEY_PREFIX}${Buffer.from(randomBytes).toString('hex')}`;
}
