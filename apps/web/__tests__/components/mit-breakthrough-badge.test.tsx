import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MITBreakthroughBadge from '../../components/home/MITBreakthroughBadge';

describe('MITBreakthroughBadge', () => {
  it('renders with correct test id', () => {
    render(<MITBreakthroughBadge />);
    expect(
      screen.getByTestId('home-mit-breakthrough-badge')
    ).toBeInTheDocument();
  });

  it('displays MIT Technology Review recognition text', () => {
    render(<MITBreakthroughBadge />);
    expect(screen.getByText(/MIT Technology Review/i)).toBeInTheDocument();
    expect(
      screen.getByText(/10 Breakthrough Technologies 2026 — AI Companions/i)
    ).toBeInTheDocument();
  });

  it('displays the market validation stat', () => {
    render(<MITBreakthroughBadge />);
    expect(
      screen.getByText(/\$49B.*\$552B AI companion market projection/i)
    ).toBeInTheDocument();
  });

  it('links to MIT Technology Review homepage', () => {
    render(<MITBreakthroughBadge />);
    const link = screen.getByRole('link', { name: /MIT Technology Review/i });
    expect(link).toHaveAttribute('href', 'https://www.technologyreview.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('has aria-label for accessibility', () => {
    render(<MITBreakthroughBadge />);
    expect(
      screen.getByLabelText('MIT Technology Review recognition')
    ).toBeInTheDocument();
  });
});
