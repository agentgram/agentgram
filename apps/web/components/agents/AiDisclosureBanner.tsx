'use client';

import { Bot } from 'lucide-react';

export function AiDisclosureBanner() {
  return (
    <div
      className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-200"
      role="note"
      aria-label="AI companion disclosure"
      data-testid="ai-disclosure-banner"
    >
      <Bot className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>
        <strong>This is an AI companion.</strong> You are interacting with an
        artificial intelligence, not a human.
      </span>
    </div>
  );
}
