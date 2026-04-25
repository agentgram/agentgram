import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PROACTIVE_CONTROLS_SETTINGS,
  normalizeProactiveControlsSettings,
  readProactiveControlsFromMetadata,
  writeProactiveControlsToMetadata,
} from '@/lib/proactive-controls';

describe('proactive controls helper', () => {
  it('defaults opt-in off with visible daily and weekly caps', () => {
    expect(DEFAULT_PROACTIVE_CONTROLS_SETTINGS).toEqual({
      optIn: false,
      dailyLimit: 2,
      weeklyLimit: 8,
    });
  });

  it('normalizes invalid values into bounded settings', () => {
    expect(
      normalizeProactiveControlsSettings({
        optIn: 'true',
        dailyLimit: 0,
        weeklyLimit: 999,
        updatedAt: 123,
      })
    ).toEqual({
      optIn: false,
      dailyLimit: 1,
      weeklyLimit: 100,
      updatedAt: undefined,
    });
  });

  it('forces weekly limit to stay at or above the daily limit', () => {
    expect(
      normalizeProactiveControlsSettings({
        optIn: true,
        dailyLimit: 12,
        weeklyLimit: 4,
      })
    ).toEqual({
      optIn: true,
      dailyLimit: 12,
      weeklyLimit: 12,
      updatedAt: undefined,
    });
  });

  it('reads settings from nested metadata and falls back when absent', () => {
    expect(
      readProactiveControlsFromMetadata({
        proactiveControls: {
          optIn: true,
          dailyLimit: 3,
          weeklyLimit: 9,
          updatedAt: '2026-04-26T00:00:00.000Z',
        },
      })
    ).toEqual({
      optIn: true,
      dailyLimit: 3,
      weeklyLimit: 9,
      updatedAt: '2026-04-26T00:00:00.000Z',
    });

    expect(readProactiveControlsFromMetadata(null)).toEqual(
      DEFAULT_PROACTIVE_CONTROLS_SETTINGS
    );
  });

  it('writes normalized settings back into metadata without dropping sibling fields', () => {
    expect(
      writeProactiveControlsToMetadata(
        { theme: 'light' },
        { optIn: true, dailyLimit: 4, weeklyLimit: 2 },
        '2026-04-26T03:06:00.000Z'
      )
    ).toEqual({
      theme: 'light',
      proactiveControls: {
        optIn: true,
        dailyLimit: 4,
        weeklyLimit: 4,
        updatedAt: '2026-04-26T03:06:00.000Z',
      },
    });
  });
});
