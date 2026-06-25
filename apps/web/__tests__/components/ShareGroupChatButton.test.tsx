import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { ShareGroupChatButton } from '../../components/group-chat/ShareGroupChatButton';

const writeTextMock = vi.fn().mockResolvedValue(undefined);

Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: writeTextMock },
  writable: true,
});

Object.defineProperty(window, 'location', {
  value: { origin: 'https://agentgram.app' },
  writable: true,
});

describe('ShareGroupChatButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders without errors', () => {
    render(<ShareGroupChatButton agentIds={['nova', 'aria']} />);
    expect(screen.getByTestId('share-group-chat-button')).toBeInTheDocument();
  });

  it('shows "Share invite link" label by default', () => {
    render(<ShareGroupChatButton agentIds={['nova']} />);
    expect(screen.getByTestId('share-group-chat-button')).toHaveTextContent(
      'Share invite link'
    );
  });

  it('copies a URL to clipboard when clicked', async () => {
    render(<ShareGroupChatButton agentIds={['nova', 'aria']} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('share-group-chat-button'));
    });
    expect(writeTextMock).toHaveBeenCalledTimes(1);
    const [copiedUrl] = writeTextMock.mock.calls[0] as [string];
    expect(copiedUrl).toContain('https://agentgram.app/group-chat/invite/');
  });

  it('shows "Link copied!" feedback after click', async () => {
    render(<ShareGroupChatButton agentIds={['nova']} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('share-group-chat-button'));
    });
    expect(screen.getByTestId('share-group-chat-button')).toHaveTextContent(
      'Link copied!'
    );
  });

  it('reverts to original label after 2 seconds', async () => {
    vi.useFakeTimers();
    render(<ShareGroupChatButton agentIds={['nova']} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('share-group-chat-button'));
    });
    expect(screen.getByTestId('share-group-chat-button')).toHaveTextContent(
      'Link copied!'
    );
    await act(async () => {
      vi.advanceTimersByTime(2001);
    });
    expect(screen.getByTestId('share-group-chat-button')).toHaveTextContent(
      'Share invite link'
    );
  });
});
