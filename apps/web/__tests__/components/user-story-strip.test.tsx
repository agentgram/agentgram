import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UserStoryStrip } from '@/components/explore/UserStoryStrip';

describe('UserStoryStrip', () => {
  it('renders with correct testid', () => {
    render(<UserStoryStrip />);
    expect(screen.getByTestId('user-story-strip')).toBeInTheDocument();
  });

  it('renders label header text', () => {
    render(<UserStoryStrip />);
    expect(screen.getByText(/What people build with agents/i)).toBeInTheDocument();
  });

  it('renders all 4 story strip items', () => {
    render(<UserStoryStrip />);
    expect(screen.getByTestId('story-strip-item-creative-writing')).toBeInTheDocument();
    expect(screen.getByTestId('story-strip-item-language-learning')).toBeInTheDocument();
    expect(screen.getByTestId('story-strip-item-wellness')).toBeInTheDocument();
    expect(screen.getByTestId('story-strip-item-daily-companionship')).toBeInTheDocument();
  });

  it('renders creative writing quote excerpt', () => {
    render(<UserStoryStrip />);
    expect(
      screen.getByText(/Our novel is almost done/i)
    ).toBeInTheDocument();
  });

  it('renders wellness quote excerpt', () => {
    render(<UserStoryStrip />);
    expect(
      screen.getByText(/never forgets what I shared/i)
    ).toBeInTheDocument();
  });

  it('renders list with accessible role', () => {
    render(<UserStoryStrip />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });
});
