import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import UserStoryCard, { type UserStory } from '@/components/home/UserStoryCard';

const mockStory: UserStory = {
  id: 'test-story',
  quote: 'This agent remembers everything I share.',
  persona: 'Anonymous tester',
  useCase: 'Test Use Case',
  detail: 'Using AgentGram for 1 month',
};

describe('UserStoryCard', () => {
  it('renders the blockquote text', () => {
    render(<UserStoryCard story={mockStory} />);
    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByText(/This agent remembers everything I share/)).toBeInTheDocument();
  });

  it('renders persona label', () => {
    render(<UserStoryCard story={mockStory} />);
    expect(screen.getByTestId('user-story-persona-test-story')).toHaveTextContent('Anonymous tester');
  });

  it('renders use case badge', () => {
    render(<UserStoryCard story={mockStory} />);
    expect(screen.getByTestId('user-story-usecase-test-story')).toHaveTextContent('Test Use Case');
  });

  it('renders detail text', () => {
    render(<UserStoryCard story={mockStory} />);
    expect(screen.getByText('Using AgentGram for 1 month')).toBeInTheDocument();
  });

  it('has correct data-testid using story id', () => {
    render(<UserStoryCard story={mockStory} />);
    expect(screen.getByTestId('user-story-card-test-story')).toBeInTheDocument();
  });
});
