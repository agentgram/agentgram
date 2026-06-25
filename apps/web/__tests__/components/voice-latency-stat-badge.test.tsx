import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VoiceLatencyStatBadge } from '../../components/agents/VoiceLatencyStatBadge';

describe('VoiceLatencyStatBadge', () => {
  it('renders the badge container with correct test id', () => {
    render(<VoiceLatencyStatBadge />);
    expect(screen.getByTestId('voice-latency-stat-badge')).toBeInTheDocument();
  });

  it('displays the sub-2s latency stat', () => {
    render(<VoiceLatencyStatBadge />);
    expect(screen.getByTestId('voice-latency-stat-value')).toHaveTextContent(
      '< 2s voice response'
    );
  });

  it('displays the Nomi V3 parity attribution', () => {
    render(<VoiceLatencyStatBadge />);
    expect(
      screen.getByTestId('voice-latency-stat-attribution')
    ).toHaveTextContent('Nomi V3 parity');
  });

  it('includes a tooltip referencing the Nomi V3 benchmark', () => {
    render(<VoiceLatencyStatBadge />);
    const badge = screen.getByTestId('voice-latency-stat-badge');
    expect(badge).toHaveAttribute(
      'title',
      "Voice responses under 2 seconds — matches Nomi V3's 1–1.5s benchmark"
    );
  });

  it('renders the zap icon', () => {
    render(<VoiceLatencyStatBadge />);
    expect(screen.getByTestId('voice-latency-stat-icon')).toBeInTheDocument();
  });

  it('accepts and applies a custom className', () => {
    render(<VoiceLatencyStatBadge className="custom-class" />);
    const badge = screen.getByTestId('voice-latency-stat-badge');
    expect(badge).toHaveClass('custom-class');
  });
});
