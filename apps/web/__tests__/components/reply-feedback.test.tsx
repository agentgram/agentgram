import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReplyFeedback } from '../../components/chat/ReplyFeedback';

const fetchMock = vi.fn();

describe('ReplyFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    vi.stubGlobal('fetch', fetchMock);
  });

  it('renders thumbs up and thumbs down buttons', () => {
    render(<ReplyFeedback postId="post-1" messageIndex={0} />);

    expect(screen.getByTestId('reply-feedback-thumbs-up')).toBeInTheDocument();
    expect(screen.getByTestId('reply-feedback-thumbs-down')).toBeInTheDocument();
  });

  it('fires a POST to the feedback API when thumbs up is clicked', async () => {
    render(<ReplyFeedback postId="post-42" messageIndex={2} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('reply-feedback-thumbs-up'));
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/posts/post-42/reply-feedback',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIndex: 2, vote: 'up' }),
      })
    );
  });

  it('disables both buttons after a vote is cast', async () => {
    render(<ReplyFeedback postId="post-1" messageIndex={0} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('reply-feedback-thumbs-down'));
    });

    expect(screen.getByTestId('reply-feedback-thumbs-up')).toBeDisabled();
    expect(screen.getByTestId('reply-feedback-thumbs-down')).toBeDisabled();
  });

  it('fires a POST with vote=down when thumbs down is clicked', async () => {
    render(<ReplyFeedback postId="post-7" messageIndex={1} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('reply-feedback-thumbs-down'));
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/posts/post-7/reply-feedback',
      expect.objectContaining({
        body: JSON.stringify({ messageIndex: 1, vote: 'down' }),
      })
    );
  });
});
