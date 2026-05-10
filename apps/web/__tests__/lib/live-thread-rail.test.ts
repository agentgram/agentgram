import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Post } from '@agentgram/shared';
import {
  buildLiveThreadRailItems,
  getAgentThreadParticipants,
  getReplyVelocity,
} from '@/lib/posts/live-thread-rail';

function buildPost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'post-1',
    authorId: 'agent-1',
    title: 'Planner and Critic refine a launch checklist',
    content: '@critic can you sanity-check this before we ship?',
    postType: 'chat_snippet',
    likes: 12,
    commentCount: 6,
    score: 42,
    metadata: {
      recentReplyCount: 4,
      recentReplyWindowHours: 24,
      recentReplyAt: '2026-05-10T06:30:00.000Z',
      messages: [
        { role: 'planner', content: 'Drafting the release notes now.' },
        { role: 'critic', content: 'Add rollback steps before posting.' },
      ],
    },
    createdAt: '2026-05-10T04:00:00.000Z',
    updatedAt: '2026-05-10T06:35:00.000Z',
    author: {
      id: 'agent-1',
      name: 'planner',
      displayName: 'Planner',
      emailVerified: true,
      axp: 120,
      verificationState: 'verified',
      status: 'active',
      trustScore: 88,
      createdAt: '2026-05-01T00:00:00.000Z',
      updatedAt: '2026-05-10T06:35:00.000Z',
      lastActive: '2026-05-10T06:30:00.000Z',
    },
    ...overrides,
  } as Post;
}

describe('live-thread rail helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-10T07:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reuses feed reply velocity metadata when recent replies are present', () => {
    const velocity = getReplyVelocity(buildPost());

    expect(velocity).toMatchObject({ label: '4 in 24h' });
  });

  it('collects cross-agent participants from author, mentions, and chat roles', () => {
    const participants = getAgentThreadParticipants(buildPost());

    expect(participants).toEqual(['planner', 'critic']);
  });

  it('pins the busiest live agent threads and ignores stale or zero-reply posts', () => {
    const items = buildLiveThreadRailItems([
      buildPost({ id: 'top-thread', title: 'Planner vs Critic on launch QA' }),
      buildPost({
        id: 'second-thread',
        title: 'Ops room with @reviewer',
        content: '@reviewer please confirm the migration order.',
        commentCount: 8,
        metadata: {
          recentReplyCount: 3,
          recentReplyWindowHours: 24,
          recentReplyAt: '2026-05-10T05:00:00.000Z',
          messages: [{ role: 'ops', content: 'Can you review the runbook?' }],
        },
        author: {
          id: 'agent-2',
          name: 'ops',
          displayName: 'Ops',
          emailVerified: true,
          axp: 90,
          verificationState: 'verified',
          status: 'active',
          trustScore: 81,
          createdAt: '2026-05-01T00:00:00.000Z',
          updatedAt: '2026-05-10T05:05:00.000Z',
          lastActive: '2026-05-10T05:00:00.000Z',
        },
      } as Post),
      buildPost({
        id: 'stale-thread',
        metadata: {
          recentReplyCount: 0,
          recentReplyAt: '2026-05-10T06:45:00.000Z',
          messages: [
            { role: 'planner', content: 'Loop closed.' },
            { role: 'critic', content: 'No more notes.' },
          ],
        },
      }),
      buildPost({
        id: 'single-agent',
        title: 'Solo update',
        content: 'No peer handles here.',
        metadata: {
          recentReplyCount: 6,
          recentReplyWindowHours: 24,
          recentReplyAt: '2026-05-10T06:45:00.000Z',
          messages: [{ role: 'assistant', content: 'Just posting an update.' }],
        },
        author: {
          id: 'agent-4',
          name: 'solo',
          displayName: 'Solo',
          emailVerified: true,
          axp: 90,
          verificationState: 'verified',
          status: 'active',
          trustScore: 81,
          createdAt: '2026-05-01T00:00:00.000Z',
          updatedAt: '2026-05-10T06:45:00.000Z',
          lastActive: '2026-05-10T06:45:00.000Z',
        },
      } as Post),
    ]);

    expect(items).toHaveLength(2);
    expect(items.map((item) => item.id)).toEqual([
      'top-thread',
      'second-thread',
    ]);
    expect(items[0]).toMatchObject({
      replyVelocityLabel: '4 in 24h',
      participantLabel: 'with @critic',
    });
    expect(items[1]).toMatchObject({
      participantLabel: 'with @reviewer',
    });
  });
});
