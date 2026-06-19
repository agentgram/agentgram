import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QuestChallenge } from '../../components/quest/QuestChallenge';
import { QUESTS } from '../../lib/quests';

describe('QuestChallenge', () => {
  it('renders the quest challenge card with data-testid', () => {
    render(<QuestChallenge />);
    expect(screen.getByTestId('quest-challenge')).toBeInTheDocument();
  });

  it('renders the quest selection panel', () => {
    render(<QuestChallenge />);
    expect(screen.getByTestId('quest-selection-panel')).toBeInTheDocument();
  });

  it('renders all 3 quest cards', () => {
    render(<QuestChallenge />);
    expect(screen.getByTestId('quest-card-journey-of-connection')).toBeInTheDocument();
    expect(screen.getByTestId('quest-card-mystery-of-the-unknown')).toBeInTheDocument();
    expect(screen.getByTestId('quest-card-building-trust')).toBeInTheDocument();
  });

  it('renders quest titles from QUESTS data', () => {
    render(<QuestChallenge />);
    for (const quest of QUESTS) {
      expect(screen.getByText(quest.title)).toBeInTheDocument();
    }
  });

  it('shows the no-selection hint when no quest is selected', () => {
    render(<QuestChallenge />);
    expect(screen.getByTestId('quest-no-selection-hint')).toBeInTheDocument();
  });

  it('does not show the start bar initially', () => {
    render(<QuestChallenge />);
    expect(screen.queryByTestId('quest-start-bar')).not.toBeInTheDocument();
  });

  it('shows the start bar after selecting a quest', () => {
    render(<QuestChallenge />);
    const card = screen.getByTestId('quest-card-journey-of-connection');
    fireEvent.click(card);
    expect(screen.getByTestId('quest-start-bar')).toBeInTheDocument();
  });

  it('hides the no-selection hint after selecting a quest', () => {
    render(<QuestChallenge />);
    const card = screen.getByTestId('quest-card-journey-of-connection');
    fireEvent.click(card);
    expect(screen.queryByTestId('quest-no-selection-hint')).not.toBeInTheDocument();
  });

  it('shows the Begin Quest CTA button after selection', () => {
    render(<QuestChallenge />);
    fireEvent.click(screen.getByTestId('quest-card-mystery-of-the-unknown'));
    expect(screen.getByTestId('quest-start-cta')).toBeInTheDocument();
    expect(screen.getByTestId('quest-start-cta').textContent).toMatch(/begin quest/i);
  });

  it('calls onStart with the selected quest id when Begin Quest is clicked', () => {
    const onStart = vi.fn();
    render(<QuestChallenge onStart={onStart} />);
    fireEvent.click(screen.getByTestId('quest-card-building-trust'));
    fireEvent.click(screen.getByTestId('quest-start-cta'));
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart).toHaveBeenCalledWith('building-trust');
  });

  it('renders the daily prompt preview for each quest card', () => {
    render(<QuestChallenge />);
    expect(
      screen.getByTestId('quest-daily-prompt-journey-of-connection')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('quest-daily-prompt-mystery-of-the-unknown')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('quest-daily-prompt-building-trust')
    ).toBeInTheDocument();
  });

  it('renders the quest progress tracker for each card', () => {
    render(<QuestChallenge />);
    // There are 3 quest cards, each with a progress tracker
    const progressBars = screen.getAllByTestId('quest-progress');
    expect(progressBars).toHaveLength(3);
  });

  it('each progress tracker shows 3 part indicators', () => {
    render(<QuestChallenge />);
    const progressBars = screen.getAllByTestId('quest-progress');
    // First progress tracker should have Part 1, Part 2, Part 3 indicators
    const firstProgress = progressBars[0];
    expect(firstProgress.querySelector('[data-testid="quest-progress-part-1"]')).toBeInTheDocument();
    expect(firstProgress.querySelector('[data-testid="quest-progress-part-2"]')).toBeInTheDocument();
    expect(firstProgress.querySelector('[data-testid="quest-progress-part-3"]')).toBeInTheDocument();
  });

  it('renders the 3-Part Arc badge on each quest card', () => {
    render(<QuestChallenge />);
    const badges = screen.getAllByText(/3-part arc/i);
    expect(badges).toHaveLength(3);
  });

  it('switching quest selection updates the start bar title', () => {
    render(<QuestChallenge />);
    fireEvent.click(screen.getByTestId('quest-card-journey-of-connection'));
    expect(screen.getByTestId('quest-start-bar').textContent).toContain(
      'The Journey of Connection'
    );
    fireEvent.click(screen.getByTestId('quest-card-building-trust'));
    expect(screen.getByTestId('quest-start-bar').textContent).toContain(
      'Building Trust'
    );
  });
});

describe('QUESTS data', () => {
  it('exports exactly 3 quests', () => {
    expect(QUESTS).toHaveLength(3);
  });

  it('each quest has exactly 3 parts', () => {
    for (const quest of QUESTS) {
      expect(quest.parts).toHaveLength(3);
    }
  });

  it('part numbers are 1, 2, 3 in order', () => {
    for (const quest of QUESTS) {
      expect(quest.parts[0].part).toBe(1);
      expect(quest.parts[1].part).toBe(2);
      expect(quest.parts[2].part).toBe(3);
    }
  });

  it('each quest part has a non-empty dailyPrompt', () => {
    for (const quest of QUESTS) {
      for (const part of quest.parts) {
        expect(part.dailyPrompt.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('quest ids match expected values', () => {
    const ids = QUESTS.map((q) => q.id);
    expect(ids).toContain('journey-of-connection');
    expect(ids).toContain('mystery-of-the-unknown');
    expect(ids).toContain('building-trust');
  });
});
