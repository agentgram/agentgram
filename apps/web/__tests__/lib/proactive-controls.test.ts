import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PROACTIVE_CONTROLS_SETTINGS,
  getNextEligibleSendAt,
  PROACTIVE_TRIGGER_LABELS,
  PROACTIVE_TRIGGER_SOURCES,
  TONE_PRESETS,
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
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      tonePreset: 'neutral',
    });
  });

  it('normalizes invalid values into bounded settings', () => {
    expect(
      normalizeProactiveControlsSettings({
        optIn: 'true',
        dailyLimit: 0,
        weeklyLimit: 999,
        quietHoursEnabled: 'true',
        quietHoursStart: '25:00',
        quietHoursEnd: 'nope',
        tonePreset: 'loud',
        updatedAt: 123,
      })
    ).toEqual({
      optIn: false,
      dailyLimit: 1,
      weeklyLimit: 100,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      tonePreset: 'neutral',
      updatedAt: undefined,
    });
  });

  it('preserves valid tone presets', () => {
    for (const tonePreset of TONE_PRESETS) {
      expect(
        normalizeProactiveControlsSettings({
          tonePreset,
        }).tonePreset
      ).toBe(tonePreset);
    }
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
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      tonePreset: 'neutral',
      updatedAt: undefined,
    });
  });

  it('keeps valid quiet hours values', () => {
    expect(
      normalizeProactiveControlsSettings({
        optIn: true,
        dailyLimit: 5,
        weeklyLimit: 12,
        quietHoursEnabled: true,
        quietHoursStart: '21:30',
        quietHoursEnd: '07:15',
        tonePreset: 'brief',
      })
    ).toEqual({
      optIn: true,
      dailyLimit: 5,
      weeklyLimit: 12,
      quietHoursEnabled: true,
      quietHoursStart: '21:30',
      quietHoursEnd: '07:15',
      tonePreset: 'brief',
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
          quietHoursEnabled: true,
          quietHoursStart: '23:00',
          quietHoursEnd: '06:30',
          tonePreset: 'warm',
          updatedAt: '2026-04-26T00:00:00.000Z',
          lastAutoMessageAt: '2026-04-26T02:15:00.000Z',
          nextEligibleSendAt: '2026-04-26T06:30:00.000Z',
        },
      })
    ).toEqual({
      optIn: true,
      dailyLimit: 3,
      weeklyLimit: 9,
      quietHoursEnabled: true,
      quietHoursStart: '23:00',
      quietHoursEnd: '06:30',
      tonePreset: 'warm',
      updatedAt: '2026-04-26T00:00:00.000Z',
      lastAutoMessageAt: '2026-04-26T02:15:00.000Z',
      nextEligibleSendAt: '2026-04-26T06:30:00.000Z',
    });

    expect(readProactiveControlsFromMetadata(null)).toEqual(
      DEFAULT_PROACTIVE_CONTROLS_SETTINGS
    );
  });

  it('writes normalized settings back into metadata without dropping sibling fields', () => {
    expect(
      writeProactiveControlsToMetadata(
        { theme: 'light' },
        {
          optIn: true,
          dailyLimit: 4,
          weeklyLimit: 2,
          quietHoursEnabled: true,
          quietHoursStart: '21:00',
          quietHoursEnd: '06:00',
          tonePreset: 'warm',
          lastAutoMessageAt: '2026-04-26T02:15:00.000Z',
          nextEligibleSendAt: '2026-04-26T06:00:00.000Z',
        },
        '2026-04-26T03:06:00.000Z'
      )
    ).toEqual({
      theme: 'light',
      proactiveControls: {
        optIn: true,
        dailyLimit: 4,
        weeklyLimit: 4,
        quietHoursEnabled: true,
        quietHoursStart: '21:00',
        quietHoursEnd: '06:00',
        tonePreset: 'warm',
        updatedAt: '2026-04-26T03:06:00.000Z',
        lastAutoMessageAt: '2026-04-26T02:15:00.000Z',
        nextEligibleSendAt: '2026-04-26T06:00:00.000Z',
      },
    });
  });

  it('derives the next eligible send time from quiet hours when no explicit timestamp exists', () => {
    expect(
      getNextEligibleSendAt(
        {
          optIn: true,
          dailyLimit: 2,
          weeklyLimit: 8,
          quietHoursEnabled: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          tonePreset: 'neutral',
        },
        new Date('2026-04-26T20:15:00.000Z')
      )
    ).toBe('2026-04-26T23:00:00.000Z');
  });

  it('returns the current instant when outreach is eligible now and null when opt-in is disabled', () => {
    const now = new Date('2026-04-27T12:45:00.000Z');

    expect(
      getNextEligibleSendAt(
        {
          optIn: true,
          dailyLimit: 2,
          weeklyLimit: 8,
          quietHoursEnabled: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          tonePreset: 'neutral',
        },
        now
      )
    ).toBe('2026-04-27T12:45:00.000Z');

    expect(
      getNextEligibleSendAt(
        {
          optIn: false,
          dailyLimit: 2,
          weeklyLimit: 8,
          quietHoursEnabled: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          tonePreset: 'neutral',
        },
        now
      )
    ).toBeNull();
  });

  it('preserves valid lastAutoMessageTrigger values', () => {
    for (const trigger of PROACTIVE_TRIGGER_SOURCES) {
      expect(
        normalizeProactiveControlsSettings({
          lastAutoMessageTrigger: trigger,
        }).lastAutoMessageTrigger
      ).toBe(trigger);
    }
  });

  it('drops unknown lastAutoMessageTrigger values', () => {
    expect(
      normalizeProactiveControlsSettings({
        lastAutoMessageTrigger: 'unknown_source',
      }).lastAutoMessageTrigger
    ).toBeUndefined();
  });

  it('includes lastAutoMessageTrigger in metadata round-trip', () => {
    const result = writeProactiveControlsToMetadata(
      {},
      {
        optIn: true,
        dailyLimit: 2,
        weeklyLimit: 8,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        tonePreset: 'neutral',
        lastAutoMessageAt: '2026-06-05T10:00:00.000Z',
        lastAutoMessageTrigger: 'user_engagement',
      },
      '2026-06-05T10:05:00.000Z'
    );
    expect(
      (result.proactiveControls as { lastAutoMessageTrigger: string })
        .lastAutoMessageTrigger
    ).toBe('user_engagement');
  });

  it('covers all trigger sources with non-empty labels', () => {
    for (const trigger of PROACTIVE_TRIGGER_SOURCES) {
      expect(PROACTIVE_TRIGGER_LABELS[trigger]).toBeTruthy();
    }
  });

  it('reads lastAutoMessageTrigger from nested metadata', () => {
    const result = readProactiveControlsFromMetadata({
      proactiveControls: {
        optIn: true,
        dailyLimit: 2,
        weeklyLimit: 8,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        tonePreset: 'neutral',
        lastAutoMessageAt: '2026-06-05T10:00:00.000Z',
        lastAutoMessageTrigger: 'memory_update',
      },
    });
    expect(result.lastAutoMessageTrigger).toBe('memory_update');
  });
});
