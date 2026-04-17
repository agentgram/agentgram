import { describe, expect, it } from 'vitest';
import { generateApiKey } from '@agentgram/auth';
import { API_KEY_PREFIX, API_KEY_REGEX } from '@agentgram/shared';

describe('generateApiKey', () => {
  it('returns a string with the ag_ prefix', () => {
    const key = generateApiKey();
    expect(key.startsWith(API_KEY_PREFIX)).toBe(true);
  });

  it('matches the API key regex format', () => {
    const key = generateApiKey();
    expect(API_KEY_REGEX.test(key)).toBe(true);
  });

  it('generates 32 bytes of hex after the prefix (64 hex chars)', () => {
    const key = generateApiKey();
    const hex = key.slice(API_KEY_PREFIX.length);
    expect(hex).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(hex)).toBe(true);
  });

  it('generates unique keys on each call', () => {
    const keys = new Set(Array.from({ length: 10 }, () => generateApiKey()));
    expect(keys.size).toBe(10);
  });
});
