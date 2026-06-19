import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BlankStartMessageCoach } from '../../../components/chat/BlankStartMessageCoach';

describe('BlankStartMessageCoach', () => {
  const onSelectStarter = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 3 starter chips when messageCount is 0', () => {
    render(
      <BlankStartMessageCoach
        messageCount={0}
        agentTags={[]}
        personaStyle=""
        onSelectStarter={onSelectStarter}
      />
    );
    const chips = screen.getAllByTestId('blank-start-chip');
    expect(chips).toHaveLength(3);
  });

  it('renders nothing when messageCount is greater than 0', () => {
    const { container } = render(
      <BlankStartMessageCoach
        messageCount={5}
        agentTags={[]}
        personaStyle=""
        onSelectStarter={onSelectStarter}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when messageCount is 1', () => {
    const { container } = render(
      <BlankStartMessageCoach
        messageCount={1}
        agentTags={[]}
        personaStyle=""
        onSelectStarter={onSelectStarter}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('calls onSelectStarter with chip text when a chip is clicked', () => {
    render(
      <BlankStartMessageCoach
        messageCount={0}
        agentTags={[]}
        personaStyle=""
        onSelectStarter={onSelectStarter}
      />
    );
    const chips = screen.getAllByTestId('blank-start-chip');
    fireEvent.click(chips[0]);
    expect(onSelectStarter).toHaveBeenCalledTimes(1);
    expect(onSelectStarter).toHaveBeenCalledWith(chips[0].textContent);
  });

  it('derives persona-relevant chips from agentTags', () => {
    render(
      <BlankStartMessageCoach
        messageCount={0}
        agentTags={['roleplay', 'creative', 'support']}
        personaStyle="playful"
        onSelectStarter={onSelectStarter}
      />
    );
    const chips = screen.getAllByTestId('blank-start-chip');
    expect(chips).toHaveLength(3);
    // Each chip should have non-empty text content.
    chips.forEach((chip) => {
      expect(chip.textContent).toBeTruthy();
    });
  });

  it('has the correct accessibility role and aria-label', () => {
    render(
      <BlankStartMessageCoach
        messageCount={0}
        agentTags={[]}
        personaStyle=""
        onSelectStarter={onSelectStarter}
      />
    );
    const group = screen.getByRole('group', { name: 'Conversation starter suggestions' });
    expect(group).toBeInTheDocument();
  });

  it('chip buttons are of type button to prevent unintended form submission', () => {
    render(
      <BlankStartMessageCoach
        messageCount={0}
        agentTags={[]}
        personaStyle=""
        onSelectStarter={onSelectStarter}
      />
    );
    const chips = screen.getAllByTestId('blank-start-chip');
    chips.forEach((chip) => {
      expect(chip).toHaveAttribute('type', 'button');
    });
  });
});
