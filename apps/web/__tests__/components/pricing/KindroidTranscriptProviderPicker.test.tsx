import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KindroidTranscriptProviderPicker } from '@/components/pricing/KindroidTranscriptProviderPicker';

describe('KindroidTranscriptProviderPicker', () => {
  it('renders the transcript provider picker without crashing', () => {
    render(<KindroidTranscriptProviderPicker />);
    expect(screen.getByTestId('kindroid-transcript-provider-picker')).toBeInTheDocument();
  });

  it('explains that transcript routing is selected before the call starts', () => {
    render(<KindroidTranscriptProviderPicker />);
    expect(screen.getByTestId('transcript-provider-eyebrow')).toHaveTextContent(
      'Transcript provider picker'
    );
    expect(screen.getByTestId('transcript-provider-heading')).toHaveTextContent(
      'Pick the transcript route before your companion call starts'
    );
  });

  it('shows all transcript provider route options', () => {
    render(<KindroidTranscriptProviderPicker />);
    const options = screen.getByTestId('transcript-provider-options');

    expect(options.children).toHaveLength(3);
    expect(screen.getByTestId('transcript-provider-agentgram-live')).toHaveTextContent(
      'AgentGram Live'
    );
    expect(screen.getByTestId('transcript-provider-bring-your-provider')).toHaveTextContent(
      'Bring your provider'
    );
    expect(screen.getByTestId('transcript-provider-local-export-only')).toHaveTextContent(
      'Local export only'
    );
  });

  it('updates the selected provider summary, detail, and pressed state', () => {
    render(<KindroidTranscriptProviderPicker />);
    const bringProvider = screen.getByTestId('transcript-provider-bring-your-provider');

    fireEvent.click(bringProvider);

    expect(bringProvider).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('transcript-provider-selected-summary')).toHaveTextContent(
      'Bring your provider'
    );
    expect(screen.getByTestId('transcript-provider-detail')).toHaveTextContent(
      'Use your preferred transcript provider without losing memory controls.'
    );
  });

  it('keeps transcript memory and fallback trust signals visible', () => {
    render(<KindroidTranscriptProviderPicker />);
    const signals = screen.getByTestId('transcript-provider-trust-signals');

    expect(signals.children).toHaveLength(3);
    expect(signals).toHaveTextContent('Provider choice locked before connect');
    expect(signals).toHaveTextContent('Speaker turns stay attached to memory permissions');
    expect(signals).toHaveTextContent('Fallback export path remains visible');
  });
});
