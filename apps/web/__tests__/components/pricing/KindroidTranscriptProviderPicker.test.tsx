import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KindroidTranscriptProviderPicker } from '@/components/pricing/KindroidTranscriptProviderPicker';

describe('KindroidTranscriptProviderPicker', () => {
  it('renders the transcript provider picker without crashing', () => {
    render(<KindroidTranscriptProviderPicker />);
    expect(screen.getByTestId('kindroid-transcript-provider-picker')).toBeInTheDocument();
  });

  it('explains that transcript provider choice happens before the call starts', () => {
    render(<KindroidTranscriptProviderPicker />);
    expect(screen.getByTestId('kindroid-transcript-picker-eyebrow')).toHaveTextContent(
      'Kindroid call transcript control'
    );
    expect(screen.getByTestId('kindroid-transcript-picker-heading')).toHaveTextContent(
      'Pick the transcript provider before the call starts'
    );
  });

  it('shows all three transcript provider routes', () => {
    render(<KindroidTranscriptProviderPicker />);

    expect(screen.getByTestId('kindroid-transcript-provider-agentgram')).toHaveTextContent(
      'AgentGram Live'
    );
    expect(screen.getByTestId('kindroid-transcript-provider-byop')).toHaveTextContent(
      'Bring your provider'
    );
    expect(screen.getByTestId('kindroid-transcript-provider-local')).toHaveTextContent(
      'Local export only'
    );
    expect(screen.getByTestId('kindroid-transcript-provider-options').children).toHaveLength(3);
  });

  it('updates the selected provider detail when a provider is picked', () => {
    render(<KindroidTranscriptProviderPicker />);

    fireEvent.click(screen.getByTestId('kindroid-transcript-provider-byop'));

    expect(screen.getByTestId('kindroid-transcript-picker-selected-summary')).toHaveTextContent(
      'Bring your provider'
    );
    expect(screen.getByTestId('kindroid-transcript-provider-detail')).toHaveTextContent(
      'vendor-specific transcription stack'
    );
    expect(screen.getByTestId('kindroid-transcript-provider-byop')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('keeps transcript trust signals visible', () => {
    render(<KindroidTranscriptProviderPicker />);
    const trustSignals = screen.getByTestId('kindroid-transcript-trust-signals');

    expect(trustSignals.children).toHaveLength(3);
    expect(trustSignals).toHaveTextContent('Provider choice is visible before joining a call');
    expect(trustSignals).toHaveTextContent('memory review controls');
    expect(trustSignals).toHaveTextContent('Fallback mode keeps notes exportable');
  });
});
