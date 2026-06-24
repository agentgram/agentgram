'use client';

import { useSyncExternalStore, useState } from 'react';
import { BookOpen, Pin, Infinity, ArrowRight, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'agentgram:memory-explainer-seen';
const CHANGE_EVENT = 'agentgram:memory-explainer-change';

function subscribe(cb: () => void) {
  window.addEventListener(CHANGE_EVENT, cb);
  return () => window.removeEventListener(CHANGE_EVENT, cb);
}

function getSnapshot(): boolean {
  try {
    return !localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

function dismiss() {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // ignore
  }
}

const STEPS = [
  {
    id: 'story-memory',
    icon: BookOpen,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
    title: 'Story Memory',
    description:
      "Every conversation is automatically saved as part of your ongoing story. Your agent remembers what you've discussed, so you never have to repeat yourself.",
    bullets: [
      'Context carries across all sessions',
      'Your agent picks up right where you left off',
      'No manual logging required',
    ],
  },
  {
    id: 'key-facts',
    icon: Pin,
    iconColor: 'text-violet-500',
    iconBg: 'bg-violet-500/10',
    title: 'Key Facts',
    description:
      'Pin the details that matter most — your name, preferences, important events. These facts are always in reach, even in long conversations.',
    bullets: [
      'You choose what gets pinned',
      'Pinned facts survive session resets',
      'Edit or remove facts any time',
    ],
  },
  {
    id: 'memory-usage',
    icon: Infinity,
    iconColor: 'text-green-500',
    iconBg: 'bg-green-500/10',
    title: 'Memory Usage — Unlimited',
    description:
      'On Character.AI, persistent memory sits behind a c.ai+ paywall. On AgentGram, it\'s free for everyone. No caps, no upgrade prompts, no hidden limits.',
    bullets: [
      'Unlimited pinned facts (no c.ai+ required)',
      'Full story memory with no storage cap',
      'Available on every plan, always',
    ],
  },
] as const;

export default function MemoryFirstRunExplainer() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const [step, setStep] = useState(0);

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const Icon = current.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="memory-explainer-title"
      data-testid="memory-first-run-explainer"
    >
      <div className="relative w-full max-w-md rounded-2xl border bg-card shadow-2xl p-8">
        <button
          onClick={dismiss}
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Dismiss"
          data-testid="memory-explainer-dismiss"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Step indicator */}
        <div className="mb-6 flex justify-center gap-2" aria-label="Step indicator" data-testid="memory-explainer-steps">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              data-testid={`memory-explainer-step-dot-${i}`}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-6 bg-brand' : 'w-1.5 bg-muted-foreground/30'
              }`}
              aria-current={i === step ? 'step' : undefined}
            />
          ))}
        </div>

        {/* Icon */}
        <div
          className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full ${current.iconBg}`}
          data-testid="memory-explainer-icon"
        >
          <Icon className={`h-7 w-7 ${current.iconColor}`} aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="text-center" data-testid={`memory-explainer-step-${current.id}`}>
          <h2
            id="memory-explainer-title"
            className="text-xl font-bold tracking-tight"
            data-testid="memory-explainer-title"
          >
            {current.title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground" data-testid="memory-explainer-description">
            {current.description}
          </p>

          <ul className="mt-4 space-y-2 text-left" data-testid="memory-explainer-bullets">
            {current.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2">
                <CheckCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-green-500"
                  aria-hidden="true"
                />
                <span className="text-sm">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep((s) => s - 1)}
              data-testid="memory-explainer-back"
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {isLast ? (
            <Button
              size="sm"
              className="gap-1.5 bg-brand text-white hover:bg-brand-accent"
              onClick={dismiss}
              data-testid="memory-explainer-cta"
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => setStep((s) => s + 1)}
              data-testid="memory-explainer-next"
            >
              Next
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Step {step + 1} of {STEPS.length}
          {' · '}
          <button
            onClick={dismiss}
            className="underline underline-offset-2 hover:text-foreground"
            data-testid="memory-explainer-skip"
          >
            Skip
          </button>
        </p>
      </div>
    </div>
  );
}
