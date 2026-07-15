import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KindroidLiveCallStabilityConsole } from '@/components/pricing/KindroidLiveCallStabilityConsole';

describe('KindroidLiveCallStabilityConsole', () => {
  it('renders the live-call stability console without crashing', () => {
    render(<KindroidLiveCallStabilityConsole />);
    expect(screen.getByTestId('kindroid-live-call-stability-console')).toBeInTheDocument();
  });

  it('explains that readiness, captions, and fixes are visible before failure', () => {
    render(<KindroidLiveCallStabilityConsole />);

    expect(screen.getByTestId('stability-console-eyebrow')).toHaveTextContent(
      'Live-call stability console'
    );
    expect(screen.getByTestId('stability-console-heading')).toHaveTextContent(
      'Show readiness, captions, and fixes before the video call fails'
    );
    expect(screen.getByTestId('stability-console-ready-badge')).toHaveTextContent(
      'Ready + live'
    );
  });

  it('shows readiness, connection, and fallback status cards', () => {
    render(<KindroidLiveCallStabilityConsole />);
    const grid = screen.getByTestId('stability-console-readiness-grid');

    expect(grid.children).toHaveLength(3);
    expect(screen.getByTestId('stability-console-readiness')).toHaveTextContent('Readiness');
    expect(screen.getByTestId('stability-console-readiness')).toHaveTextContent(
      'Camera, mic, and transcript route verified'
    );
    expect(screen.getByTestId('stability-console-connection')).toHaveTextContent(
      'Stable video route selected'
    );
    expect(screen.getByTestId('stability-console-fallbacks')).toHaveTextContent(
      'Voice-only + retry guidance ready'
    );
  });

  it('keeps the live transcript visible during the call', () => {
    render(<KindroidLiveCallStabilityConsole />);
    const transcript = screen.getByTestId('stability-console-live-transcript');

    expect(transcript).toHaveTextContent('Live transcript');
    expect(transcript).toHaveTextContent('Mina');
    expect(transcript).toHaveTextContent('Live transcript synced');
  });

  it('pins troubleshooting guidance before and during video calls', () => {
    render(<KindroidLiveCallStabilityConsole />);
    const troubleshooting = screen.getByTestId('stability-console-troubleshooting');

    expect(troubleshooting).toHaveTextContent('Troubleshooting pinned');
    expect(troubleshooting).toHaveTextContent('Refresh camera permission without leaving the call');
    expect(troubleshooting).toHaveTextContent('Switch to voice-only if video drops twice');
    expect(troubleshooting).toHaveTextContent('Export transcript and stability log after disconnect');
  });
});
