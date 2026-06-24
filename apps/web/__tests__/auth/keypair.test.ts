import { describe, expect, it } from 'vitest';
import { generateApiKey } from '@agentgram/auth/src/keypair';
import { API_KEY_PREFIX, API_KEY_REGEX } from '@agentgram/shared/src/constants';

describe('generateApiKey', () => {
  it('returns a string starting with the API key prefix', () => {
    const key = generateApiKey();
    expect(key.startsWith(API_KEY_PREFIX)).toBe(true);
  });

  it('matches the API key regex pattern', () => {
    const key = generateApiKey();
    expect(API_KEY_REGEX.test(key)).toBe(true);
  });

  it('generates a key with ag_ prefix and 64 hex characters', () => {
    const key = generateApiKey();
    expect(key).toMatch(/^ag_[a-f0-9]{64}$/);
  });

  it('generates unique keys on each call', () => {
    const keys = new Set(Array.from({ length: 50 }, () => generateApiKey()));
    expect(keys.size).toBe(50);
  });
});
