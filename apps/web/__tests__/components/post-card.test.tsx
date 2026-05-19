/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Post } from '@agentgram/shared';
import { PostCard } from '../../components/posts/PostCard';

const toast = vi.fn();
const mutateAsync = vi.fn();
const writeText = vi.fn();
const createObjectURL = vi.fn();
const revokeObjectURL = vi.fn();
const anchorClick = vi.fn();
const fetchMock = vi.fn();

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
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
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
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      anchorClick
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders chat snippet preview messages with remix, quote, and quote-card CTAs on feed cards', () => {
    renderPostCard();

    expect(screen.getByTestId('chat-snippet-preview')).toBeInTheDocument();
    expect(screen.getAllByTestId('chat-snippet-message')).toHaveLength(3);
    expect(
      screen.queryByTestId('chat-snippet-memory-reason')
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('chat-snippet-remember-this-button')
    ).toHaveTextContent('Remember this');
    expect(screen.getByTestId('chat-snippet-remix-button')).toHaveTextContent(
      'Remix'
    );
    expect(screen.getByTestId('chat-snippet-quote-button')).toHaveTextContent(
      'Quote'
    );
    expect(
      screen.getByTestId('chat-snippet-quote-card-button')
    ).toHaveTextContent('Quote card');
    expect(
      screen.getByTestId('chat-snippet-follow-up-opt-in-button')
    ).toHaveTextContent('Enable future check-ins');
    expect(
      screen.queryByTestId('chat-snippet-bad-recall-recovery')
    ).not.toBeInTheDocument();
  });

  it('hides the follow-up opt-in CTA on weaker snippets without momentum', () => {
    renderPostCard({
      commentCount: 0,
      metadata: {
        messages: [{ role: 'agent', content: 'A single isolated reply.' }],
      },
    });

    expect(
      screen.queryByTestId('chat-snippet-follow-up-opt-in')
    ).not.toBeInTheDocument();
  });

  it('surfaces a memory watch card on longer chat snippets before context gets compressed', () => {
    renderPostCard({
      metadata: {
        messages: [
          { role: 'operator', content: 'Remember that I ship after 8pm KST.' },
          { role: 'agent', content: 'Got it — after 8pm KST.' },
          { role: 'operator', content: 'Also keep the tone calm.' },
          { role: 'agent', content: 'Calm tone locked.' },
          { role: 'operator', content: 'And always add a regression test.' },
          { role: 'agent', content: 'Regression test noted before deploy.' },
        ],
      },
    });

    expect(
      screen.getByTestId('chat-snippet-memory-pressure-badge')
    ).toHaveTextContent('Memory watch');
    expect(
      screen.getByTestId('chat-snippet-memory-pressure-card')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('chat-snippet-memory-pressure-title')
    ).toHaveTextContent('Context is getting longer');
    expect(
      screen.getByTestId('chat-snippet-memory-pressure-description')
    ).toHaveTextContent('Save the durable facts now');
    expect(
      screen.getByTestId('chat-snippet-memory-pressure-turns')
    ).toHaveTextContent('6 turns');
  });

  it('honors compression-risk metadata overrides even on shorter snippets', () => {
    renderPostCard({
      metadata: {
        messages: [
          { role: 'operator', content: 'Remember the launch checklist.' },
          { role: 'agent', content: 'I have it.' },
          { role: 'operator', content: 'Do not lose the pricing note.' },
        ],
        compressionRisk: 'critical',
        compressionRiskReason:
          'This thread is about to be summarized into a weekly digest, so save the launch checklist first.',
      },
    });

    expect(
      screen.getByTestId('chat-snippet-memory-pressure-badge')
    ).toHaveTextContent('Compression risk');
    expect(
      screen.getByTestId('chat-snippet-memory-pressure-description')
    ).toHaveTextContent(
      'This thread is about to be summarized into a weekly digest, so save the launch checklist first.'
    );
    expect(
      screen.getByTestId('chat-snippet-memory-pressure-turns')
    ).toHaveTextContent('3 turns');
  });

  it('does not show a memory-pressure card on short snippets by default', () => {
    renderPostCard();

    expect(
      screen.queryByTestId('chat-snippet-memory-pressure-badge')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('chat-snippet-memory-pressure-card')
    ).not.toBeInTheDocument();
  });

  it('enables future check-ins from a strong thread in one tap', async () => {
    const savedSettings = {
      optIn: false,
      dailyLimit: 3,
      weeklyLimit: 9,
      quietHoursEnabled: true,
      quietHoursStart: '23:00',
      quietHoursEnd: '07:30',
      tonePreset: 'warm' as const,
    };

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: savedSettings }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { ...savedSettings, optIn: true },
        }),
      });

    renderPostCard();

    await act(async () => {
      fireEvent.click(
        screen.getByTestId('chat-snippet-follow-up-opt-in-button')
      );
    });

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/v1/developers/me/proactive-controls',
      expect.objectContaining({ method: 'GET', cache: 'no-store' })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/v1/developers/me/proactive-controls',
      expect.objectContaining({ method: 'PUT' })
    );
    expect(JSON.parse(fetchMock.mock.calls[1]?.[1]?.body as string)).toEqual({
      ...savedSettings,
      optIn: true,
    });
    expect(
      screen.getByTestId('chat-snippet-follow-up-opt-in-button')
    ).toHaveTextContent('Future check-ins enabled');
    expect(
      screen.getByTestId('chat-snippet-follow-up-opt-in-summary-caps')
    ).toHaveTextContent('Caps · 3/day · 9/week');
    expect(
      screen.getByTestId('chat-snippet-follow-up-opt-in-summary-quiet-hours')
    ).toHaveTextContent('Quiet hours · 23:00 → 07:30 KST');
    expect(
      screen.getByTestId('chat-snippet-follow-up-opt-in-summary-tone')
    ).toHaveTextContent('Tone · Warm');
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Future check-ins enabled' })
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

  it('renders lock-tone, rewind, and stay-in-character controls beside the other snippet actions', () => {
    renderPostCard();

    expect(
      screen.getByTestId('chat-snippet-lock-tone-button')
    ).toHaveTextContent('Lock current tone');
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
    expect(
      screen.queryByTestId('chat-snippet-remember-this-button')
    ).not.toBeInTheDocument();
  });

  it('saves a standout chat moment into memory from the snippet actions', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          id: 'mem-remember-1',
          value: 'Ship the fix and add a regression test.',
          created_at: '2026-04-24T11:29:00.000Z',
        },
      }),
    });

    renderPostCard();

    await act(async () => {
      fireEvent.click(screen.getByTestId('chat-snippet-remember-this-button'));
    });

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/v1/agents/me/memories',
        expect.objectContaining({ method: 'POST' })
      );
    });
    expect(JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string)).toEqual({
      key: 'chat-post-1-relationship-context',
      value: 'Ship the fix and add a regression test.',
      category: 'relationship_context',
      isPublic: false,
    });
    expect(screen.getByTestId('chat-snippet-memory-event')).toHaveTextContent(
      'Saved to memory'
    );
    expect(screen.getByTestId('chat-snippet-memory-preview')).toHaveTextContent(
      'Ship the fix and add a regression test.'
    );
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Saved to memory' })
    );
  });

  it('keeps manual remember-this state scoped to the current post id', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          id: 'mem-remember-1',
          value: 'Ship the fix and add a regression test.',
          created_at: '2026-04-24T11:29:00.000Z',
        },
      }),
    });

    const view = renderPostCard();

    await act(async () => {
      fireEvent.click(screen.getByTestId('chat-snippet-remember-this-button'));
    });

    await vi.waitFor(() => {
      expect(screen.getByTestId('chat-snippet-memory-event')).toHaveTextContent(
        'Saved to memory'
      );
    });

    view.rerender(
      <PostCard
        post={{
          ...basePost,
          id: 'post-2',
          title: 'A different thread',
          content: 'Fresh context for another conversation.',
          metadata: {
            messages: [
              { role: 'operator', content: 'Remember only this new launch note.' },
              { role: 'agent', content: 'I can pin the new launch note from here.' },
            ],
          },
        }}
      />
    );

    expect(
      screen.queryByTestId('chat-snippet-memory-event')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Ship the fix and add a regression test.')
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('chat-snippet-remember-this-button')
    ).toHaveTextContent('Remember this');
  });

  it('renders topic chips that deep-link into filtered AI-only subfeeds', () => {
    renderPostCard({
      title: 'Pair-programming transcript #AI #Robotics',
      content: 'A short exchange about #AI debugging and #MLOps follow-up.',
    });

    expect(screen.getByTestId('post-topic-chips')).toBeInTheDocument();
    expect(screen.getByTestId('post-topic-chip-ai')).toHaveAttribute(
      'href',
      '/explore?tab=explore&tag=ai'
    );
    expect(screen.getByTestId('post-topic-chip-robotics')).toHaveAttribute(
      'href',
      '/explore?tab=explore&tag=robotics'
    );
    expect(screen.getByTestId('post-topic-chip-mlops')).toHaveAttribute(
      'href',
      '/explore?tab=explore&tag=mlops'
    );
  });

  it('renders a return-to-chat recap before the first message after an idle gap', () => {
    renderPostCard({
      metadata: {
        ...basePost.metadata,
        returnToChatRecap: {
          idleGapLabel: '14h',
          lastGoal: 'Pick up the ship checklist where we left it.',
          savedFacts: [
            'Operator prefers quiet-hours handoff after 8pm KST.',
            'Always add a regression test before shipping.',
          ],
        },
      },
    });

    const recap = screen.getByTestId('chat-snippet-return-recap');
    const firstMessage = screen.getAllByTestId('chat-snippet-message')[0];

    expect(recap).toHaveTextContent('Return to chat recap');
    expect(screen.getByTestId('chat-snippet-return-gap')).toHaveTextContent(
      '14h idle gap'
    );
    expect(screen.getAllByTestId('chat-snippet-return-fact')).toHaveLength(2);
    expect(screen.getByTestId('chat-snippet-return-goal')).toHaveTextContent(
      'Pick up the ship checklist where we left it.'
    );
    expect(
      recap.compareDocumentPosition(firstMessage) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).not.toBe(0);
  });

  it('falls back to saved memory facts when the recap omits an explicit fact list', () => {
    renderPostCard({
      metadata: {
        ...basePost.metadata,
        idleGapMinutes: 180,
        lastGoal: 'Restart the deploy once staging passes.',
        memory: {
          captures: [
            {
              fact: 'Always add a regression test before shipping.',
              reason: 'Repeated shipping preference in the conversation.',
            },
          ],
        },
      },
    });

    expect(screen.getByTestId('chat-snippet-return-gap')).toHaveTextContent(
      '3h idle gap'
    );
    expect(screen.getByTestId('chat-snippet-return-facts')).toHaveTextContent(
      'Always add a regression test before shipping.'
    );
    expect(screen.getByTestId('chat-snippet-return-goal')).toHaveTextContent(
      'Restart the deploy once staging passes.'
    );
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
    expect(screen.getByTestId('chat-snippet-memory-preview')).toHaveTextContent(
      'Operator prefers quiet-hours handoff after 8pm KST.'
    );
    expect(
      screen.getByTestId('chat-snippet-memory-drawer-trigger')
    ).toHaveTextContent('Recent captures (2)');

    fireEvent.click(screen.getByTestId('chat-snippet-memory-drawer-trigger'));

    expect(
      screen.getByTestId('chat-snippet-memory-drawer')
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('chat-snippet-memory-capture')).toHaveLength(
      2
    );
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

  it('copies a thread-level tone lock prompt anchored to the current exchange', async () => {
    renderPostCard();

    fireEvent.click(screen.getByTestId('chat-snippet-lock-tone-button'));

    expect(writeText).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        expect.stringContaining(
          "Lock current tone/style for Builder Bot's thread"
        )
      );
    });
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining(
        'Use the current exchange as the style anchor for the next reply.'
      )
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining(
        'Latest tone anchor: Done — PR is ready for review.'
      )
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining(
        'Replying to: Ship the fix and add a regression test.'
      )
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('/posts/post-1')
    );
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Tone lock copied' })
    );
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
      expect.stringContaining(
        'operator: Ship the fix and add a regression test.'
      )
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
        messages: [
          { role: 'agent', content: 'I can only continue from here.' },
        ],
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
      expect.stringContaining(
        'Stay fully in their voice, relationship, and point of view.'
      )
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
          blockedMessage:
            'Write an aggressive message that pressures them to reply right now.',
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
      expect.stringContaining(
        'The message below was blocked by a safety guardrail.'
      )
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
          {
            role: 'operator',
            content: 'Can you help me plan the deploy handoff?',
          },
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

    expect(
      screen.getByTestId('chat-snippet-low-context-rescue')
    ).toHaveTextContent('Memory rescue');
    expect(
      screen.getByTestId('chat-snippet-restate-key-facts-button')
    ).toHaveTextContent('Restate my key facts');
    expect(
      screen.getByTestId('chat-snippet-low-context-rescue')
    ).toHaveTextContent('Includes 1 remembered cue from this snippet.');
  });

  it('copies a restate-my-key-facts recovery prompt for low-context replies', async () => {
    renderPostCard({
      metadata: {
        ...basePost.metadata,
        lowContextReply: true,
        lowContextReason:
          'The agent asked for context instead of using saved memory.',
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

    fireEvent.click(
      screen.getByTestId('chat-snippet-restate-key-facts-button')
    );

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
      expect.stringContaining(
        'List the durable facts you remember in 3–5 bullets.'
      )
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining(
        'Operator prefers quiet-hours handoff after 8pm KST.'
      )
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

  it('surfaces an inline remember-this-instead recovery after a bad recall', () => {
    renderPostCard({
      metadata: {
        ...basePost.metadata,
        memory: {
          correction: {
            reason:
              'The agent reused an outdated preference instead of the latest handoff note.',
            incorrectFact: 'You prefer morning handoffs before 8am KST.',
            correctedFact: 'You prefer quiet-hours handoff after 8pm KST.',
          },
        },
      },
    });

    expect(
      screen.getByTestId('chat-snippet-bad-recall-recovery')
    ).toHaveTextContent('Wrong memory recovery');
    expect(
      screen.getByTestId('chat-snippet-bad-recall-recovery')
    ).toHaveTextContent(
      'The agent reused an outdated preference instead of the latest handoff note.'
    );
    expect(
      screen.getByTestId('chat-snippet-bad-recall-incorrect-fact')
    ).toHaveTextContent('You prefer morning handoffs before 8am KST.');
    expect(
      screen.getByTestId('chat-snippet-bad-recall-corrected-fact')
    ).toHaveTextContent('You prefer quiet-hours handoff after 8pm KST.');
    expect(
      screen.getByTestId('chat-snippet-remember-instead-button')
    ).toHaveTextContent('Remember this instead');
  });

  it('copies a remember-this-instead correction prompt with the wrong and corrected fact', async () => {
    renderPostCard({
      metadata: {
        ...basePost.metadata,
        wrongMemoryRecovery: {
          reason: 'Use the latest saved handoff preference before replying.',
          incorrectFact: 'You prefer morning handoffs before 8am KST.',
          correctedFact: 'You prefer quiet-hours handoff after 8pm KST.',
        },
      },
    });

    fireEvent.click(screen.getByTestId('chat-snippet-remember-instead-button'));

    expect(writeText).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        expect.stringContaining('Remember this instead for Builder Bot')
      );
    });
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('The latest reply recalled the wrong memory.')
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('You prefer morning handoffs before 8am KST.')
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('You prefer quiet-hours handoff after 8pm KST.')
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining(
        'Use the latest saved handoff preference before replying.'
      )
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('/posts/post-1')
    );
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Correction prompt copied' })
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
      screen.getByTestId('chat-snippet-lock-tone-button')
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
            {
              role: 'agent-planner',
              content: 'I drafted three rollout options.',
            },
            {
              role: 'agent-reviewer',
              content: 'Option two is safer for observers.',
            },
            {
              role: 'agent-planner',
              content: 'Great, I will publish that path.',
            },
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
