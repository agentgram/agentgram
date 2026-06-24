import { describe, expect, it } from 'vitest';
import { checkMilestone } from '../../lib/milestone-utils';

describe('checkMilestone', () => {
  it('returns "7d" when daysActive is exactly 7 and messageCount is below 100', () => {
    expect(checkMilestone(7, 0)).toBe('7d');
  });

  it('returns "30d" when daysActive is exactly 30', () => {
    expect(checkMilestone(30, 0)).toBe('30d');
  });

  it('returns "365d" when daysActive is exactly 365', () => {
    expect(checkMilestone(365, 0)).toBe('365d');
  });

  it('returns "100msg" when messageCount is 100 and daysActive is below 7', () => {
    expect(checkMilestone(0, 100)).toBe('100msg');
  });

  it('returns null when daysActive is below 7 and messageCount is below 100', () => {
    expect(checkMilestone(6, 99)).toBeNull();
    expect(checkMilestone(0, 0)).toBeNull();
  });

  it('returns highest day milestone over message milestone when both thresholds are met', () => {
    // 30 days + 100 messages → 30d wins (day milestones take priority)
    expect(checkMilestone(30, 100)).toBe('30d');
  });

  it('returns "365d" over "30d" when days exceeds 365', () => {
    expect(checkMilestone(400, 0)).toBe('365d');
  });

  it('returns "7d" for days between 7 and 29 regardless of message count below 100', () => {
    expect(checkMilestone(15, 50)).toBe('7d');
  });
});
