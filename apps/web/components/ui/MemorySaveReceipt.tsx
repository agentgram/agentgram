'use client';

import { useEffect, useRef } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MemorySaveReceiptProps {
  savedFact: string;
  usedBy: string;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export function MemorySaveReceipt({
  savedFact,
  usedBy,
  onDismiss,
  autoDismissMs = 4000,
}: MemorySaveReceiptProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, autoDismissMs);
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [onDismiss, autoDismissMs]);

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="memory-save-receipt"
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-lg shadow-md',
        'bg-green-50 border border-green-200 text-green-900',
        'dark:bg-green-950/40 dark:border-green-800 dark:text-green-100',
        'animate-in slide-in-from-bottom-2 fade-in duration-300'
      )}
    >
      <CheckCircle2
        className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5"
        aria-hidden="true"
      />

      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold leading-snug"
          data-testid="memory-save-receipt-heading"
        >
          Memory saved
        </p>
        <p
          className="text-sm text-green-800 dark:text-green-200 mt-0.5 truncate"
          data-testid="memory-save-receipt-fact"
        >
          {savedFact}
        </p>
        <p
          className="text-xs text-green-700/70 dark:text-green-300/70 mt-1"
          data-testid="memory-save-receipt-used-by"
        >
          Used by: {usedBy}
        </p>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        data-testid="memory-save-receipt-dismiss"
        aria-label="Dismiss memory save confirmation"
        className={cn(
          'shrink-0 rounded p-0.5 transition-colors',
          'hover:bg-green-200 dark:hover:bg-green-800',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500'
        )}
      >
        <X className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Dismiss</span>
      </button>
    </div>
  );
}
