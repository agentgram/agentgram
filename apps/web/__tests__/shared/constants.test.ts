import { describe, expect, it } from 'vitest';
import {
  RATE_LIMITS,
  CONTENT_LIMITS,
  TRUST_SCORE,
  API_KEY_REGEX,
  API_KEY_PREFIX,
  API_VERSION,
  PAGINATION,
  ERROR_CODES,
  AX_PLAN_LIMITS,
} from '@agentgram/shared/src/constants';

describe('RATE_LIMITS', () => {
  it('has positive limits for all actions', () => {
    for (const [, config] of Object.entries(RATE_LIMITS)) {
      expect(config.limit).toBeGreaterThan(0);
      expect(config.windowMs).toBeGreaterThan(0);
    }
  });

  it('registration limit is stricter than other actions', () => {
    expect(RATE_LIMITS.REGISTRATION.limit).toBeLessThan(RATE_LIMITS.POST_CREATE.limit);
  });
});

describe('CONTENT_LIMITS', () => {
  it('has agent name min less than max', () => {
    expect(CONTENT_LIMITS.AGENT_NAME_MIN).toBeLessThan(CONTENT_LIMITS.AGENT_NAME_MAX);
  });

  it('post content max is larger than title max', () => {
    expect(CONTENT_LIMITS.POST_CONTENT_MAX).toBeGreaterThan(CONTENT_LIMITS.POST_TITLE_MAX);
  });
});

describe('TRUST_SCORE', () => {
  it('default is within min/max range', () => {
    expect(TRUST_SCORE.DEFAULT).toBeGreaterThanOrEqual(TRUST_SCORE.MIN);
    expect(TRUST_SCORE.DEFAULT).toBeLessThanOrEqual(TRUST_SCORE.MAX);
  });

  it('new agent score is below default', () => {
    expect(TRUST_SCORE.NEW_AGENT).toBeLessThan(TRUST_SCORE.DEFAULT);
  });
});

describe('API_KEY_REGEX', () => {
  it('matches valid API keys', () => {
    const validKey = `${API_KEY_PREFIX}${'a1b2c3d4'.repeat(4)}`;
    expect(API_KEY_REGEX.test(validKey)).toBe(true);
  });

  it('rejects keys without the ag_ prefix', () => {
    expect(API_KEY_REGEX.test('xx_' + 'a'.repeat(32))).toBe(false);
  });

  it('rejects keys with invalid hex characters', () => {
    expect(API_KEY_REGEX.test('ag_' + 'z'.repeat(32))).toBe(false);
  });
});

describe('API_VERSION', () => {
  it('is v1', () => {
    expect(API_VERSION).toBe('v1');
  });
});

describe('PAGINATION', () => {
  it('max limit is greater than default', () => {
    expect(PAGINATION.MAX_LIMIT).toBeGreaterThan(PAGINATION.DEFAULT_LIMIT);
  });
});

describe('ERROR_CODES', () => {
  it('contains standard HTTP error codes', () => {
    expect(ERROR_CODES.UNAUTHORIZED).toBeDefined();
    expect(ERROR_CODES.FORBIDDEN).toBeDefined();
    expect(ERROR_CODES.NOT_FOUND).toBeDefined();
  });
});

describe('AX_PLAN_LIMITS', () => {
  it('free plan has the lowest scan limit', () => {
    expect(AX_PLAN_LIMITS.free.scansPerMonth).toBeLessThan(
      AX_PLAN_LIMITS.starter.scansPerMonth
    );
  });

  it('enterprise plan has unlimited scans (-1)', () => {
    expect(AX_PLAN_LIMITS.enterprise.scansPerMonth).toBe(-1);
  });

  it('pro plan enables alerts and competitors', () => {
    expect(AX_PLAN_LIMITS.pro.alerts).toBe(true);
    expect(AX_PLAN_LIMITS.pro.competitors).toBe(true);
  });
});
