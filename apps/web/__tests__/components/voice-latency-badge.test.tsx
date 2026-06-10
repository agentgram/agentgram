import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  VoiceLatencyBadge,
  getVoiceLatencyTier,
  getVoiceLatencyLabel,
} from '../../components/agents/VoiceLatencyBadge';

describe('getVoiceLatencyTier', () => {
  it('returns fast for latencyMs < 2000', () => {
    expect(getVoiceLatencyTier(0)).toBe('fast');
    expect(getVoiceLatencyTier(1999)).toBe('fast');
    expect(getVoiceLatencyTier(1500)).toBe('fast');
  });

  it('returns medium for latencyMs in [2000, 5000]', () => {
    expect(getVoiceLatencyTier(2000)).toBe('medium');
    expect(getVoiceLatencyTier(3500)).toBe('medium');
    expect(getVoiceLatencyTier(5000)).toBe('medium');
  });

  it('returns slow for latencyMs > 5000', () => {
    expect(getVoiceLatencyTier(5001)).toBe('slow');
    expect(getVoiceLatencyTier(10000)).toBe('slow');
  });
});

describe('getVoiceLatencyLabel', () => {
  it('returns "<2s" for fast tier', () => {
    expect(getVoiceLatencyLabel(1800)).toBe('<2s');
  });

  it('returns "2–5s" for medium tier', () => {
    expect(getVoiceLatencyLabel(2000)).toBe('2–5s');
    expect(getVoiceLatencyLabel(4000)).toBe('2–5s');
  });

  it('returns ">5s" for slow tier', () => {
    expect(getVoiceLatencyLabel(6000)).toBe('>5s');
  });
});

describe('VoiceLatencyBadge', () => {
  it('renders with data-testid', () => {
    render(<VoiceLatencyBadge latencyMs={1500} />);
    expect(screen.getByTestId('voice-latency-badge')).toBeInTheDocument();
  });

  it('shows "<2s" label for fast latency', () => {
    render(<VoiceLatencyBadge latencyMs={1500} />);
    expect(screen.getByTestId('voice-latency-badge')).toHaveTextContent('<2s');
  });

  it('shows "2–5s" label for medium latency', () => {
    render(<VoiceLatencyBadge latencyMs={3000} />);
    expect(screen.getByTestId('voice-latency-badge')).toHaveTextContent('2–5s');
  });

  it('shows ">5s" label for slow latency', () => {
    render(<VoiceLatencyBadge latencyMs={7000} />);
    expect(screen.getByTestId('voice-latency-badge')).toHaveTextContent('>5s');
  });

  it('sets data-latency-tier="fast" for latencyMs < 2000', () => {
    render(<VoiceLatencyBadge latencyMs={1800} />);
    expect(screen.getByTestId('voice-latency-badge')).toHaveAttribute(
      'data-latency-tier',
      'fast'
    );
  });

  it('sets data-latency-tier="medium" for latencyMs in [2000, 5000]', () => {
    render(<VoiceLatencyBadge latencyMs={3500} />);
    expect(screen.getByTestId('voice-latency-badge')).toHaveAttribute(
      'data-latency-tier',
      'medium'
    );
  });

  it('sets data-latency-tier="slow" for latencyMs > 5000', () => {
    render(<VoiceLatencyBadge latencyMs={6000} />);
    expect(screen.getByTestId('voice-latency-badge')).toHaveAttribute(
      'data-latency-tier',
      'slow'
    );
  });

  it('includes the Nomi benchmark reference in the title', () => {
    render(<VoiceLatencyBadge latencyMs={1500} />);
    const badge = screen.getByTestId('voice-latency-badge');
    expect(badge).toHaveAttribute('title', expect.stringContaining('Nomi benchmark'));
  });

  it('accepts an optional className prop', () => {
    render(<VoiceLatencyBadge latencyMs={1500} className="extra-class" />);
    expect(screen.getByTestId('voice-latency-badge')).toHaveClass('extra-class');
  });

  it('boundary: latencyMs exactly 2000 is medium', () => {
    render(<VoiceLatencyBadge latencyMs={2000} />);
    expect(screen.getByTestId('voice-latency-badge')).toHaveAttribute(
      'data-latency-tier',
      'medium'
    );
  });

  it('boundary: latencyMs exactly 5000 is medium', () => {
    render(<VoiceLatencyBadge latencyMs={5000} />);
    expect(screen.getByTestId('voice-latency-badge')).toHaveAttribute(
      'data-latency-tier',
      'medium'
    );
  });
});
