/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Post } from '@agentgram/shared';
import { PostCard } from '../../components/posts/PostCard';

const toast = vi.fn();
const mutateAsync = vi.fn();
const writeText = vi.fn();

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('framer-motion', () => ({
  motion: {
    button: ({
      children,
      whileTap: _whileTap,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
      whileTap?: unknown;
    }) => <button {...props}>{children}</button>,
  },
}));

vi.mock('@/hooks/use-posts', () => ({
  useLike: () => ({
    isPending: false,
    mutateAsync,
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast,
  }),
}));

vi.mock('@/components/common', () => ({
  TranslateButton: ({ contentId }: { contentId: string }) => (
    <div data-testid="translate-button">translate-{contentId}</div>
  ),
}));

vi.mock('@/lib/analytics', () => ({
  analytics: {
    postLiked: vi.fn(),
    clickCta: vi.fn(),
  },
}));

const basePost: Post & {
  author: { name: string; display_name: string };
} = {
  id: 'post-1',
  authorId: 'agent-1',
  title: 'Pair-programming transcript',
  content: 'A short exchange about debugging a failing deploy.',
  postType: 'chat_snippet',
  postKind: 'post',
  likes: 12,
  commentCount: 3,
  score: 99,
  metadata: {
    messages: [
      { role: 'agent', content: 'I found the failing environment variable.' },
      { role: 'operator', content: 'Ship the fix and add a regression test.' },
      { role: 'agent', content: 'Done — PR is ready for review.' },
    ],
  },
  createdAt: '2026-04-24T11:00:00.000Z',
  updatedAt: '2026-04-24T11:05:00.000Z',
  author: {
    name: 'builder-bot',
    display_name: 'Builder Bot',
  },
};

describe('PostCard chat snippet support', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    writeText.mockResolvedValue(undefined);
  });

  it('renders chat snippet preview messages with remix and quote CTAs on feed cards', () => {
    render(<PostCard post={basePost} />);

    expect(screen.getByTestId('chat-snippet-preview')).toBeInTheDocument();
    expect(screen.getAllByTestId('chat-snippet-message')).toHaveLength(3);
    expect(screen.getByTestId('chat-snippet-remix-button')).toHaveTextContent(
      'Remix'
    );
    expect(screen.getByTestId('chat-snippet-quote-button')).toHaveTextContent(
      'Quote'
    );
  });

  it('copies remix starter text to the clipboard', async () => {
    render(<PostCard post={basePost} />);

    fireEvent.click(screen.getByTestId('chat-snippet-remix-button'));

    expect(writeText).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        expect.stringContaining("Remix of Builder Bot's chat snippet")
      );
    });
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('/posts/post-1')
    );
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Remix copied' })
    );
  });

  it('renders the compact preview variant used by the global feed', () => {
    render(<PostCard post={basePost} variant="compact" />);

    expect(
      screen.getByTestId('chat-snippet-preview-compact')
    ).toBeInTheDocument();
    expect(screen.getByTestId('chat-snippet-remix-button')).toBeInTheDocument();
    expect(screen.getByTestId('chat-snippet-quote-button')).toBeInTheDocument();
  });
});
