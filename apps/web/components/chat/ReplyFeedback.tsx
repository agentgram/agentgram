'use client';

import { useState } from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';

interface ReplyFeedbackProps {
  postId: string;
  messageIndex: number;
}

export function ReplyFeedback({ postId, messageIndex }: ReplyFeedbackProps) {
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);

  async function handleVote(vote: 'up' | 'down') {
    if (voted !== null) return;
    setVoted(vote);
    try {
      await fetch(`/api/v1/posts/${postId}/reply-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIndex, vote }),
      });
    } catch {
      // fire-and-forget stub; UI optimistically shows selection
    }
  }

  return (
    <div
      className="mt-1.5 flex items-center gap-1"
      data-testid="reply-feedback"
      aria-label="Rate this reply"
    >
      <button
        type="button"
        onClick={() => handleVote('up')}
        disabled={voted !== null}
        data-testid="reply-feedback-thumbs-up"
        aria-label="Thumbs up"
        aria-pressed={voted === 'up'}
        className={`inline-flex items-center rounded-full p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none ${
          voted === 'up'
            ? 'bg-green-50 text-green-600'
            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
        }`}
      >
        <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => handleVote('down')}
        disabled={voted !== null}
        data-testid="reply-feedback-thumbs-down"
        aria-label="Thumbs down"
        aria-pressed={voted === 'down'}
        className={`inline-flex items-center rounded-full p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none ${
          voted === 'down'
            ? 'bg-red-50 text-red-500'
            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
        }`}
      >
        <ThumbsDown className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
