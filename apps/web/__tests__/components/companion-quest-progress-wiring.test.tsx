import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QuestChallenge } from '../../components/quest/QuestChallenge';

// Minimal localStorage stub
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: storageMock });

const PROGRESS_KEY = 'agentgram:quest-progress';

describe('companion quest progress wiring — QuestChallenge', () => {
  beforeEach(() => {
    storageMock.clear();
  });

  it('renders all quest cards with Part 1 active when no stored progress', () => {
    render(<QuestChallenge />);
    const progressEls = screen.getAllByLabelText('Quest progress: Part 1 of 3');
    // All 3 quest cards default to part 1
    expect(progressEls).toHaveLength(3);
  });

  it('shows the Part 1 daily prompt for journey-of-connection by default', () => {
    render(<QuestChallenge />);
    const promptEl = screen.getByTestId('quest-daily-prompt-journey-of-connection');
    expect(promptEl.textContent).toContain('Tell me one thing you have been thinking about lately');
  });

  it('calls onStart with selected questId when Begin Quest is clicked', () => {
    const onStart = vi.fn();
    render(<QuestChallenge onStart={onStart} />);
    fireEvent.click(screen.getByTestId('quest-card-building-trust'));
    fireEvent.click(screen.getByTestId('quest-start-cta'));
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart).toHaveBeenCalledWith('building-trust');
  });

  it('persists quest to localStorage on Begin Quest click', () => {
    render(<QuestChallenge />);
    fireEvent.click(screen.getByTestId('quest-card-mystery-of-the-unknown'));
    fireEvent.click(screen.getByTestId('quest-start-cta'));
    const stored = storageMock.getItem(PROGRESS_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed['mystery-of-the-unknown']).toBe(1);
  });

  it('pre-seeded Part 2 progress renders Part 2 as active for that quest', () => {
    storageMock.setItem(
      PROGRESS_KEY,
      JSON.stringify({ 'mystery-of-the-unknown': 2 })
    );
    render(<QuestChallenge />);
    const mysteryCard = screen.getByTestId('quest-card-mystery-of-the-unknown');
    const progressEl = mysteryCard.querySelector('[data-testid="quest-progress"]');
    expect(progressEl).toHaveAttribute('aria-label', 'Quest progress: Part 2 of 3');
  });

  it('pre-seeded Part 2 progress shows Part 2 daily prompt in the card', () => {
    storageMock.setItem(
      PROGRESS_KEY,
      JSON.stringify({ 'mystery-of-the-unknown': 2 })
    );
    render(<QuestChallenge />);
    const promptEl = screen.getByTestId('quest-daily-prompt-mystery-of-the-unknown');
    // Part 2 prompt for mystery quest
    expect(promptEl.textContent).toContain(
      'Describe a moment when reality felt stranger than fiction'
    );
  });

  it('start bar reflects actual current part from stored progress', () => {
    storageMock.setItem(
      PROGRESS_KEY,
      JSON.stringify({ 'building-trust': 3 })
    );
    render(<QuestChallenge />);
    fireEvent.click(screen.getByTestId('quest-card-building-trust'));
    const startBar = screen.getByTestId('quest-start-bar');
    expect(startBar.textContent).toContain('Part 3 of 3');
    expect(startBar.textContent).toContain('Solid Foundation');
  });

  it('starting an already-tracked quest does not reset its progress', () => {
    storageMock.setItem(
      PROGRESS_KEY,
      JSON.stringify({ 'journey-of-connection': 2 })
    );
    const onStart = vi.fn();
    render(<QuestChallenge onStart={onStart} />);
    fireEvent.click(screen.getByTestId('quest-card-journey-of-connection'));
    fireEvent.click(screen.getByTestId('quest-start-cta'));

    const stored = storageMock.getItem(PROGRESS_KEY);
    const parsed = JSON.parse(stored!);
    // Should still be 2, not reset to 1
    expect(parsed['journey-of-connection']).toBe(2);
  });
});
