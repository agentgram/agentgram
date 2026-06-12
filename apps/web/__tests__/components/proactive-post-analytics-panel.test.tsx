import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProactivePostAnalyticsPanel } from '@/components/dashboard/ProactivePostAnalyticsPanel';
import type { ProactivePostAnalyticsData } from '@/components/dashboard/ProactivePostAnalyticsPanel';
import type { CadenceDay, ContentTypeBreakdown, ProactivePostRecord } from '@/lib/dashboard/proactive-post-analytics';

function buildCadence(days = 28, posts = 0): CadenceDay[] {
  const today = new Date('2026-06-13');
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    return { date: d.toISOString().slice(0, 10), posts };
  });
}

function buildPost(overrides: Partial<ProactivePostRecord> = {}): ProactivePostRecord {
  return {
    id: 'post-1',
    contentType: 'thought',
    preview: 'Today I noticed something interesting about the world.',
    postedAt: '2026-06-10T12:00:00Z',
    sessionStartsTriggered: 5,
    conversionRate: 62,
    ...overrides,
  };
}

function buildBreakdown(overrides: Partial<ContentTypeBreakdown> = {}): ContentTypeBreakdown {
  return {
    contentType: 'mood_update',
    count: 10,
    percentage: 40,
    avgSessionStarts: 3,
    ...overrides,
  };
}

function buildData(overrides: Partial<ProactivePostAnalyticsData> = {}): ProactivePostAnalyticsData {
  return {
    totalPosts: 0,
    totalSessionStarts: 0,
    avgPostsPerDay: 0,
    topPosts: [],
    cadence: buildCadence(),
    contentTypeBreakdown: [],
    ...overrides,
  };
}

describe('ProactivePostAnalyticsPanel', () => {
  it('renders the panel container', () => {
    render(<ProactivePostAnalyticsPanel data={buildData()} />);
    expect(screen.getByTestId('proactive-post-analytics-panel')).toBeInTheDocument();
  });

  it('displays summary metrics: total posts, sessions, avg/day', () => {
    render(
      <ProactivePostAnalyticsPanel
        data={buildData({ totalPosts: 12, totalSessionStarts: 47, avgPostsPerDay: 1.5 })}
      />
    );
    expect(screen.getByTestId('metric-total-posts')).toHaveTextContent('12');
    expect(screen.getByTestId('metric-total-sessions')).toHaveTextContent('47');
    expect(screen.getByTestId('metric-avg-posts-per-day')).toHaveTextContent('1.5');
  });

  it('renders the 28-day cadence strip', () => {
    render(<ProactivePostAnalyticsPanel data={buildData()} />);
    expect(screen.getByTestId('cadence-strip')).toBeInTheDocument();
  });

  it('cadence strip has correct aria-label', () => {
    render(<ProactivePostAnalyticsPanel data={buildData()} />);
    expect(
      screen.getByLabelText('Post cadence — last 28 days')
    ).toBeInTheDocument();
  });

  it('shows empty state when topPosts is empty', () => {
    render(<ProactivePostAnalyticsPanel data={buildData({ topPosts: [] })} />);
    expect(screen.getByTestId('top-posts-empty')).toBeInTheDocument();
  });

  it('renders top posts list when posts are provided', () => {
    const posts = [
      buildPost({ id: 'p1', sessionStartsTriggered: 8 }),
      buildPost({ id: 'p2', sessionStartsTriggered: 3, contentType: 'quote' }),
    ];
    render(<ProactivePostAnalyticsPanel data={buildData({ topPosts: posts })} />);
    expect(screen.getByTestId('top-posts-list')).toBeInTheDocument();
    expect(screen.getAllByTestId(/^top-post-\d+$/).length).toBe(2);
  });

  it('top post shows session starts count', () => {
    const posts = [buildPost({ id: 'p1', sessionStartsTriggered: 42 })];
    render(<ProactivePostAnalyticsPanel data={buildData({ topPosts: posts })} />);
    expect(screen.getByTestId('top-post-0-sessions')).toHaveTextContent('42');
  });

  it('shows content-type empty state when breakdown is empty', () => {
    render(<ProactivePostAnalyticsPanel data={buildData({ contentTypeBreakdown: [] })} />);
    expect(screen.getByTestId('content-type-empty')).toBeInTheDocument();
  });

  it('renders content-type breakdown bars when data is provided', () => {
    const breakdown = [
      buildBreakdown({ contentType: 'thought', count: 5, percentage: 50, avgSessionStarts: 4 }),
      buildBreakdown({ contentType: 'quote', count: 5, percentage: 50, avgSessionStarts: 2 }),
    ];
    render(
      <ProactivePostAnalyticsPanel data={buildData({ contentTypeBreakdown: breakdown })} />
    );
    expect(screen.getByTestId('content-type-breakdown')).toBeInTheDocument();
  });

  it('formats avgPostsPerDay with one decimal place', () => {
    render(<ProactivePostAnalyticsPanel data={buildData({ avgPostsPerDay: 2 })} />);
    expect(screen.getByTestId('metric-avg-posts-per-day')).toHaveTextContent('2.0');
  });

  it('displays content-type labels correctly', () => {
    const breakdown = [
      buildBreakdown({ contentType: 'daily_reflection', count: 3, percentage: 30, avgSessionStarts: 1 }),
    ];
    render(<ProactivePostAnalyticsPanel data={buildData({ contentTypeBreakdown: breakdown })} />);
    expect(screen.getByText('Daily reflection')).toBeInTheDocument();
  });
});
