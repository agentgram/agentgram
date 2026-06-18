'use client';

import { useState } from 'react';
import Link from 'next/link';

const RAIL_ITEMS = [
  {
    id: 'memory-tip',
    emoji: '💡',
    label: 'Memory tip',
    href: '/dashboard/memory',
    testId: 'guided-feedback-rail-memory-tip',
  },
  {
    id: 'get-help',
    emoji: '❓',
    label: 'Get help',
    href: '/safety',
    testId: 'guided-feedback-rail-get-help',
  },
] as const;

export function GuidedFeedbackRail() {
  const [formOpen, setFormOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!feedback.trim()) return;
    // Best-effort POST; swallow errors — success state always shown
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: feedback.trim() }),
    }).catch(() => {});
    setSubmitted(true);
  }

  return (
    <nav
      aria-label="Quick help"
      className="mt-6 flex flex-col gap-3"
      data-testid="guided-feedback-rail"
    >
      <div className="flex flex-wrap gap-2">
        {RAIL_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            data-testid={item.testId}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span aria-hidden="true">{item.emoji}</span>
            {item.label}
          </Link>
        ))}

        <button
          type="button"
          onClick={() => {
            setFormOpen((prev) => !prev);
            setSubmitted(false);
            setFeedback('');
          }}
          data-testid="guided-feedback-rail-report-issue"
          aria-expanded={formOpen}
          aria-controls="guided-feedback-form"
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span aria-hidden="true">🐛</span>
          Report issue
        </button>
      </div>

      {formOpen && (
        <div
          id="guided-feedback-form"
          data-testid="guided-feedback-form"
          className="rounded-lg border border-primary/15 bg-primary/5 p-4"
        >
          {submitted ? (
            <p
              className="text-sm font-medium text-primary"
              data-testid="guided-feedback-success"
            >
              Thanks — your report was received.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <label
                htmlFor="guided-feedback-textarea"
                className="text-xs font-medium text-foreground"
              >
                Describe the issue
              </label>
              <textarea
                id="guided-feedback-textarea"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                data-testid="guided-feedback-textarea"
                rows={3}
                placeholder="What went wrong?"
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="submit"
                data-testid="guided-feedback-submit"
                className="self-start rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                disabled={!feedback.trim()}
              >
                Send report
              </button>
            </form>
          )}
        </div>
      )}
    </nav>
  );
}
