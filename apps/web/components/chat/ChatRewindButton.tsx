'use client';

import { useState, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatRewindModal } from './ChatRewindModal';

export interface ChatMessage {
  id: string;
  role: string;
  content: string;
  createdAt?: string;
}

export interface ChatRewindButtonProps {
  chatId: string;
  messages: ChatMessage[];
  count?: number;
  disabled?: boolean;
  onMessagesChange: (updated: ChatMessage[]) => void;
  onRewindComplete?: (removed: number) => void;
}

async function deleteLastMessages(chatId: string, count: number): Promise<void> {
  const res = await fetch(
    `/api/v1/chats/${encodeURIComponent(chatId)}/messages?last=${count}`,
    { method: 'DELETE' }
  );
  if (!res.ok) {
    throw new Error(`Rewind failed: ${res.status}`);
  }
}

export function ChatRewindButton({
  chatId,
  messages,
  count = 10,
  disabled = false,
  onMessagesChange,
  onRewindComplete,
}: ChatRewindButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const actualCount = Math.min(count, messages.length);
  const canRewind = messages.length > 0 && !disabled;

  const handleConfirm = useCallback(async () => {
    setIsPending(true);
    try {
      const updated = messages.slice(0, messages.length - actualCount);
      // Optimistically update local state first, then sync to server.
      onMessagesChange(updated);
      await deleteLastMessages(chatId, actualCount);
      onRewindComplete?.(actualCount);
    } catch {
      // Restore original messages on server error.
      onMessagesChange(messages);
    } finally {
      setIsPending(false);
      setModalOpen(false);
    }
  }, [chatId, messages, actualCount, onMessagesChange, onRewindComplete]);

  const handleCancel = useCallback(() => {
    setModalOpen(false);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={!canRewind || isPending}
        onClick={() => setModalOpen(true)}
        data-testid="chat-rewind-button"
        aria-label={`마지막 ${actualCount}개 메시지 되감기`}
      >
        <RotateCcw className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
        ↩ Rewind
      </Button>

      <ChatRewindModal
        isOpen={modalOpen}
        count={actualCount}
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}

export default ChatRewindButton;
