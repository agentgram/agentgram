import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { FirstMessageIntentWizard } from '../../components/chat/FirstMessageIntentWizard';

describe('FirstMessageIntentWizard', () => {
  const onComplete = vi.fn();
  const onDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isFirstMessage is false', () => {
    const { container } = render(
      <FirstMessageIntentWizard
        isFirstMessage={false}
        onComplete={onComplete}
        onDismiss={onDismiss}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders step 1 tone chips when isFirstMessage is true', () => {
    render(
      <FirstMessageIntentWizard
        isFirstMessage={true}
        onComplete={onComplete}
        onDismiss={onDismiss}
      />
    );
    expect(screen.getByTestId('first-message-intent-wizard')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-step-tone')).toBeInTheDocument();
    expect(screen.getByTestId('tone-chip-casual')).toBeInTheDocument();
    expect(screen.getByTestId('tone-chip-supportive')).toBeInTheDocument();
    expect(screen.getByTestId('tone-chip-playful')).toBeInTheDocument();
    expect(screen.getByTestId('tone-chip-serious')).toBeInTheDocument();
    expect(screen.getByTestId('tone-chip-creative')).toBeInTheDocument();
  });

  it('advances to step 2 with topic chips after selecting a tone', () => {
    render(
      <FirstMessageIntentWizard
        isFirstMessage={true}
        onComplete={onComplete}
        onDismiss={onDismiss}
      />
    );
    fireEvent.click(screen.getByTestId('tone-chip-casual'));
    expect(screen.getByTestId('wizard-step-topic')).toBeInTheDocument();
    expect(screen.getByTestId('topic-chip-just-chatting')).toBeInTheDocument();
    expect(screen.getByTestId('topic-chip-roleplay')).toBeInTheDocument();
    expect(screen.getByTestId('topic-chip-creative-writing')).toBeInTheDocument();
    expect(screen.getByTestId('topic-chip-study-help')).toBeInTheDocument();
    expect(screen.getByTestId('topic-chip-emotional-support')).toBeInTheDocument();
  });

  it('displays selected tone label in step 2', () => {
    render(
      <FirstMessageIntentWizard
        isFirstMessage={true}
        onComplete={onComplete}
        onDismiss={onDismiss}
      />
    );
    fireEvent.click(screen.getByTestId('tone-chip-supportive'));
    expect(screen.getByTestId('wizard-step-topic')).toHaveTextContent('Supportive');
  });

  it('calls onComplete with prefill string after tone + topic selection', () => {
    render(
      <FirstMessageIntentWizard
        isFirstMessage={true}
        onComplete={onComplete}
        onDismiss={onDismiss}
      />
    );
    fireEvent.click(screen.getByTestId('tone-chip-playful'));
    fireEvent.click(screen.getByTestId('topic-chip-roleplay'));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('[Playful / Roleplay] ');
  });

  it('calls onDismiss when skip is clicked on step 1', () => {
    render(
      <FirstMessageIntentWizard
        isFirstMessage={true}
        onComplete={onComplete}
        onDismiss={onDismiss}
      />
    );
    fireEvent.click(screen.getByTestId('wizard-skip'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('calls onDismiss when skip is clicked on step 2', () => {
    render(
      <FirstMessageIntentWizard
        isFirstMessage={true}
        onComplete={onComplete}
        onDismiss={onDismiss}
      />
    );
    fireEvent.click(screen.getByTestId('tone-chip-serious'));
    fireEvent.click(screen.getByTestId('wizard-skip'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();
  });
});
