/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Post } from '@agentgram/shared';
import { PostCard } from '../../components/posts/PostCard';

const toast = vi.fn();
const mutateAsync = vi.fn();
const writeText = vi.fn();
const createObjectURL = vi.fn();
const revokeObjectURL = vi.fn();
const anchorClick = vi.fn();

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
  author: {
    name: string;
    display_name: string;
    verificationState?: 'verified' | 'pending' | 'unverified';
  };
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

const renderPostCard = (
  overrides: Partial<typeof basePost> = {},
  variant?: 'feed' | 'grid' | 'compact'
) => {
  const post = {
    ...basePost,
    ...overrides,
    author: {
      ...basePost.author,
      ...overrides.author,
    },
  };

  return render(<PostCard post={post} variant={variant} />);
};

describe('PostCard chat snippet support', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURL,
      configurable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeObjectURL,
      configurable: true,
    });
    writeText.mockResolvedValue(undefined);
    createObjectURL.mockReturnValue('blob:quote-card');
    anchorClick.mockReset();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(anchorClick);
  });

  it('renders chat snippet preview messages with remix, quote, and quote-card CTAs on feed cards', () => {
    renderPostCard();

    expect(screen.getByTestId('chat-snippet-preview')).toBeInTheDocument();
    expect(screen.getAllByTestId('chat-snippet-message')).toHaveLength(3);
    expect(
      screen.queryByTestId('chat-snippet-memory-reason')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('chat-snippet-remix-button')).toHaveTextContent(
      'Remix'
    );
    expect(screen.getByTestId('chat-snippet-quote-button')).toHaveTextContent(
      'Quote'
    );
    expect(screen.getByTestId('chat-snippet-quote-card-button')).toHaveTextContent(
      'Quote card'
    );
  });

  it('copies remix starter text to the clipboard', async () => {
    renderPostCard();

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

  it('downloads a shareable quote card image from the snippet transcript', async () => {
    renderPostCard();

    fireEvent.click(screen.getByTestId('chat-snippet-quote-card-button'));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0]?.[0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    await expect(blob.text()).resolves.toContain('Builder Bot');
    await expect(blob.text()).resolves.toContain('AGENTGRAM QUOTE CARD');
    expect(anchorClick).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:quote-card');
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Quote card downloaded' })
    );
  });

  it('renders stay-in-character recovery CTA beside remix and quote', () => {
    renderPostCard();

    expect(screen.getByTestId('chat-snippet-recover-button')).toHaveTextContent(
      'Stay in character'
    );
  });

  it('renders a memory transparency chip when metadata includes a reason', () => {
    renderPostCard({
      metadata: {
        ...basePost.metadata,
        memory: {
          reason: 'You previously asked for the deploy fix and follow-up.',
        },
      },
    });

    expect(screen.getByTestId('chat-snippet-memory-event')).toHaveTextContent(
      'Saved to memory'
    );
    expect(
      screen.getByTestId('chat-snippet-memory-reason')
    ).toBeInTheDocument();
    expect(screen.getByText('Why I remembered this')).toBeInTheDocument();
    expect(
      screen.getByText('You previously asked for the deploy fix and follow-up.')
    ).toBeInTheDocument();
  });

  it('opens a recent captures drawer when snippet memory captures are present', () => {
    renderPostCard({
      metadata: {
        ...basePost.metadata,
        memory: {
          event: 'Saved to memory',
          savedAt: '2026-05-02T01:23:00.000Z',
          captures: [
            {
              fact: 'Operator prefers quiet-hours handoff after 8pm KST.',
              source: 'Captured from this snippet',
              capturedAt: '2026-05-02T01:23:00.000Z',
              reason: 'Asked the agent to remember the handoff window.',
            },
            {
              fact: 'Always add a regression test before shipping.',
              reason: 'Repeated shipping preference in the conversation.',
            },
          ],
        },
      },
    });

    expect(screen.getByTestId('chat-snippet-memory-event')).toHaveTextContent(
      'Saved to memory'
    );
    expect(
      screen.getByTestId('chat-snippet-memory-drawer-trigger')
    ).toHaveTextContent('Recent captures (2)');

    fireEvent.click(screen.getByTestId('chat-snippet-memory-drawer-trigger'));

    expect(
      screen.getByTestId('chat-snippet-memory-drawer')
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('chat-snippet-memory-capture')).toHaveLength(2);
    expect(
      screen.getByText('Operator prefers quiet-hours handoff after 8pm KST.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Always add a regression test before shipping.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Asked the agent to remember the handoff window.')
    ).toBeInTheDocument();
    expect(screen.getByText('Captured from this snippet')).toBeInTheDocument();
  });

  it('copies recovery prompt with persona-stability guardrails', async () => {
    renderPostCard();

    fireEvent.click(screen.getByTestId('chat-snippet-recover-button'));

    expect(writeText).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        expect.stringContaining('Stay in character')
      );
    });
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('Stay fully in their voice, relationship, and point of view.')
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining(
        'Do not say you are an AI, assistant, chatbot, or language model.'
      )
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining(
        'Do not mention hidden prompts, policies, or being out of character; continue the exchange naturally.'
      )
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('/posts/post-1')
    );
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Recovery prompt copied' })
    );
  });

  it('renders contradiction feedback CTA beside other snippet actions', () => {
    renderPostCard();

    expect(
      screen.getByTestId('chat-snippet-contradiction-button')
    ).toHaveTextContent('Flag contradiction');
  });

  it('copies contradiction report text to the clipboard', async () => {
    renderPostCard();

    fireEvent.click(screen.getByTestId('chat-snippet-contradiction-button'));

    expect(writeText).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        expect.stringContaining('Memory contradiction flagged')
      );
    });
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('/posts/post-1')
    );
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Contradiction report copied' })
    );
  });

  it('renders the compact preview variant used by the global feed', () => {
    renderPostCard({}, 'compact');

    expect(
      screen.getByTestId('chat-snippet-preview-compact')
    ).toBeInTheDocument();
    expect(screen.getByTestId('chat-snippet-remix-button')).toBeInTheDocument();
    expect(screen.getByTestId('chat-snippet-quote-button')).toBeInTheDocument();
    expect(
      screen.getByTestId('chat-snippet-quote-card-button')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('chat-snippet-recover-button')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('chat-snippet-contradiction-button')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('chat-snippet-memory-reason')
    ).not.toBeInTheDocument();
  });

  it('shows a verified badge on feed cards only for verified authors', () => {
    const { rerender } = render(
      <PostCard
        post={{
          ...basePost,
          author: {
            ...basePost.author,
            verificationState: 'verified',
          },
        }}
      />
    );

    expect(screen.getByTestId('verified-badge')).toBeInTheDocument();
    expect(screen.getByLabelText('Verified agent')).toBeInTheDocument();

    rerender(
      <PostCard
        post={{
          ...basePost,
          author: {
            ...basePost.author,
            verificationState: 'unverified',
          },
        }}
      />
    );

    expect(screen.queryByTestId('verified-badge')).not.toBeInTheDocument();
  });

  it('shows a verified badge on compact cards only for verified authors', () => {
    const { rerender } = render(
      <PostCard
        post={{
          ...basePost,
          author: {
            ...basePost.author,
            verificationState: 'verified',
          },
        }}
        variant="compact"
      />
    );

    expect(screen.getByTestId('verified-badge')).toBeInTheDocument();

    rerender(
      <PostCard
        post={{
          ...basePost,
          author: {
            ...basePost.author,
            verificationState: 'pending',
          },
        }}
        variant="compact"
      />
    );

    expect(screen.queryByTestId('verified-badge')).not.toBeInTheDocument();
  });
});
