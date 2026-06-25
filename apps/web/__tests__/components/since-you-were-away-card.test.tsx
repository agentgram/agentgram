import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SinceYouWereAwayCard } from '@/components/since-you-were-away-card';

const TWO_DAYS_AGO = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
const NINE_HOURS_AGO = new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString();
const SEVEN_HOURS_AGO = new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString();

describe('SinceYouWereAwayCard', () => {
  it('renders the card when gap is greater than 8 hours', () => {
    render(<SinceYouWereAwayCard lastVisitedAt={NINE_HOURS_AGO} streakDays={3} />);
    expect(screen.getByTestId('since-you-were-away-card')).toBeInTheDocument();
  });

  it('does not render when gap is 8 hours or less', () => {
    render(<SinceYouWereAwayCard lastVisitedAt={SEVEN_HOURS_AGO} streakDays={3} />);
    expect(screen.queryByTestId('since-you-were-away-card')).not.toBeInTheDocument();
  });

  it('shows generic welcome header when no companionName is provided', () => {
    render(<SinceYouWereAwayCard lastVisitedAt={TWO_DAYS_AGO} streakDays={0} />);
    expect(screen.getByTestId('since-you-were-away-header')).toHaveTextContent('Welcome back!');
  });

  it('includes companion name in header when provided', () => {
    render(
      <SinceYouWereAwayCard lastVisitedAt={TWO_DAYS_AGO} streakDays={5} companionName="Aria" />
    );
    expect(screen.getByTestId('since-you-were-away-header')).toHaveTextContent(
      'Aria missed you.'
    );
  });

  it('shows subtext with days away', () => {
    render(<SinceYouWereAwayCard lastVisitedAt={TWO_DAYS_AGO} streakDays={0} />);
    expect(screen.getByTestId('since-you-were-away-subtext')).toHaveTextContent(
      'You were away for 2 days.'
    );
  });

  it('shows broken streak badge when gap exceeds 24 hours', () => {
    render(<SinceYouWereAwayCard lastVisitedAt={TWO_DAYS_AGO} streakDays={0} />);
    expect(screen.getByTestId('since-you-were-away-streak-badge')).toHaveTextContent(
      'Streak reset'
    );
  });

  it('shows continuing streak badge when gap is under 24 hours', () => {
    render(<SinceYouWereAwayCard lastVisitedAt={NINE_HOURS_AGO} streakDays={7} />);
    expect(screen.getByTestId('since-you-were-away-streak-badge')).toHaveTextContent(
      '7 day streak continuing'
    );
  });

  it('renders platform update blurb', () => {
    render(<SinceYouWereAwayCard lastVisitedAt={TWO_DAYS_AGO} streakDays={0} />);
    expect(screen.getByTestId('since-you-were-away-update-blurb')).toHaveTextContent(
      'New features added since your visit'
    );
  });

  it('renders latest milestone when provided', () => {
    render(
      <SinceYouWereAwayCard
        lastVisitedAt={TWO_DAYS_AGO}
        streakDays={0}
        latestMilestone="Reached 30 days with Aria"
      />
    );
    expect(screen.getByTestId('since-you-were-away-milestone')).toHaveTextContent(
      'Reached 30 days with Aria'
    );
  });

  it('does not render milestone section when not provided', () => {
    render(<SinceYouWereAwayCard lastVisitedAt={TWO_DAYS_AGO} streakDays={0} />);
    expect(screen.queryByTestId('since-you-were-away-milestone')).not.toBeInTheDocument();
  });

  it('accepts a Date object for lastVisitedAt', () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    render(<SinceYouWereAwayCard lastVisitedAt={date} streakDays={0} />);
    expect(screen.getByTestId('since-you-were-away-card')).toBeInTheDocument();
  });
});
