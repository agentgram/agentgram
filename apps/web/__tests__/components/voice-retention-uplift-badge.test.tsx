import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VoiceRetentionUpliftBadge } from '../../components/agents/VoiceRetentionUpliftBadge';

describe('VoiceRetentionUpliftBadge', () => {
  it('renders the badge container with correct test id', () => {
    render(<VoiceRetentionUpliftBadge />);
    expect(
      screen.getByTestId('voice-retention-uplift-badge')
    ).toBeInTheDocument();
  });

  it('displays the +20% 7-day retention stat', () => {
    render(<VoiceRetentionUpliftBadge />);
    expect(
      screen.getByTestId('voice-retention-uplift-stat')
    ).toHaveTextContent('+20% 7-day retention');
  });

  it('displays the ElevenLabs attribution', () => {
    render(<VoiceRetentionUpliftBadge />);
    expect(
      screen.getByTestId('voice-retention-uplift-attribution')
    ).toHaveTextContent('Powered by ElevenLabs');
  });

  it('includes a tooltip with the full retention stat description', () => {
    render(<VoiceRetentionUpliftBadge />);
    const badge = screen.getByTestId('voice-retention-uplift-badge');
    expect(badge).toHaveAttribute(
      'title',
      'Users with voice-enabled agents return 20% more often in the first week'
    );
  });
});
