import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { StoryWorldSelector, STORY_WORLDS } from '../../components/chat/StoryWorldSelector';

describe('StoryWorldSelector', () => {
  const onSelect = vi.fn();
  const onSkip = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isNewConversation is false', () => {
    const { container } = render(
      <StoryWorldSelector
        isNewConversation={false}
        onSelect={onSelect}
        onSkip={onSkip}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the selector region when isNewConversation is true', () => {
    render(
      <StoryWorldSelector
        isNewConversation={true}
        onSelect={onSelect}
        onSkip={onSkip}
      />
    );
    expect(screen.getByTestId('story-world-selector')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Choose a story world' })).toBeInTheDocument();
  });

  it('renders all 6 story world cards', () => {
    render(
      <StoryWorldSelector
        isNewConversation={true}
        onSelect={onSelect}
        onSkip={onSkip}
      />
    );
    const expectedIds = ['fantasy', 'sci-fi', 'romance', 'mystery', 'historical', 'contemporary'];
    for (const id of expectedIds) {
      expect(screen.getByTestId(`story-world-card-${id}`)).toBeInTheDocument();
    }
  });

  it('renders each card with its label and description', () => {
    render(
      <StoryWorldSelector
        isNewConversation={true}
        onSelect={onSelect}
        onSkip={onSkip}
      />
    );
    for (const world of STORY_WORLDS) {
      const card = screen.getByTestId(`story-world-card-${world.id}`);
      expect(card).toHaveTextContent(world.label);
      expect(card).toHaveTextContent(world.description);
    }
  });

  it('calls onSelect with starterContext and worldId when a card is clicked', () => {
    render(
      <StoryWorldSelector
        isNewConversation={true}
        onSelect={onSelect}
        onSkip={onSkip}
      />
    );
    fireEvent.click(screen.getByTestId('story-world-card-fantasy'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(
      '[Story world: Fantasy] You are a narrator in a high-fantasy world of magic and wonder. ',
      'fantasy'
    );
  });

  it('calls onSelect with correct starterContext for each world', () => {
    render(
      <StoryWorldSelector
        isNewConversation={true}
        onSelect={onSelect}
        onSkip={onSkip}
      />
    );
    for (const world of STORY_WORLDS) {
      fireEvent.click(screen.getByTestId(`story-world-card-${world.id}`));
      expect(onSelect).toHaveBeenCalledWith(world.starterContext, world.id);
    }
    expect(onSelect).toHaveBeenCalledTimes(STORY_WORLDS.length);
  });

  it('renders the skip button', () => {
    render(
      <StoryWorldSelector
        isNewConversation={true}
        onSelect={onSelect}
        onSkip={onSkip}
      />
    );
    expect(screen.getByTestId('story-world-skip')).toBeInTheDocument();
    expect(screen.getByTestId('story-world-skip')).toHaveTextContent('Start without a world');
  });

  it('calls onSkip when the skip button is clicked', () => {
    render(
      <StoryWorldSelector
        isNewConversation={true}
        onSelect={onSelect}
        onSkip={onSkip}
      />
    );
    fireEvent.click(screen.getByTestId('story-world-skip'));
    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders the world grid container', () => {
    render(
      <StoryWorldSelector
        isNewConversation={true}
        onSelect={onSelect}
        onSkip={onSkip}
      />
    );
    expect(screen.getByTestId('story-world-grid')).toBeInTheDocument();
  });
});
