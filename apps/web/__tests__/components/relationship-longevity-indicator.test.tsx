import React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RelationshipLongevityIndicator } from '../../components/agent/RelationshipLongevityIndicator';
import {
  getActiveDaysFromDate,
  getConsistencyLabel,
} from '../../lib/relationship-longevity';

describe('RelationshipLongevityIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-09T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the active days badge with correct text', () => {
    render(<RelationshipLongevityIndicator activeDays={50} consistencyScore={75} />);
    expect(screen.getByTestId('longevity-active-days-badge')).toHaveTextContent('활성 50일');
  });

  it('shows gray color for <30 days', () => {
    render(<RelationshipLongevityIndicator activeDays={15} consistencyScore={50} />);
    const badge = screen.getByTestId('longevity-active-days-badge');
    expect(badge.className).toContain('bg-muted/40');
    expect(badge.className).toContain('text-muted-foreground');
  });

  it('shows blue color for 30-89 days', () => {
    render(<RelationshipLongevityIndicator activeDays={45} consistencyScore={50} />);
    const badge = screen.getByTestId('longevity-active-days-badge');
    expect(badge.className).toContain('bg-blue-500/10');
    expect(badge.className).toContain('text-blue-700');
  });

  it('shows green color for 90+ days', () => {
    render(<RelationshipLongevityIndicator activeDays={120} consistencyScore={80} />);
    const badge = screen.getByTestId('longevity-active-days-badge');
    expect(badge.className).toContain('bg-green-500/10');
    expect(badge.className).toContain('text-green-700');
  });

  it('shows consistency score percentage', () => {
    render(<RelationshipLongevityIndicator activeDays={60} consistencyScore={82} />);
    expect(screen.getByTestId('longevity-consistency-score')).toHaveTextContent('82%');
  });

  it('clamps consistencyScore to 100 max', () => {
    render(<RelationshipLongevityIndicator activeDays={60} consistencyScore={150} />);
    expect(screen.getByTestId('longevity-consistency-score')).toHaveTextContent('100%');
  });

  it('clamps consistencyScore to 0 min', () => {
    render(<RelationshipLongevityIndicator activeDays={10} consistencyScore={-5} />);
    expect(screen.getByTestId('longevity-consistency-score')).toHaveTextContent('0%');
  });

  it('shows 높음 label for score >= 70', () => {
    render(<RelationshipLongevityIndicator activeDays={30} consistencyScore={70} />);
    expect(screen.getByTestId('longevity-consistency-label')).toHaveTextContent('높음');
  });

  it('shows 보통 label for score 40-69', () => {
    render(<RelationshipLongevityIndicator activeDays={30} consistencyScore={55} />);
    expect(screen.getByTestId('longevity-consistency-label')).toHaveTextContent('보통');
  });

  it('shows 낮음 label for score < 40', () => {
    render(<RelationshipLongevityIndicator activeDays={5} consistencyScore={20} />);
    expect(screen.getByTestId('longevity-consistency-label')).toHaveTextContent('낮음');
  });

  it('renders the progress bar fill with correct width', () => {
    render(<RelationshipLongevityIndicator activeDays={60} consistencyScore={64} />);
    const fill = screen.getByTestId('longevity-consistency-bar-fill');
    expect(fill).toHaveStyle({ width: '64%' });
  });

  it('renders exactly 0 active days without crashing', () => {
    render(<RelationshipLongevityIndicator activeDays={0} consistencyScore={50} />);
    expect(screen.getByTestId('longevity-active-days-badge')).toHaveTextContent('활성 0일');
  });
});

describe('getActiveDaysFromDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-09T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns correct days from a past ISO date string', () => {
    expect(getActiveDaysFromDate('2026-06-04T12:00:00.000Z')).toBe(5);
  });

  it('returns 0 for a future date', () => {
    expect(getActiveDaysFromDate('2026-06-15T12:00:00.000Z')).toBe(0);
  });

  it('returns 0 for an invalid date string', () => {
    expect(getActiveDaysFromDate('not-a-date')).toBe(0);
  });

  it('accepts a Date object', () => {
    expect(getActiveDaysFromDate(new Date('2026-05-10T12:00:00.000Z'))).toBe(30);
  });
});

describe('getConsistencyLabel', () => {
  it('returns 높음 for score >= 70', () => {
    expect(getConsistencyLabel(70)).toBe('높음');
    expect(getConsistencyLabel(100)).toBe('높음');
    expect(getConsistencyLabel(85)).toBe('높음');
  });

  it('returns 보통 for score 40-69', () => {
    expect(getConsistencyLabel(40)).toBe('보통');
    expect(getConsistencyLabel(65)).toBe('보통');
    expect(getConsistencyLabel(69)).toBe('보통');
  });

  it('returns 낮음 for score < 40', () => {
    expect(getConsistencyLabel(0)).toBe('낮음');
    expect(getConsistencyLabel(39)).toBe('낮음');
    expect(getConsistencyLabel(25)).toBe('낮음');
  });
});
