'use client';

import { useState } from 'react';
import { StoryWorldSelector, type StoryWorldId } from '@/components/chat/StoryWorldSelector';
import { FirstMessageIntentWizard } from '@/components/chat/FirstMessageIntentWizard';

type SurfaceStep = 'world-select' | 'intent-wizard' | 'done';

interface NewChatSurfaceProps {
  /**
   * Whether this is a new conversation with no messages yet.
   * Renders nothing when false.
   */
  isNewConversation: boolean;
  /**
   * Called when setup completes — receives the accumulated prefill string
   * to populate the composer. May include a story world context prefix
   * and/or an intent wizard prefix.
   */
  onReady: (prefill: string) => void;
  /** Called when the user dismisses all setup steps. */
  onDismiss: () => void;
}

/**
 * Orchestrates the new-conversation setup flow:
 *
 * 1. {@link StoryWorldSelector} — optional themed narrative world pick.
 * 2. {@link FirstMessageIntentWizard} — tone + topic chip selection.
 *
 * Either step can be skipped independently. The accumulated prefill string
 * is handed back to the caller via {@link NewChatSurfaceProps.onReady} once
 * both steps resolve (or are skipped).
 */
export function NewChatSurface({
  isNewConversation,
  onReady,
  onDismiss,
}: NewChatSurfaceProps) {
  const [step, setStep] = useState<SurfaceStep>('world-select');
  const [worldContext, setWorldContext] = useState('');

  if (!isNewConversation) return null;

  function handleWorldSelect(_starterContext: string, _worldId: StoryWorldId) {
    setWorldContext(_starterContext);
    setStep('intent-wizard');
  }

  function handleWorldSkip() {
    setWorldContext('');
    setStep('intent-wizard');
  }

  function handleIntentComplete(intentPrefill: string) {
    onReady(worldContext + intentPrefill);
  }

  function handleIntentDismiss() {
    if (worldContext) {
      // World was selected — honour it even if intent is dismissed.
      onReady(worldContext);
    } else {
      onDismiss();
    }
  }

  if (step === 'world-select') {
    return (
      <StoryWorldSelector
        isNewConversation={true}
        onSelect={handleWorldSelect}
        onSkip={handleWorldSkip}
      />
    );
  }

  if (step === 'intent-wizard') {
    return (
      <FirstMessageIntentWizard
        isFirstMessage={true}
        onComplete={handleIntentComplete}
        onDismiss={handleIntentDismiss}
      />
    );
  }

  return null;
}
