import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StarterPromptStrip } from '../../components/chat/StarterPromptStrip';

describe('StarterPromptStrip', () => {
  it('renders 5 starter prompt chips', () => {
    render(<StarterPromptStrip onSelect={vi.fn()} />);

    const chips = screen.getAllByTestId('starter-prompt-chip');
    expect(chips).toHaveLength(5);
  });

  it('calls onSelect with the chip label when clicked', () => {
    const onSelect = vi.fn();
    render(<StarterPromptStrip onSelect={onSelect} />);

    const chips = screen.getAllByTestId('starter-prompt-chip');
    fireEvent.click(chips[0]);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("Tell me about your day");
  });

  it('calls onSelect with the correct prompt for each chip', () => {
    const onSelect = vi.fn();
    render(<StarterPromptStrip onSelect={onSelect} />);

    const chips = screen.getAllByTestId('starter-prompt-chip');
    fireEvent.click(chips[1]);

    expect(onSelect).toHaveBeenCalledWith("Help me brainstorm");
  });

  it('renders with aria-label for accessibility', () => {
    render(<StarterPromptStrip onSelect={vi.fn()} />);

    expect(screen.getByLabelText('Starter prompts')).toBeInTheDocument();
  });
});
