import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ChatRewindButton } from '../../components/chat/ChatRewindButton';
import { ChatRewindModal } from '../../components/chat/ChatRewindModal';
import type { ChatMessage } from '../../components/chat/ChatRewindButton';

const MESSAGES: ChatMessage[] = Array.from({ length: 12 }, (_, i) => ({
  id: `msg-${i}`,
  role: i % 2 === 0 ? 'user' : 'agent',
  content: `Message ${i}`,
  createdAt: new Date(Date.now() + i * 1000).toISOString(),
}));

function renderButton(
  overrides: Partial<React.ComponentProps<typeof ChatRewindButton>> = {}
) {
  const onMessagesChange = vi.fn();
  const onRewindComplete = vi.fn();
  return {
    onMessagesChange,
    onRewindComplete,
    ...render(
      <ChatRewindButton
        chatId="chat-abc"
        messages={MESSAGES}
        onMessagesChange={onMessagesChange}
        onRewindComplete={onRewindComplete}
        {...overrides}
      />
    ),
  };
}

describe('ChatRewindButton — rendering', () => {
  it('renders the rewind button', () => {
    renderButton();
    expect(screen.getByTestId('chat-rewind-button')).toBeInTheDocument();
  });

  it('button label contains Rewind text', () => {
    renderButton();
    expect(screen.getByTestId('chat-rewind-button')).toHaveTextContent('Rewind');
  });

  it('button is disabled when disabled prop is true', () => {
    renderButton({ disabled: true });
    expect(screen.getByTestId('chat-rewind-button')).toBeDisabled();
  });

  it('button is disabled when messages array is empty', () => {
    renderButton({ messages: [] });
    expect(screen.getByTestId('chat-rewind-button')).toBeDisabled();
  });

  it('button is enabled when messages exist and not disabled', () => {
    renderButton();
    expect(screen.getByTestId('chat-rewind-button')).not.toBeDisabled();
  });
});

describe('ChatRewindButton — modal interaction', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('modal is not visible before button click', () => {
    renderButton();
    expect(screen.queryByTestId('chat-rewind-modal')).not.toBeInTheDocument();
  });

  it('opens the confirmation modal when button is clicked', () => {
    renderButton();
    fireEvent.click(screen.getByTestId('chat-rewind-button'));
    expect(screen.getByTestId('chat-rewind-modal')).toBeInTheDocument();
  });

  it('modal description mentions the count of messages to be removed', () => {
    renderButton({ count: 10 });
    fireEvent.click(screen.getByTestId('chat-rewind-button'));
    expect(screen.getByTestId('chat-rewind-modal-description')).toHaveTextContent('10');
  });

  it('closes modal when cancel button is clicked', () => {
    renderButton();
    fireEvent.click(screen.getByTestId('chat-rewind-button'));
    expect(screen.getByTestId('chat-rewind-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('chat-rewind-modal-cancel'));
    expect(screen.queryByTestId('chat-rewind-modal')).not.toBeInTheDocument();
  });
});

describe('ChatRewindButton — rewind logic', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ removed: 10 }) });
  });

  it('calls onMessagesChange with last 10 messages removed on confirm', async () => {
    const { onMessagesChange } = renderButton({ count: 10 });
    fireEvent.click(screen.getByTestId('chat-rewind-button'));
    fireEvent.click(screen.getByTestId('chat-rewind-modal-confirm'));
    await waitFor(() => {
      expect(onMessagesChange).toHaveBeenCalledWith(MESSAGES.slice(0, 2));
    });
  });

  it('calls onRewindComplete with the removed count after successful rewind', async () => {
    const { onRewindComplete } = renderButton({ count: 10 });
    fireEvent.click(screen.getByTestId('chat-rewind-button'));
    fireEvent.click(screen.getByTestId('chat-rewind-modal-confirm'));
    await waitFor(() => {
      expect(onRewindComplete).toHaveBeenCalledWith(10);
    });
  });

  it('caps actualCount to messages.length when count exceeds available messages', async () => {
    const { onMessagesChange } = renderButton({
      messages: MESSAGES.slice(0, 5),
      count: 10,
    });
    fireEvent.click(screen.getByTestId('chat-rewind-button'));
    fireEvent.click(screen.getByTestId('chat-rewind-modal-confirm'));
    await waitFor(() => {
      expect(onMessagesChange).toHaveBeenCalledWith([]);
    });
  });

  it('restores original messages when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const { onMessagesChange } = renderButton({ count: 10 });
    fireEvent.click(screen.getByTestId('chat-rewind-button'));
    fireEvent.click(screen.getByTestId('chat-rewind-modal-confirm'));
    await waitFor(() => {
      // First call: optimistic update; second call: rollback
      expect(onMessagesChange).toHaveBeenCalledTimes(2);
      const rollbackCall = onMessagesChange.mock.calls[1][0];
      expect(rollbackCall).toEqual(MESSAGES);
    });
  });

  it('sends DELETE request to the correct API endpoint', async () => {
    renderButton({ chatId: 'chat-xyz', count: 10 });
    fireEvent.click(screen.getByTestId('chat-rewind-button'));
    fireEvent.click(screen.getByTestId('chat-rewind-modal-confirm'));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/chats/chat-xyz/messages?last=10',
        { method: 'DELETE' }
      );
    });
  });

  it('modal closes after successful confirm', async () => {
    renderButton({ count: 10 });
    fireEvent.click(screen.getByTestId('chat-rewind-button'));
    fireEvent.click(screen.getByTestId('chat-rewind-modal-confirm'));
    await waitFor(() => {
      expect(screen.queryByTestId('chat-rewind-modal')).not.toBeInTheDocument();
    });
  });
});

describe('ChatRewindModal — standalone', () => {
  it('renders the modal when isOpen is true', () => {
    render(
      <ChatRewindModal
        isOpen={true}
        count={10}
        isPending={false}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByTestId('chat-rewind-modal')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <ChatRewindModal
        isOpen={false}
        count={10}
        isPending={false}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.queryByTestId('chat-rewind-modal')).not.toBeInTheDocument();
  });

  it('shows pending state text on confirm button while pending', () => {
    render(
      <ChatRewindModal
        isOpen={true}
        count={10}
        isPending={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByTestId('chat-rewind-modal-confirm')).toHaveTextContent(
      '되감는 중...'
    );
  });

  it('disables both buttons while pending', () => {
    render(
      <ChatRewindModal
        isOpen={true}
        count={10}
        isPending={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByTestId('chat-rewind-modal-cancel')).toBeDisabled();
    expect(screen.getByTestId('chat-rewind-modal-confirm')).toBeDisabled();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <ChatRewindModal
        isOpen={true}
        count={10}
        isPending={false}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId('chat-rewind-modal-confirm'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(
      <ChatRewindModal
        isOpen={true}
        count={10}
        isPending={false}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByTestId('chat-rewind-modal-cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
