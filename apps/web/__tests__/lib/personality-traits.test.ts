import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PERSONALITY_SETTINGS,
  readPersonalityFromMetadata,
  writePersonalityToMetadata,
} from '@/lib/personality-traits';

describe('readPersonalityFromMetadata', () => {
  it('returns defaults when metadata is null', () => {
    expect(readPersonalityFromMetadata(null)).toEqual(DEFAULT_PERSONALITY_SETTINGS);
  });

  it('returns defaults when metadata has no personalitySettings key', () => {
    expect(readPersonalityFromMetadata({ someOtherKey: 1 })).toEqual(
      DEFAULT_PERSONALITY_SETTINGS
    );
  });

  it('reads saved traits from metadata', () => {
    const meta = {
      personalitySettings: {
        traits: { warmth: 80, humor: 60, formality: 20, creativity: 90 },
        voiceStyle: 'playful',
        updatedAt: '2026-06-01T00:00:00.000Z',
      },
    };
    const result = readPersonalityFromMetadata(meta);
    expect(result.traits.warmth).toBe(80);
    expect(result.traits.humor).toBe(60);
    expect(result.traits.formality).toBe(20);
    expect(result.traits.creativity).toBe(90);
    expect(result.voiceStyle).toBe('playful');
    expect(result.updatedAt).toBe('2026-06-01T00:00:00.000Z');
  });

  it('clamps out-of-range trait values', () => {
    const meta = {
      personalitySettings: {
        traits: { warmth: -10, humor: 200, formality: 50, creativity: 50 },
        voiceStyle: 'natural',
      },
    };
    const result = readPersonalityFromMetadata(meta);
    expect(result.traits.warmth).toBe(0);
    expect(result.traits.humor).toBe(100);
  });

  it('falls back to default voiceStyle for unknown value', () => {
    const meta = {
      personalitySettings: {
        traits: { warmth: 50, humor: 30, formality: 50, creativity: 50 },
        voiceStyle: 'robotic',
      },
    };
    const result = readPersonalityFromMetadata(meta);
    expect(result.voiceStyle).toBe(DEFAULT_PERSONALITY_SETTINGS.voiceStyle);
  });
});

describe('writePersonalityToMetadata', () => {
  it('preserves existing metadata keys', () => {
    const meta = { someOtherKey: 'preserve-me' };
    const result = writePersonalityToMetadata(meta, {
      traits: { warmth: 70 },
      voiceStyle: 'calm',
    });
    expect(result['someOtherKey']).toBe('preserve-me');
    expect(result['personalitySettings']).toBeDefined();
  });

  it('writes new traits and voiceStyle', () => {
    const result = writePersonalityToMetadata(null, {
      traits: { warmth: 75, humor: 55, formality: 25, creativity: 85 },
      voiceStyle: 'expressive',
    });
    const ps = result['personalitySettings'] as ReturnType<typeof readPersonalityFromMetadata>;
    expect(ps.traits.warmth).toBe(75);
    expect(ps.traits.humor).toBe(55);
    expect(ps.voiceStyle).toBe('expressive');
  });

  it('merges partial trait updates, keeping existing values for unspecified keys', () => {
    const existingMeta = writePersonalityToMetadata(null, {
      traits: { warmth: 60, humor: 40, formality: 50, creativity: 50 },
      voiceStyle: 'natural',
    });
    const result = writePersonalityToMetadata(existingMeta, {
      traits: { warmth: 90 },
    });
    const ps = result['personalitySettings'] as ReturnType<typeof readPersonalityFromMetadata>;
    expect(ps.traits.warmth).toBe(90);
    expect(ps.traits.humor).toBe(40);
    expect(ps.traits.formality).toBe(50);
    expect(ps.voiceStyle).toBe('natural');
  });

  it('sets updatedAt as a valid ISO timestamp', () => {
    const result = writePersonalityToMetadata(null, {
      traits: { warmth: 50 },
    });
    const ps = result['personalitySettings'] as { updatedAt?: string };
    expect(ps.updatedAt).toBeDefined();
    expect(() => new Date(ps.updatedAt!).toISOString()).not.toThrow();
  });
});
