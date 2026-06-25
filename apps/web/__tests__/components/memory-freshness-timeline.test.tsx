import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  MemoryFreshnessTimeline,
  type MemoryFact,
} from '../../components/memory/MemoryFreshnessTimeline';

const DAY = 1000 * 60 * 60 * 24;

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * DAY);
}

const RECENT_FACT: MemoryFact = {
  id: 'fact-1',
  content: 'Prefers dark mode',
  lastUsedAt: daysAgo(2),
};

const WEEKS_FACT: MemoryFact = {
  id: 'fact-2',
  content: 'Favorite color is blue',
  lastUsedAt: daysAgo(21),
};

const MONTHS_FACT: MemoryFact = {
  id: 'fact-3',
  content: 'Used to live in Tokyo',
  lastUsedAt: daysAgo(90),
};

const ALL_FACTS: MemoryFact[] = [RECENT_FACT, WEEKS_FACT, MONTHS_FACT];

describe('MemoryFreshnessTimeline', () => {
  // 1. Renders facts with timestamps
  it('renders all facts with their timestamps', () => {
    render(<MemoryFreshnessTimeline facts={ALL_FACTS} />);

    expect(screen.getByTestId('memory-fact-content-fact-1')).toHaveTextContent('Prefers dark mode');
    expect(screen.getByTestId('memory-fact-timestamp-fact-1')).toHaveTextContent('2 days ago');

    expect(screen.getByTestId('memory-fact-content-fact-2')).toHaveTextContent('Favorite color is blue');
    expect(screen.getByTestId('memory-fact-timestamp-fact-2')).toHaveTextContent('3 weeks ago');

    expect(screen.getByTestId('memory-fact-content-fact-3')).toHaveTextContent('Used to live in Tokyo');
    expect(screen.getByTestId('memory-fact-timestamp-fact-3')).toHaveTextContent('3 months ago');
  });

  // 2. Staleness color coding — green (recent), yellow (weeks), red (months)
  it('applies green indicator for facts used within 14 days', () => {
    render(<MemoryFreshnessTimeline facts={[RECENT_FACT]} />);
    const indicator = screen.getByTestId('memory-fact-indicator-fact-1');
    expect(indicator.className).toMatch(/bg-emerald-500/);
  });

  it('applies amber indicator for facts used 14–59 days ago', () => {
    render(<MemoryFreshnessTimeline facts={[WEEKS_FACT]} />);
    const indicator = screen.getByTestId('memory-fact-indicator-fact-2');
    expect(indicator.className).toMatch(/bg-amber-500/);
  });

  it('applies red indicator for facts unused for 60+ days', () => {
    render(<MemoryFreshnessTimeline facts={[MONTHS_FACT]} />);
    const indicator = screen.getByTestId('memory-fact-indicator-fact-3');
    expect(indicator.className).toMatch(/bg-red-500/);
  });

  // 3. Prune CTA
  it('renders prune CTA button when onPruneStale is provided', () => {
    const onPruneStale = vi.fn();
    render(<MemoryFreshnessTimeline facts={ALL_FACTS} onPruneStale={onPruneStale} />);
    expect(screen.getByTestId('memory-freshness-prune-btn')).toBeInTheDocument();
  });

  it('calls onPruneStale when prune button is clicked', () => {
    const onPruneStale = vi.fn();
    render(<MemoryFreshnessTimeline facts={ALL_FACTS} onPruneStale={onPruneStale} />);
    fireEvent.click(screen.getByTestId('memory-freshness-prune-btn'));
    expect(onPruneStale).toHaveBeenCalledOnce();
  });

  it('does not render prune section when onPruneStale is not provided', () => {
    render(<MemoryFreshnessTimeline facts={ALL_FACTS} />);
    expect(screen.queryByTestId('memory-freshness-prune-section')).not.toBeInTheDocument();
  });

  it('prune section shows correct stale count', () => {
    const onPruneStale = vi.fn();
    render(<MemoryFreshnessTimeline facts={ALL_FACTS} onPruneStale={onPruneStale} />);
    const pruneSection = screen.getByTestId('memory-freshness-prune-section');
    expect(pruneSection.textContent).toMatch(/1 stale memory/);
  });

  // 4. Empty state
  it('renders empty state when no facts are provided', () => {
    render(<MemoryFreshnessTimeline facts={[]} />);
    expect(screen.getByTestId('memory-freshness-timeline-empty')).toBeInTheDocument();
  });

  it('empty state has the correct aria-label', () => {
    render(<MemoryFreshnessTimeline facts={[]} />);
    expect(screen.getByTestId('memory-freshness-timeline-empty')).toHaveAttribute(
      'aria-label',
      'No memory facts found'
    );
  });

  it('empty state displays informative message', () => {
    render(<MemoryFreshnessTimeline facts={[]} />);
    expect(screen.getByTestId('memory-freshness-timeline-empty')).toHaveTextContent(
      'No memory facts to display'
    );
  });

  // 5. Loading state
  it('renders loading state when isLoading is true', () => {
    render(<MemoryFreshnessTimeline isLoading />);
    expect(screen.getByTestId('memory-freshness-timeline-loading')).toBeInTheDocument();
  });

  it('loading state has aria-busy="true"', () => {
    render(<MemoryFreshnessTimeline isLoading />);
    expect(screen.getByTestId('memory-freshness-timeline-loading')).toHaveAttribute(
      'aria-busy',
      'true'
    );
  });

  it('does not render facts during loading state', () => {
    render(<MemoryFreshnessTimeline facts={ALL_FACTS} isLoading />);
    expect(screen.queryByTestId('memory-fact-fact-1')).not.toBeInTheDocument();
  });

  // 6. Accessibility
  it('has aria-label on the root timeline container', () => {
    render(<MemoryFreshnessTimeline facts={ALL_FACTS} />);
    expect(screen.getByTestId('memory-freshness-timeline')).toHaveAttribute(
      'aria-label',
      'Memory freshness timeline'
    );
  });

  it('renders fact list with role="list"', () => {
    render(<MemoryFreshnessTimeline facts={ALL_FACTS} />);
    expect(screen.getByRole('list', { name: 'Memory facts by freshness' })).toBeInTheDocument();
  });

  it('each fact row has role="listitem"', () => {
    render(<MemoryFreshnessTimeline facts={ALL_FACTS} />);
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBe(ALL_FACTS.length);
  });

  it('prune button has descriptive aria-label for screen readers', () => {
    const onPruneStale = vi.fn();
    render(<MemoryFreshnessTimeline facts={ALL_FACTS} onPruneStale={onPruneStale} />);
    expect(screen.getByTestId('memory-freshness-prune-btn')).toHaveAttribute(
      'aria-label',
      'Prune 1 stale memory'
    );
  });

  it('staleness indicator has aria-label describing staleness level', () => {
    render(<MemoryFreshnessTimeline facts={[MONTHS_FACT]} />);
    expect(screen.getByTestId('memory-fact-indicator-fact-3')).toHaveAttribute(
      'aria-label',
      'Staleness: Stale'
    );
  });
});
