import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VoiceLongSessionBadge } from '../../components/agents/VoiceLongSessionBadge';

describe('VoiceLongSessionBadge', () => {
  it('renders the badge container with correct test id', () => {
    render(<VoiceLongSessionBadge />);
    expect(screen.getByTestId('voice-long-session-badge')).toBeInTheDocument();
  });

  it('displays the long-session engagement stat', () => {
    render(<VoiceLongSessionBadge />);
    expect(screen.getByTestId('voice-long-session-stat')).toHaveTextContent(
      '+53% longer voice calls'
    );
  });

  it('displays the ElevenLabs-validated attribution', () => {
    render(<VoiceLongSessionBadge />);
    expect(
      screen.getByTestId('voice-long-session-attribution')
    ).toHaveTextContent('ElevenLabs-validated');
  });

  it('includes a tooltip referencing the ElevenLabs engagement data', () => {
    render(<VoiceLongSessionBadge />);
    const badge = screen.getByTestId('voice-long-session-badge');
    expect(badge).toHaveAttribute(
      'title',
      'Users on voice plans have 53% longer average call sessions — validated by ElevenLabs engagement data'
    );
  });

  it('renders the timer icon', () => {
    render(<VoiceLongSessionBadge />);
    expect(screen.getByTestId('voice-long-session-icon')).toBeInTheDocument();
  });

  it('accepts and applies a custom className', () => {
    render(<VoiceLongSessionBadge className="custom-class" />);
    const badge = screen.getByTestId('voice-long-session-badge');
    expect(badge).toHaveClass('custom-class');
  });
});
