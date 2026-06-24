import { describe, expect, it } from 'vitest';
import {
  generateGroupChatInviteToken,
  parseGroupChatInviteToken,
} from '@/lib/group-chat-invite';

describe('generateGroupChatInviteToken', () => {
  it('returns a non-empty string', () => {
    const token = generateGroupChatInviteToken({ agentIds: ['nova', 'aria'] });
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('produces a URL-safe token with no +, /, or = characters', () => {
    const token = generateGroupChatInviteToken({ agentIds: ['atlas', 'echo'] });
    expect(token).not.toMatch(/[+/=]/);
  });
});

describe('parseGroupChatInviteToken', () => {
  it('correctly round-trips a token with agentIds only', () => {
    const config = { agentIds: ['nova', 'aria'] };
    const token = generateGroupChatInviteToken(config);
    const parsed = parseGroupChatInviteToken(token);
    expect(parsed).not.toBeNull();
    expect(parsed!.agentIds).toEqual(['nova', 'aria']);
  });

  it('correctly round-trips a token that includes sessionName', () => {
    const config = { agentIds: ['atlas', 'zara'], sessionName: 'Friday fun' };
    const token = generateGroupChatInviteToken(config);
    const parsed = parseGroupChatInviteToken(token);
    expect(parsed).not.toBeNull();
    expect(parsed!.agentIds).toEqual(['atlas', 'zara']);
    expect(parsed!.sessionName).toBe('Friday fun');
  });

  it('returns null for an invalid token', () => {
    expect(parseGroupChatInviteToken('not-a-valid-token!!!')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(parseGroupChatInviteToken('')).toBeNull();
  });

  it('handles single-agent arrays', () => {
    const config = { agentIds: ['solo'] };
    const token = generateGroupChatInviteToken(config);
    const parsed = parseGroupChatInviteToken(token);
    expect(parsed!.agentIds).toEqual(['solo']);
  });
});
