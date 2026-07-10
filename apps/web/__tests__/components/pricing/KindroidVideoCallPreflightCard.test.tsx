import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KindroidVideoCallPreflightCard } from '@/components/pricing/KindroidVideoCallPreflightCard';

describe('KindroidVideoCallPreflightCard', () => {
  it('renders the live video-call preflight card without crashing', () => {
    render(<KindroidVideoCallPreflightCard />);
    expect(screen.getByTestId('kindroid-video-call-preflight-card')).toBeInTheDocument();
  });

  it('explains that readiness is checked before a live video call starts', () => {
    render(<KindroidVideoCallPreflightCard />);

    expect(screen.getByTestId('kindroid-video-preflight-eyebrow')).toHaveTextContent(
      'Live video-call preflight'
    );
    expect(screen.getByTestId('kindroid-video-preflight-heading')).toHaveTextContent(
      'Know camera, mic, latency, and availability before the call starts'
    );
  });

  it('shows camera, microphone, and estimated latency readiness signals', () => {
    render(<KindroidVideoCallPreflightCard />);

    expect(screen.getByTestId('kindroid-video-preflight-camera')).toHaveTextContent('Camera');
    expect(screen.getByTestId('kindroid-video-preflight-camera')).toHaveTextContent(
      'HD camera ready'
    );
    expect(screen.getByTestId('kindroid-video-preflight-microphone')).toHaveTextContent(
      'Microphone'
    );
    expect(screen.getByTestId('kindroid-video-preflight-microphone')).toHaveTextContent(
      'Mic input verified'
    );
    expect(screen.getByTestId('kindroid-video-preflight-latency')).toHaveTextContent(
      'Estimated latency'
    );
    expect(screen.getByTestId('kindroid-video-preflight-latency')).toHaveTextContent(
      '~180ms round trip'
    );
  });

  it('keeps video-call availability and fallback checks visible', () => {
    render(<KindroidVideoCallPreflightCard />);
    const checks = screen.getByTestId('kindroid-video-preflight-availability-checks');

    expect(screen.getByTestId('kindroid-video-preflight-availability-badge')).toHaveTextContent(
      'Video call available'
    );
    expect(checks.children).toHaveLength(3);
    expect(checks).toHaveTextContent('Video calls available on this plan');
    expect(checks).toHaveTextContent('Browser permissions checked before connect');
    expect(checks).toHaveTextContent('Fallback to voice-only if camera drops');
  });
});
