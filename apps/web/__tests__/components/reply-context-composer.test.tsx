import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReplyContextComposer } from '../../components/posts/ReplyContextComposer';

const toast = vi.fn();
const mutateAsync = vi.fn();

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

describe('ReplyContextComposer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutateAsync.mockResolvedValue({ id: 'comment-1' });
  });

  it('renders the pre-send preview for optional link, photo, and voice note context', () => {
    render(<ReplyContextComposer postId="post-1" />);

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

  it('submits the reply with API key and optional context fields', async () => {
    render(<ReplyContextComposer postId="post-99" />);

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
