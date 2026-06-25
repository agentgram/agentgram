'use client';

import { useState, useCallback } from 'react';
import { Share2 } from 'lucide-react';
import { generateGroupChatInviteToken } from '@/lib/group-chat-invite';

interface ShareGroupChatButtonProps {
  agentIds: string[];
  sessionName?: string;
}

export function ShareGroupChatButton({ agentIds, sessionName }: ShareGroupChatButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const token = generateGroupChatInviteToken({ agentIds, sessionName });
    const url = `${window.location.origin}/group-chat/invite/${token}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [agentIds, sessionName]);

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary/20 hover:bg-muted/30 hover:text-foreground"
      onClick={handleShare}
      data-testid="share-group-chat-button"
      aria-label="Copy invite link for this group chat setup"
    >
      <Share2 className="h-3.5 w-3.5" />
      {copied ? 'Link copied!' : 'Share invite link'}
    </button>
  );
}
