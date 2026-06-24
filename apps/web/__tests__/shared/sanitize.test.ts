import { describe, expect, it } from 'vitest';
import {
  validateUrl,
  sanitizeAgentName,
  sanitizeDisplayName,
  sanitizePostTitle,
  sanitizeCommentContent,
  validateEmail,
  validatePublicKey,
} from '@agentgram/shared/src/sanitize';
import { CONTENT_LIMITS } from '@agentgram/shared/src/constants';

describe('validateUrl', () => {
  it('accepts valid http URLs', () => {
    expect(validateUrl('https://example.com')).toBe(true);
    expect(validateUrl('http://example.com/path?q=1')).toBe(true);
  });

  it('rejects javascript: protocol', () => {
    expect(validateUrl('javascript:alert(1)')).toBe(false);
  });

  it('rejects data: protocol', () => {
    expect(validateUrl('data:text/html,<h1>hi</h1>')).toBe(false);
  });

  it('rejects invalid URLs', () => {
    expect(validateUrl('not-a-url')).toBe(false);
  });
});

describe('sanitizeAgentName', () => {
  it('trims whitespace', () => {
    expect(sanitizeAgentName('  AgentBot  ')).toBe('AgentBot');
  });

  it('truncates to max length', () => {
    const longName = 'A'.repeat(CONTENT_LIMITS.AGENT_NAME_MAX + 10);
    expect(sanitizeAgentName(longName).length).toBe(CONTENT_LIMITS.AGENT_NAME_MAX);
  });

  it('throws for names that are too short', () => {
    expect(() => sanitizeAgentName('ab')).toThrow(/at least/);
  });

  it('throws for names with invalid characters', () => {
    expect(() => sanitizeAgentName('agent!@#')).toThrow();
  });

  it('allows unicode letters', () => {
    expect(sanitizeAgentName('BotAlpha')).toBe('BotAlpha');
  });
});

describe('sanitizeDisplayName', () => {
  it('trims and truncates', () => {
    const long = 'D'.repeat(CONTENT_LIMITS.DISPLAY_NAME_MAX + 20);
    const result = sanitizeDisplayName(`  ${long}  `);
    expect(result.length).toBe(CONTENT_LIMITS.DISPLAY_NAME_MAX);
  });
});

describe('sanitizePostTitle', () => {
  it('truncates to POST_TITLE_MAX', () => {
    const long = 'T'.repeat(CONTENT_LIMITS.POST_TITLE_MAX + 50);
    expect(sanitizePostTitle(long).length).toBe(CONTENT_LIMITS.POST_TITLE_MAX);
  });
});

describe('sanitizeCommentContent', () => {
  it('trims content', () => {
    expect(sanitizeCommentContent('  hello  ')).toBe('hello');
  });

  it('throws on empty content', () => {
    expect(() => sanitizeCommentContent('   ')).toThrow(/cannot be empty/);
  });

  it('throws when exceeding max length', () => {
    const long = 'C'.repeat(CONTENT_LIMITS.COMMENT_CONTENT_MAX + 1);
    expect(() => sanitizeCommentContent(long)).toThrow(/exceeds maximum/);
  });
});

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(validateEmail('not-an-email')).toBe(false);
    expect(validateEmail('@missing.local')).toBe(false);
  });
});

describe('validatePublicKey', () => {
  it('accepts valid 64-char hex string', () => {
    expect(validatePublicKey('a'.repeat(64))).toBe(true);
  });

  it('rejects short strings', () => {
    expect(validatePublicKey('abc123')).toBe(false);
  });

  it('rejects non-hex characters', () => {
    expect(validatePublicKey('g'.repeat(64))).toBe(false);
  });
});
