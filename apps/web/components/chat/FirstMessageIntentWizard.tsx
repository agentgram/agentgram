'use client';

import { useState } from 'react';

const TONE_CHIPS = [
  'Casual',
  'Supportive',
  'Playful',
  'Serious',
  'Creative',
] as const;

const TOPIC_CHIPS = [
  'Just chatting',
  'Roleplay',
  'Creative writing',
  'Study help',
  'Emotional support',
] as const;

type Tone = (typeof TONE_CHIPS)[number];
type Topic = (typeof TOPIC_CHIPS)[number];

interface FirstMessageIntentWizardProps {
  /** Whether this is the first message in the conversation. Shows wizard only when true. */
  isFirstMessage: boolean;
  /** Called when both steps complete; receives the pre-fill string to append to the composer. */
  onComplete: (prefill: string) => void;
  /** Called when the user skips the wizard entirely. */
  onDismiss: () => void;
}

/**
 * A 2-step "tone + topic" selector shown before the first message send on any
 * new conversation. Eliminates blank-start anxiety. Distinct from
 * StarterPromptStrip (PR #817) which appears after the conversation opens.
 *
 * Step 1 → choose a tone chip.
 * Step 2 → choose a topic chip.
 * After both selections the wizard calls onComplete with a short context string
 * that pre-fills the composer.
 */
export function FirstMessageIntentWizard({
  isFirstMessage,
  onComplete,
  onDismiss,
}: FirstMessageIntentWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTone, setSelectedTone] = useState<Tone | null>(null);

  if (!isFirstMessage) return null;

  function handleToneSelect(tone: Tone) {
    setSelectedTone(tone);
    setStep(2);
  }

  function handleTopicSelect(topic: Topic) {
    const prefill = `[${selectedTone} / ${topic}] `;
    onComplete(prefill);
  }

  return (
    <div
      className="mb-4 rounded-xl border border-primary/15 bg-primary/5 p-4"
      data-testid="first-message-intent-wizard"
      role="region"
      aria-label="Set conversation tone and topic"
    >
      {step === 1 && (
        <div data-testid="wizard-step-tone">
          <p className="mb-3 text-sm font-medium text-foreground">
            What tone are you in the mood for?
          </p>
          <div className="flex flex-wrap gap-2">
            {TONE_CHIPS.map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => handleToneSelect(tone)}
                data-testid={`tone-chip-${tone.toLowerCase()}`}
                className="inline-flex items-center rounded-full border border-primary/20 bg-background px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {tone}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onDismiss}
            data-testid="wizard-skip"
            className="mt-3 text-xs text-muted-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Skip
          </button>
        </div>
      )}

      {step === 2 && (
        <div data-testid="wizard-step-topic">
          <p className="mb-1 text-xs text-muted-foreground">
            Tone: <span className="font-semibold text-primary">{selectedTone}</span>
          </p>
          <p className="mb-3 text-sm font-medium text-foreground">
            What would you like to talk about?
          </p>
          <div className="flex flex-wrap gap-2">
            {TOPIC_CHIPS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => handleTopicSelect(topic)}
                data-testid={`topic-chip-${topic.toLowerCase().replace(/\s+/g, '-')}`}
                className="inline-flex items-center rounded-full border border-primary/20 bg-background px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {topic}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onDismiss}
            data-testid="wizard-skip"
            className="mt-3 text-xs text-muted-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
}
