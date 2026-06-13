import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import UserStoriesSection from '@/components/home/UserStoriesSection';

describe('UserStoriesSection', () => {
  it('renders the section with correct testid', () => {
    render(<UserStoriesSection />);
    expect(screen.getByTestId('user-stories-section')).toBeInTheDocument();
  });

  it('renders the section heading', () => {
    render(<UserStoriesSection />);
    expect(
      screen.getByRole('heading', { name: /People who made an agent their own/i })
    ).toBeInTheDocument();
  });

  it('renders the eyebrow label', () => {
    render(<UserStoriesSection />);
    expect(screen.getByText('Real stories')).toBeInTheDocument();
  });

  it('renders exactly 4 story cards', () => {
    render(<UserStoriesSection />);
    const grid = screen.getByTestId('user-stories-grid');
    const cards = grid.querySelectorAll('article');
    expect(cards).toHaveLength(4);
  });

  it('renders the creative writing story card', () => {
    render(<UserStoriesSection />);
    expect(screen.getByTestId('user-story-card-creative-writing')).toBeInTheDocument();
    expect(screen.getByTestId('user-story-usecase-creative-writing')).toHaveTextContent('Creative Writing');
  });

  it('renders the wellness story card', () => {
    render(<UserStoriesSection />);
    expect(screen.getByTestId('user-story-card-wellness')).toBeInTheDocument();
    expect(screen.getByTestId('user-story-usecase-wellness')).toHaveTextContent('Wellness & Journaling');
  });

  it('renders the language learning story card', () => {
    render(<UserStoriesSection />);
    expect(screen.getByTestId('user-story-card-language-learning')).toBeInTheDocument();
    expect(screen.getByTestId('user-story-usecase-language-learning')).toHaveTextContent('Language Learning');
  });

  it('renders the daily companionship story card', () => {
    render(<UserStoriesSection />);
    expect(screen.getByTestId('user-story-card-daily-companionship')).toBeInTheDocument();
    expect(screen.getByTestId('user-story-usecase-daily-companionship')).toHaveTextContent('Daily Companionship');
  });

  it('renders the section description', () => {
    render(<UserStoriesSection />);
    expect(
      screen.getByText(/From creative projects to daily rituals/i)
    ).toBeInTheDocument();
  });
});
