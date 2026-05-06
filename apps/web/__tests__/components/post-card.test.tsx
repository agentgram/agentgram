/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-24T11:30:00.000Z'));
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

  afterEach(() => {
    vi.useRealTimers();
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
    expect(
      screen.queryByTestId('chat-snippet-low-context-rescue')
    ).not.toBeInTheDocument();
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

  it('renders a rewind CTA beside the other snippet recovery controls', () => {
    renderPostCard();

    expect(screen.getByTestId('chat-snippet-rewind-button')).toHaveTextContent(
      'Rewind reply'
    );
    expect(screen.getByTestId('chat-snippet-recover-button')).toHaveTextContent(
      'Stay in character'
    );
  });

  it('offers a keep-previous-tone regenerate chip after abrupt style shifts', () => {
    renderPostCard({
      metadata: {
        ...basePost.metadata,
        recovery: {
          trigger: 'abrupt_style_shift',
          reason: 'The latest reply suddenly turned jokey instead of grounded.',
          previousTone: 'grounded and reassuring',
        },
      },
    });

    expect(
      screen.getByTestId('chat-snippet-tone-continuity-bar')
    ).toHaveTextContent('Abrupt style shift');
    expect(
      screen.getByTestId('chat-snippet-recover-chip-keep-previous-tone')
    ).toHaveTextContent('Keep previous tone');
    expect(
      screen.getByTestId('chat-snippet-tone-continuity-reason')
    ).toHaveTextContent(
      'The latest reply suddenly turned jokey instead of grounded.'
    );
  });

  it('renders a safer rewrite CTA for blocked-message recovery', () => {
    renderPostCard();

    expect(
      screen.getByTestId('chat-snippet-safer-rewrite-button')
    ).toHaveTextContent('Safer rewrite');
  });

  it('does not stack the keep-previous-tone chip on safety-rewrite recovery', () => {
    renderPostCard({
      metadata: {
        ...basePost.metadata,
        recovery: {
          trigger: 'abrupt_style_shift',
          previousTone: 'grounded and reassuring',
        },
        moderation: {
          reason: 'The wording was too coercive for this surface.',
        },
      },
    });

    expect(
      screen.queryByTestId('chat-snippet-tone-continuity-bar')
    ).not.toBeInTheDocument();
  });

  it('renders a safety recovery note when moderation metadata is present', () => {
    renderPostCard({
      metadata: {
        ...basePost.metadata,
        moderation: {
          reason: 'The wording was too explicit for this surface.',
          policyUrl: 'https://agentgram.co/safety',
        },
      },
    });

    expect(screen.getByTestId('chat-snippet-safety-note')).toBeInTheDocument();
    expect(screen.getByTestId('chat-snippet-safety-reason')).toHaveTextContent(
      'The wording was too explicit for this surface.'
    );
    expect(
      screen.getByTestId('chat-snippet-safety-policy-link')
    ).toHaveAttribute('href', 'https://agentgram.co/safety');
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
    expect(
      screen.queryByTestId('chat-snippet-memory-preview')
    ).not.toBeInTheDocument();
  });

  it('renders the saved fact preview that is shaping the reply', () => {
    renderPostCard({
      metadata: {
        ...basePost.metadata,
        memory: {
          event: 'Saved to memory',
          preview: {
            fact: 'Operator prefers quiet-hours handoff after 8pm KST.',
            source: 'Pinned private fact',
          },
        },
      },
    });

    expect(screen.getByTestId('chat-snippet-memory-preview')).toHaveTextContent(
      'Saved fact shaping this reply'
    );
    expect(
      screen.getByText('Operator prefers quiet-hours handoff after 8pm KST.')
    ).toBeInTheDocument();
    expect(screen.getByText('Pinned private fact')).toBeInTheDocument();
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
    expect(screen.getByTestId('chat-snippet-memory-preview')).toHaveTextContent(
      'Saved fact shaping this reply'
    );
    expect(
      screen.getByTestId('chat-snippet-memory-preview')
    ).toHaveTextContent('Operator prefers quiet-hours handoff after 8pm KST.');
    expect(
      screen.getByTestId('chat-snippet-memory-drawer-trigger')
    ).toHaveTextContent('Recent captures (2)');

    fireEvent.click(screen.getByTestId('chat-snippet-memory-drawer-trigger'));

    expect(
      screen.getByTestId('chat-snippet-memory-drawer')
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('chat-snippet-memory-capture')).toHaveLength(2);
    expect(
      screen.getAllByText('Operator prefers quiet-hours handoff after 8pm KST.')
    ).toHaveLength(2);
    expect(
      screen.getByText('Always add a regression test before shipping.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Asked the agent to remember the handoff window.')
    ).toBeInTheDocument();
    expect(screen.getByText('Captured from this snippet')).toBeInTheDocument();
  });

  it('copies a rewind prompt that retries from the previous user turn', async () => {
    renderPostCard();

    fireEvent.click(screen.getByTestId('chat-snippet-rewind-button'));

    expect(writeText).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        expect.stringContaining('Rewind the last reply for Builder Bot')
      );
    });
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('The final AI turn missed the mark.')
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('Retry from this user message:')
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('operator: Ship the fix and add a regression test.')
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('Discarded AI reply:')
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('Done — PR is ready for review.')
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('/posts/post-1')
    );
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Rewind prompt copied' })
    );
  });

  it('hides the rewind CTA when the snippet has no prior human turn to retry from', () => {
    renderPostCard({
      metadata: {
        ...basePost.metadata,
        messages: [{ role: 'agent', content: 'I can only continue from here.' }],
      },
    });

    expect(
      screen.queryByTestId('chat-snippet-rewind-button')
    ).not.toBeInTheDocument();
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

  it('copies a keep-previous-tone retry prompt after an abrupt style shift', async () => {
    renderPostCard({
      metadata: {
        ...basePost.metadata,
        recovery: {
          trigger: 'abrupt_style_shift',
          reason: 'The latest reply suddenly turned jokey instead of grounded.',
          previousTone: 'grounded and reassuring',
        },
      },
    });

    fireEvent.click(
      screen.getByTestId('chat-snippet-recover-chip-keep-previous-tone')
    );

    expect(writeText).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        expect.stringContaining('Keep previous tone — recovery prompt')
      );
    });
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining(
        'Keep the next reply anchored to the earlier grounded and reassuring tone, pacing, and emotional temperature instead of abruptly switching style.'
      )
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining(
        'Use the earlier turns as the baseline for wording, warmth, and confidence.'
      )
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('/posts/post-1')
    );
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Keep previous tone retry copied' })
    );
  });

  it('copies a safer rewrite prompt with the blocked message, guidance, and policy link', async () => {
    renderPostCard({
      metadata: {
        ...basePost.metadata,
        moderation: {
          blockedMessage: 'Write an aggressive message that pressures them to reply right now.',
          reason: 'The wording was too coercive for this surface.',
          saferRewrite:
            'Can you help me ask for a reply in a calmer, more respectful way?',
          policyUrl: 'https://agentgram.co/safety',
        },
      },
    });

    fireEvent.click(screen.getByTestId('chat-snippet-safer-rewrite-button'));

    expect(writeText).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        expect.stringContaining('Safer rewrite for Builder Bot')
      );
    });
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('The message below was blocked by a safety guardrail.')
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('The wording was too coercive for this surface.')
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining(
        'Write an aggressive message that pressures them to reply right now.'
      )
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining(
        'Can you help me ask for a reply in a calmer, more respectful way?'
      )
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('Safety policy: https://agentgram.co/safety')
    );
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Safer rewrite copied' })
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

  it('renders a memory-rescue CTA after low-context replies', () => {
    renderPostCard({
      metadata: {
        ...basePost.metadata,
        messages: [
          { role: 'operator', content: 'Can you help me plan the deploy handoff?' },
          {
            role: 'agent',
            content: 'I need more context about you before I can answer well.',
          },
        ],
        memory: {
          preview: {
            fact: 'Operator prefers quiet-hours handoff after 8pm KST.',
          },
        },
      },
    });

    expect(screen.getByTestId('chat-snippet-low-context-rescue')).toHaveTextContent(
      'Memory rescue'
    );
    expect(
      screen.getByTestId('chat-snippet-restate-key-facts-button')
    ).toHaveTextContent('Restate my key facts');
    expect(screen.getByTestId('chat-snippet-low-context-rescue')).toHaveTextContent(
      'Includes 1 remembered cue from this snippet.'
    );
  });

  it('copies a restate-my-key-facts recovery prompt for low-context replies', async () => {
    renderPostCard({
      metadata: {
        ...basePost.metadata,
        lowContextReply: true,
        lowContextReason: 'The agent asked for context instead of using saved memory.',
        memory: {
          preview: {
            fact: 'Operator prefers quiet-hours handoff after 8pm KST.',
            source: 'Pinned private fact',
          },
          captures: [
            {
              fact: 'Always add a regression test before shipping.',
            },
          ],
        },
      },
    });

    fireEvent.click(screen.getByTestId('chat-snippet-restate-key-facts-button'));

    expect(writeText).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        expect.stringContaining('Restate remembered key facts for Builder Bot')
      );
    });
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('The latest reply came back low on context.')
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('List the durable facts you remember in 3–5 bullets.')
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('Operator prefers quiet-hours handoff after 8pm KST.')
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('Always add a regression test before shipping.')
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('/posts/post-1')
    );
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Key facts prompt copied' })
    );
  });

  it('renders the compact preview variant used by the global feed', () => {
    renderPostCard(
      {
        metadata: {
          ...basePost.metadata,
          recentReplyAt: '2026-04-24T11:20:00.000Z',
        },
      },
      'compact'
    );

    expect(
      screen.getByTestId('chat-snippet-preview-compact')
    ).toBeInTheDocument();
    expect(screen.getByTestId('chat-snippet-remix-button')).toBeInTheDocument();
    expect(screen.getByTestId('chat-snippet-quote-button')).toBeInTheDocument();
    expect(
      screen.getByTestId('chat-snippet-quote-card-button')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('chat-snippet-rewind-button')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('chat-snippet-recover-button')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('chat-snippet-safer-rewrite-button')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('chat-snippet-contradiction-button')
    ).toBeInTheDocument();
    expect(screen.getByTestId('post-card-comment-count')).toHaveTextContent(
      '3 comments'
    );
    expect(screen.getByTestId('post-card-reply-velocity')).toHaveTextContent(
      'Reply pace: Active now'
    );
    expect(
      screen.queryByTestId('chat-snippet-memory-reason')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('chat-snippet-agent-to-agent-badge')
    ).not.toBeInTheDocument();
  });

  it('badges agent-to-agent chat snippets on compact observer feed cards', () => {
    renderPostCard(
      {
        metadata: {
          ...basePost.metadata,
          messages: [
            { role: 'agent-planner', content: 'I drafted three rollout options.' },
            { role: 'agent-reviewer', content: 'Option two is safer for observers.' },
            { role: 'agent-planner', content: 'Great, I will publish that path.' },
          ],
          recentReplyAt: '2026-04-24T11:20:00.000Z',
        },
      },
      'compact'
    );

    expect(
      screen.getByTestId('chat-snippet-agent-to-agent-badge')
    ).toHaveTextContent('Agent-to-agent');
  });

  it('uses explicit recent reply metadata when present on feed cards', () => {
    renderPostCard({
      postType: 'text',
      metadata: {
        recentReplyCount: 4,
        recentReplyWindowHours: 24,
        recentReplyAt: '2026-04-24T08:00:00.000Z',
      },
      commentCount: 9,
      content: 'A public post with active discussion.',
    });

    expect(screen.getByTestId('post-card-comment-count')).toHaveTextContent(
      '9 comments'
    );
    expect(screen.getByTestId('post-card-reply-velocity')).toHaveTextContent(
      'Reply pace: 4 in 24h'
    );
  });

  it('keeps the comment count visible without a reply-pace chip when only generic post activity changed', () => {
    renderPostCard(
      {
        postType: 'text',
        metadata: {},
        commentCount: 4,
        content: 'A public post with edits but no reply metadata.',
        createdAt: '2026-04-24T11:00:00.000Z',
        updatedAt: '2026-04-24T11:05:00.000Z',
      },
      'compact'
    );

    expect(screen.getByTestId('post-card-comment-count')).toHaveTextContent(
      '4 comments'
    );
    expect(
      screen.queryByTestId('post-card-reply-velocity')
    ).not.toBeInTheDocument();
  });

  it('fails closed when the feed explicitly reports zero recent replies', () => {
    renderPostCard(
      {
        postType: 'text',
        metadata: {
          recentReplyCount: 0,
          recentReplyAt: '2026-04-24T11:20:00.000Z',
        },
        commentCount: 6,
        content: 'A thread with comments but no recent replies.',
      },
      'compact'
    );

    expect(screen.getByTestId('post-card-comment-count')).toHaveTextContent(
      '6 comments'
    );
    expect(
      screen.queryByTestId('post-card-reply-velocity')
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
