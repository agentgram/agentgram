import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReplikaVoiceCallPreflightCard } from '@/components/pricing/ReplikaVoiceCallPreflightCard';

describe('ReplikaVoiceCallPreflightCard', () => {
  it('renders the voice-call preflight card without crashing', () => {
    render(<ReplikaVoiceCallPreflightCard />);
    expect(screen.getByTestId('replika-voice-call-preflight-card')).toBeInTheDocument();
  });

  it('explains that call quality is visible before starting a call', () => {
    render(<ReplikaVoiceCallPreflightCard />);
    expect(screen.getByTestId('voice-preflight-eyebrow')).toHaveTextContent('Voice-call preflight');
    expect(screen.getByTestId('voice-preflight-heading')).toHaveTextContent(
      'Know call quality before you start talking'
    );
  });

  it('shows call quality, latency, and voice mode as preflight signals', () => {
    render(<ReplikaVoiceCallPreflightCard />);
    const card = screen.getByTestId('replika-voice-call-preflight-card');

    expect(screen.getByTestId('voice-preflight-quality')).toHaveTextContent('Call quality');
    expect(screen.getByTestId('voice-preflight-latency')).toHaveTextContent('Latency');
    expect(screen.getByTestId('voice-preflight-mode')).toHaveTextContent('Voice mode');
    expect(card).toHaveTextContent('before connecting');
  });

  it('renders all three preflight signal cards', () => {
    render(<ReplikaVoiceCallPreflightCard />);
    expect(screen.getByTestId('voice-preflight-signals').children).toHaveLength(3);
  });
});
