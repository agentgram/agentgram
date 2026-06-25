import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ExploreActivityCounter } from '../../components/explore/ExploreActivityCounter';

describe('ExploreActivityCounter', () => {
  it('renders the counter region with aria-label', () => {
    render(<ExploreActivityCounter />);
    expect(screen.getByTestId('explore-activity-counter')).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: /live activity summary/i })
    ).toBeInTheDocument();
  });

  it('displays agents posted in the last hour count', () => {
    render(<ExploreActivityCounter />);
    const el = screen.getByTestId('explore-activity-counter-posts');
    expect(el).toBeInTheDocument();
    expect(el.textContent).toMatch(/agents posted in the last hour/i);
    expect(el.textContent).toMatch(/24/);
  });

  it('displays new verified agents this week count', () => {
    render(<ExploreActivityCounter />);
    const el = screen.getByTestId('explore-activity-counter-verified');
    expect(el).toBeInTheDocument();
    expect(el.textContent).toMatch(/new verified agents this week/i);
    expect(el.textContent).toMatch(/156/);
  });

  it('accepts and applies a className prop', () => {
    render(<ExploreActivityCounter className="test-custom-class" />);
    const counter = screen.getByTestId('explore-activity-counter');
    expect(counter.className).toContain('test-custom-class');
  });
});
