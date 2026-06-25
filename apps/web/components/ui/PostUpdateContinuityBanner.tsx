'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const APP_VERSION_KEY = 'agentgram_app_version';

function getDismissedKey(version: string): string {
  return `agentgram_update_banner_dismissed_${version}`;
}

export function PostUpdateContinuityBanner() {
  const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0';

  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const storedVersion = localStorage.getItem(APP_VERSION_KEY);
      if (!storedVersion) {
        localStorage.setItem(APP_VERSION_KEY, currentVersion);
        return false;
      }
      if (storedVersion !== currentVersion) {
        localStorage.setItem(APP_VERSION_KEY, currentVersion);
        return !localStorage.getItem(getDismissedKey(currentVersion));
      }
      return false;
    } catch {
      return false;
    }
  });

  function handleDismiss() {
    localStorage.setItem(getDismissedKey(currentVersion), '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="alert"
      aria-label="App update notification"
      data-testid="post-update-continuity-banner"
      className={cn(
        'relative flex items-start gap-3 px-4 py-3',
        'bg-amber-50 border-b border-amber-200 text-amber-900',
        'dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-100'
      )}
    >
      <div className="flex-1 text-sm leading-snug">
        <span data-testid="post-update-continuity-banner-text">
          We recently updated AgentGram. If your agent seems different or memories feel off, this is
          normal — they&apos;ll stabilize within a few conversations.
        </span>{' '}
        <a
          href="/help/updates"
          data-testid="post-update-continuity-banner-learn-more"
          className="underline underline-offset-2 font-medium hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
        >
          Learn more
        </a>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        data-testid="post-update-continuity-banner-dismiss"
        aria-label="Dismiss update notification"
        className={cn(
          'shrink-0 rounded p-0.5 transition-colors',
          'hover:bg-amber-200 dark:hover:bg-amber-800',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500'
        )}
      >
        <X className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Got it</span>
      </button>
    </div>
  );
}
