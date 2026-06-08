import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CheckInConsentPanel } from '../../components/agents/CheckInConsentPanel';

describe('CheckInConsentPanel', () => {
  it('renders nothing when closed', () => {
    render(
      <CheckInConsentPanel
        open={false}
        onOpenChange={vi.fn()}
        agentName="Aria"
        onAllow={vi.fn()}
        onMute={vi.fn()}
      />
    );

    expect(
      screen.queryByTestId('check-in-consent-panel')
    ).not.toBeInTheDocument();
  });

  it('renders the panel when open', () => {
    render(
      <CheckInConsentPanel
        open={true}
        onOpenChange={vi.fn()}
        agentName="Aria"
        onAllow={vi.fn()}
        onMute={vi.fn()}
      />
    );

    expect(
      screen.getByTestId('check-in-consent-panel')
    ).toBeInTheDocument();
  });

  it('shows the agent name in the title', () => {
    render(
      <CheckInConsentPanel
        open={true}
        onOpenChange={vi.fn()}
        agentName="Nova"
        onAllow={vi.fn()}
        onMute={vi.fn()}
      />
    );

    expect(screen.getByTestId('check-in-consent-title')).toHaveTextContent(
      'Nova'
    );
  });

  it('shows the default trigger label when no trigger is set', () => {
    render(
      <CheckInConsentPanel
        open={true}
        onOpenChange={vi.fn()}
        agentName="Aria"
        onAllow={vi.fn()}
        onMute={vi.fn()}
      />
    );

    expect(screen.getByTestId('check-in-reason')).toHaveTextContent(
      'based on your activity'
    );
  });

  it('shows the correct trigger label for scheduled_window', () => {
    render(
      <CheckInConsentPanel
        open={true}
        onOpenChange={vi.fn()}
        agentName="Aria"
        settings={{ lastAutoMessageTrigger: 'scheduled_window' }}
        onAllow={vi.fn()}
        onMute={vi.fn()}
      />
    );

    expect(screen.getByTestId('check-in-reason')).toHaveTextContent(
      'triggered by scheduled send window'
    );
  });

  it('shows the correct trigger label for milestone', () => {
    render(
      <CheckInConsentPanel
        open={true}
        onOpenChange={vi.fn()}
        agentName="Aria"
        settings={{ lastAutoMessageTrigger: 'milestone' }}
        onAllow={vi.fn()}
        onMute={vi.fn()}
      />
    );

    expect(screen.getByTestId('check-in-reason')).toHaveTextContent(
      'triggered by relationship milestone'
    );
  });

  it('shows "anytime" for next window when nextEligibleSendAt is not set', () => {
    render(
      <CheckInConsentPanel
        open={true}
        onOpenChange={vi.fn()}
        agentName="Aria"
        onAllow={vi.fn()}
        onMute={vi.fn()}
      />
    );

    expect(screen.getByTestId('check-in-next-window')).toHaveTextContent(
      'anytime'
    );
  });

  it('formats a valid nextEligibleSendAt date', () => {
    render(
      <CheckInConsentPanel
        open={true}
        onOpenChange={vi.fn()}
        agentName="Aria"
        settings={{ nextEligibleSendAt: '2026-06-09T09:00:00.000Z' }}
        onAllow={vi.fn()}
        onMute={vi.fn()}
      />
    );

    const windowEl = screen.getByTestId('check-in-next-window');
    expect(windowEl).not.toHaveTextContent('anytime');
    expect(windowEl.textContent).toContain('Jun');
  });

  it('does not show quiet hours when quietHoursEnabled is false', () => {
    render(
      <CheckInConsentPanel
        open={true}
        onOpenChange={vi.fn()}
        agentName="Aria"
        settings={{
          quietHoursEnabled: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
        }}
        onAllow={vi.fn()}
        onMute={vi.fn()}
      />
    );

    expect(
      screen.queryByTestId('check-in-quiet-hours')
    ).not.toBeInTheDocument();
  });

  it('shows quiet hours when quietHoursEnabled is true', () => {
    render(
      <CheckInConsentPanel
        open={true}
        onOpenChange={vi.fn()}
        agentName="Aria"
        settings={{
          quietHoursEnabled: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
        }}
        onAllow={vi.fn()}
        onMute={vi.fn()}
      />
    );

    const quietHours = screen.getByTestId('check-in-quiet-hours');
    expect(quietHours).toHaveTextContent('22:00');
    expect(quietHours).toHaveTextContent('08:00');
  });

  it('calls onAllow when Allow button is clicked', () => {
    const onAllow = vi.fn();
    render(
      <CheckInConsentPanel
        open={true}
        onOpenChange={vi.fn()}
        agentName="Aria"
        onAllow={onAllow}
        onMute={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('check-in-allow-button'));
    expect(onAllow).toHaveBeenCalledOnce();
  });

  it('calls onMute when Mute button is clicked', () => {
    const onMute = vi.fn();
    render(
      <CheckInConsentPanel
        open={true}
        onOpenChange={vi.fn()}
        agentName="Aria"
        onAllow={vi.fn()}
        onMute={onMute}
      />
    );

    fireEvent.click(screen.getByTestId('check-in-mute-button'));
    expect(onMute).toHaveBeenCalledOnce();
  });

  it('calls onOpenChange with false when overlay is clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <CheckInConsentPanel
        open={true}
        onOpenChange={onOpenChange}
        agentName="Aria"
        onAllow={vi.fn()}
        onMute={vi.fn()}
      />
    );

    const overlay = document.querySelector('.fixed.inset-0');
    if (overlay) fireEvent.click(overlay);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
