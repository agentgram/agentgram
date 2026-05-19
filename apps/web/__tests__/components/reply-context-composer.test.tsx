import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReplyContextComposer } from '../../components/posts/ReplyContextComposer';

const toast = vi.fn();
const mutateAsync = vi.fn();
const writeText = vi.fn();
const fetchMock = vi.fn();

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast,
  }),
}));

vi.mock('@/hooks/use-comments', () => ({
  useCreateComment: () => ({
    mutateAsync,
    isPending: false,
  }),
}));

const source = {
  postType: 'chat_snippet' as const,
  title: 'Pair-programming transcript',
  content: 'A short exchange about debugging a failing deploy.',
  authorName: 'Builder Bot',
  messages: [
    { role: 'agent', content: 'I found the failing environment variable.' },
    { role: 'operator', content: 'Ship the fix and add a regression test.' },
  ],
};

describe('ReplyContextComposer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutateAsync.mockResolvedValue({ id: 'comment-1' });
    writeText.mockResolvedValue(undefined);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          mode: 'imagine_scene',
          sourceType: 'chat_snippet',
          prompt:
            'Create a cinematic editorial illustration inspired by this AgentGram chat snippet.',
          suggestedReply:
            'Imagine this scene from the thread: Pair-programming transcript',
          suggestedImageAlt:
            'Illustrated chat moment showing pair-programming transcript.',
          sourceExcerpt:
            'agent: I found the failing environment variable. operator: Ship the fix and add a regression test.',
          handoffText:
            'Imagine this scene\n\nPrompt: Create a cinematic editorial illustration inspired by this AgentGram chat snippet.',
          styleHints: {
            aspectRatio: '4:5',
            finish: 'cinematic editorial illustration',
            avoid: ['ui chrome', 'text overlays'],
          },
        },
      }),
    });
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  it('renders the pre-send preview for optional link, photo, and voice note context', () => {
    render(<ReplyContextComposer postId="post-1" source={source} />);

    fireEvent.change(screen.getByTestId('reply-context-content'), {
      target: { value: 'Here is the extra context I used.' },
    });
    fireEvent.change(screen.getByTestId('reply-context-url'), {
      target: { value: 'https://example.com/teardown' },
    });
    fireEvent.change(screen.getByTestId('reply-context-image-url'), {
      target: { value: 'https://images.example.com/teardown.png' },
    });
    fireEvent.change(screen.getByTestId('reply-context-voice-note-url'), {
      target: { value: 'https://audio.example.com/teardown-note.mp3' },
    });

    expect(screen.getByTestId('reply-context-preview')).toHaveTextContent(
      'Here is the extra context I used.'
    );
    expect(screen.getByTestId('reply-context-preview-link')).toHaveTextContent(
      'example.com'
    );
    expect(screen.getByTestId('reply-context-preview-image')).toHaveAttribute(
      'src',
      'https://images.example.com/teardown.png'
    );
    expect(
      screen.getByTestId('reply-context-preview-voice-note')
    ).toHaveAttribute('src', 'https://audio.example.com/teardown-note.mp3');
  });

  it('builds an imagine-scene handoff, copies it, and lets the user reuse the suggested reply', async () => {
    render(<ReplyContextComposer postId="post-1" source={source} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('reply-context-imagine-scene-button'));
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/reply-composer/imagine-scene',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(String(requestInit.body))).toMatchObject({
      title: 'Pair-programming transcript',
      authorName: 'Builder Bot',
      sourceUrl: expect.stringContaining('/posts/post-1'),
    });
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('Imagine this scene')
    );
    expect(
      screen.getByTestId('reply-context-imagine-scene-preview')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('reply-context-imagine-scene-prompt')
    ).toHaveTextContent('Create a cinematic editorial illustration');
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Imagine prompt copied' })
    );

    fireEvent.click(screen.getByTestId('reply-context-imagine-scene-use-reply'));

    expect(screen.getByTestId('reply-context-content')).toHaveValue(
      'Imagine this scene from the thread: Pair-programming transcript'
    );
  });

  it('submits the reply with API key and optional context fields', async () => {
    render(<ReplyContextComposer postId="post-99" source={source} />);

    fireEvent.change(screen.getByTestId('reply-context-api-key'), {
      target: { value: 'ag_live_test' },
    });
    fireEvent.change(screen.getByTestId('reply-context-content'), {
      target: { value: 'A focused reply.' },
    });
    fireEvent.change(screen.getByTestId('reply-context-url'), {
      target: { value: 'https://example.com/reference' },
    });
    fireEvent.change(screen.getByTestId('reply-context-voice-note-url'), {
      target: { value: 'https://audio.example.com/context-note.mp3' },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('reply-context-submit'));
    });

    await vi.waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        apiKey: 'ag_live_test',
        content: 'A focused reply.',
        contextUrl: 'https://example.com/reference',
        contextImageUrl: undefined,
        contextVoiceNoteUrl: 'https://audio.example.com/context-note.mp3',
      });
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Reply posted' })
    );
  });
});
