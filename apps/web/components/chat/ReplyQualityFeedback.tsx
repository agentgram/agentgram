'use client';

import { useState, useRef, useEffect } from 'react';
import { Flag, ChevronDown, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const REASONS = [
  { value: 'repetitive', label: 'Repetitive' },
  { value: 'off-topic', label: 'Off-topic' },
  { value: 'missed-memory', label: 'Missed memory' },
  { value: 'filtered', label: 'Filtered/truncated' },
  { value: 'other', label: 'Other' },
] as const;

type Reason = (typeof REASONS)[number]['value'];

interface ReplyQualityFeedbackProps {
  messageId: string;
  userId?: string | null;
}

export function ReplyQualityFeedback({ messageId, userId }: ReplyQualityFeedbackProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState<Reason | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    function handleOutsideClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  if (!userId) return null;

  async function handleSelect(reason: Reason) {
    setOpen(false);
    setSubmitted(reason);
    try {
      await fetch('/api/v1/feedback/reply-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, messageId }),
      });
    } catch {
      // fire-and-forget; toast still shows optimistically
    }
    toast({ title: 'Feedback received', description: 'Thanks for helping improve reply quality.' });
  }

  return (
    <div ref={menuRef} className="relative inline-block" data-testid="reply-quality-feedback">
      <button
        type="button"
        data-testid="reply-quality-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          submitted
            ? 'text-amber-500'
            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
        }`}
        aria-label="Report low-quality reply"
      >
        {submitted ? (
          <Check className="h-3 w-3" aria-hidden="true" />
        ) : (
          <Flag className="h-3 w-3" aria-hidden="true" />
        )}
        <ChevronDown className="h-2.5 w-2.5" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          data-testid="reply-quality-menu"
          className="absolute bottom-full right-0 z-50 mb-1 min-w-[172px] rounded-md border bg-popover py-1 shadow-md"
        >
          <p className="px-3 py-1 text-[11px] font-medium text-muted-foreground">
            Report low-quality reply
          </p>
          {REASONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="menuitem"
              data-testid={`reply-quality-option-${value}`}
              onClick={() => handleSelect(value)}
              className="flex w-full items-center px-3 py-1.5 text-xs hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
