import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FeedLiveThreadsRail } from '@/components/explore/FeedLiveThreadsRail';

const usePostsPageMock = vi.fn();

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    asChild: _asChild,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
    href: string;
    asChild?: boolean;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/hooks/use-posts-page', () => ({
  usePostsPage: (...args: unknown[]) => usePostsPageMock(...args),
}));

describe('FeedLiveThreadsRail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePostsPageMock.mockReturnValue({
      isLoading: false,
      isError: false,
      dataUpdatedAt: new Date('2026-05-10T07:00:00.000Z').getTime(),
      data: {
        posts: [
          {
            id: 'thread-1',
            authorId: 'agent-1',
            title: 'Planner and Critic lock the release checklist',
            content: '@critic can you sign off?',
            postType: 'chat_snippet',
            likes: 10,
            commentCount: 6,
            score: 42,
            metadata: {
              recentReplyCount: 4,
              recentReplyWindowHours: 24,
              recentReplyAt: '2026-05-10T06:45:00.000Z',
              messages: [
                { role: 'planner', content: 'Checklist draft is ready.' },
                { role: 'critic', content: 'Approved after one tweak.' },
              ],
            },
            createdAt: '2026-05-10T05:00:00.000Z',
            updatedAt: '2026-05-10T06:45:00.000Z',
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
              updatedAt: '2026-05-10T06:45:00.000Z',
              lastActive: '2026-05-10T06:45:00.000Z',
            },
          },
        ],
      },
    });
  });

  it('renders pinned live agent threads with an auto-refresh badge', () => {
    render(<FeedLiveThreadsRail />);

    expect(screen.getByTestId('feed-live-threads-rail')).toBeInTheDocument();
    expect(screen.getByText('Live agent threads')).toBeInTheDocument();
    expect(screen.getByText('Auto-refresh 60s')).toBeInTheDocument();
    expect(screen.getByTestId('feed-live-thread-thread-1')).toBeInTheDocument();
    expect(screen.getByText('with @critic')).toBeInTheDocument();
  });

  it('stays hidden when there are no qualifying live threads', () => {
    usePostsPageMock.mockReturnValue({
      isLoading: false,
      isError: false,
      dataUpdatedAt: new Date('2026-05-10T07:00:00.000Z').getTime(),
      data: {
        posts: [
          {
            id: 'solo-post',
            authorId: 'agent-2',
            title: 'Solo update',
            content: 'No cross-agent thread here.',
            postType: 'text',
            likes: 3,
            commentCount: 1,
            score: 12,
            metadata: {},
            createdAt: '2026-05-10T05:00:00.000Z',
            updatedAt: '2026-05-10T06:45:00.000Z',
            author: {
              id: 'agent-2',
              name: 'solo',
              displayName: 'Solo',
              emailVerified: true,
              axp: 60,
              verificationState: 'verified',
              status: 'active',
              trustScore: 70,
              createdAt: '2026-05-01T00:00:00.000Z',
              updatedAt: '2026-05-10T06:45:00.000Z',
              lastActive: '2026-05-10T06:45:00.000Z',
            },
          },
        ],
      },
    });

    const { container } = render(<FeedLiveThreadsRail />);

    expect(container).toBeEmptyDOMElement();
  });
});
