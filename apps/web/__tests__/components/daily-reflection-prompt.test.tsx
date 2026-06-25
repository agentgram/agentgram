import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DailyReflectionPrompt } from '../../components/agents/DailyReflectionPrompt';
import { DailyReflectionSettingsCard } from '../../components/dashboard/DailyReflectionSettingsCard';

const AGENT = {
  name: 'aria',
  displayName: 'Aria',
  avatarUrl: null,
};

const REFLECTION = {
  id: 'refl-1',
  text: 'What moment today made you pause and smile?',
  sentAt: '2026-06-10T09:00:00.000Z',
};

describe('DailyReflectionPrompt', () => {
  it('renders with the correct data-testid', () => {
    render(<DailyReflectionPrompt agent={AGENT} reflection={REFLECTION} />);
    expect(screen.getByTestId('daily-reflection-prompt')).toBeInTheDocument();
  });

  it('displays the reflection text with agent name prefix', () => {
    render(<DailyReflectionPrompt agent={AGENT} reflection={REFLECTION} />);
    const text = screen.getByTestId('daily-reflection-text');
    expect(text.textContent).toMatch(/Today's reflection from Aria/i);
    expect(text.textContent).toMatch(/What moment today made you pause/i);
  });

  it('shows the daily reflection badge', () => {
    render(<DailyReflectionPrompt agent={AGENT} reflection={REFLECTION} />);
    expect(screen.getByTestId('daily-reflection-badge')).toBeInTheDocument();
    expect(screen.getByTestId('daily-reflection-badge').textContent).toMatch(
      /daily reflection/i
    );
  });

  it('renders the Respond CTA when onRespond is provided', () => {
    const onRespond = vi.fn();
    render(
      <DailyReflectionPrompt
        agent={AGENT}
        reflection={REFLECTION}
        onRespond={onRespond}
      />
    );
    const btn = screen.getByTestId('daily-reflection-respond-cta');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onRespond).toHaveBeenCalledWith(REFLECTION.id);
  });

  it('does not render the Respond CTA when onRespond is not provided', () => {
    render(<DailyReflectionPrompt agent={AGENT} reflection={REFLECTION} />);
    expect(
      screen.queryByTestId('daily-reflection-respond-cta')
    ).not.toBeInTheDocument();
  });

  it('renders the reflection timestamp', () => {
    render(<DailyReflectionPrompt agent={AGENT} reflection={REFLECTION} />);
    expect(screen.getByTestId('daily-reflection-time')).toBeInTheDocument();
    expect(
      screen.getByTestId('daily-reflection-time').getAttribute('dateTime')
    ).toBe(REFLECTION.sentAt);
  });

  it('uses displayName in the reflection prefix', () => {
    const agentNoDisplay = { name: 'aria', displayName: '', avatarUrl: null };
    render(<DailyReflectionPrompt agent={agentNoDisplay} reflection={REFLECTION} />);
    const text = screen.getByTestId('daily-reflection-text');
    expect(text.textContent).toMatch(/Today's reflection from aria/i);
  });
});

describe('DailyReflectionSettingsCard', () => {
  it('renders with the correct data-testid', () => {
    render(
      <DailyReflectionSettingsCard
        agentId="agent-1"
        agentLabel="@aria"
        initialSettings={{ enabled: false }}
      />
    );
    expect(
      screen.getByTestId('daily-reflection-settings-card')
    ).toBeInTheDocument();
  });

  it('shows the "Free — all tiers" badge', () => {
    render(
      <DailyReflectionSettingsCard
        agentId="agent-1"
        agentLabel="@aria"
        initialSettings={{ enabled: false }}
      />
    );
    expect(screen.getByTestId('daily-reflection-free-badge')).toBeInTheDocument();
    expect(
      screen.getByTestId('daily-reflection-free-badge').textContent
    ).toMatch(/Free/i);
  });

  it('toggle reflects the initialSettings enabled state', () => {
    render(
      <DailyReflectionSettingsCard
        agentId="agent-1"
        agentLabel="@aria"
        initialSettings={{ enabled: true }}
      />
    );
    const toggle = screen.getByTestId(
      'daily-reflection-toggle'
    ) as HTMLInputElement;
    expect(toggle.checked).toBe(true);
  });

  it('toggle can be flipped', () => {
    render(
      <DailyReflectionSettingsCard
        agentId="agent-1"
        agentLabel="@aria"
        initialSettings={{ enabled: false }}
      />
    );
    const toggle = screen.getByTestId(
      'daily-reflection-toggle'
    ) as HTMLInputElement;
    expect(toggle.checked).toBe(false);
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(true);
  });

  it('renders a Save settings button', () => {
    render(
      <DailyReflectionSettingsCard
        agentId="agent-1"
        agentLabel="@aria"
        initialSettings={{ enabled: false }}
      />
    );
    expect(screen.getByTestId('daily-reflection-save-btn')).toBeInTheDocument();
  });
});
