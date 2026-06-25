import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRelationshipTimeline } from '../../components/memory/MemoryRelationshipTimeline';

describe('MemoryRelationshipTimeline', () => {
  it('renders the "Your shared history" heading', () => {
    render(<MemoryRelationshipTimeline />);
    expect(screen.getByText('Your shared history')).toBeInTheDocument();
  });

  it('displays formatted relationship start date', () => {
    render(<MemoryRelationshipTimeline relationshipStartDate="2025-01-15T00:00:00.000Z" />);
    const el = screen.getByTestId('memory-relationship-start-date');
    expect(el.textContent).toMatch(/January 15, 2025/);
  });

  it('displays formatted first memory date', () => {
    render(<MemoryRelationshipTimeline firstFactDate="2025-03-20T00:00:00.000Z" />);
    const el = screen.getByTestId('memory-first-fact-date');
    expect(el.textContent).toMatch(/March 20, 2025/);
  });

  it('shows dash when no dates are provided', () => {
    render(<MemoryRelationshipTimeline />);
    const startEl = screen.getByTestId('memory-relationship-start-date');
    const firstEl = screen.getByTestId('memory-first-fact-date');
    expect(startEl.textContent).toBe('—');
    expect(firstEl.textContent).toBe('—');
  });

  it('renders correct plural milestone label', () => {
    render(<MemoryRelationshipTimeline milestoneCount={5} />);
    expect(screen.getByTestId('memory-milestone-count')).toHaveTextContent('5 key moments');
  });

  it('renders singular milestone label for count of 1', () => {
    render(<MemoryRelationshipTimeline milestoneCount={1} />);
    expect(screen.getByTestId('memory-milestone-count')).toHaveTextContent('1 key moment');
  });

  it('defaults to 0 milestones when not provided', () => {
    render(<MemoryRelationshipTimeline />);
    expect(screen.getByTestId('memory-milestone-count')).toHaveTextContent('0 key moments');
  });

  it('has correct aria-label for accessibility', () => {
    render(<MemoryRelationshipTimeline />);
    expect(screen.getByRole('region', { name: /your shared history/i }) ??
      screen.getByLabelText('Your shared history')).toBeTruthy();
  });
});
