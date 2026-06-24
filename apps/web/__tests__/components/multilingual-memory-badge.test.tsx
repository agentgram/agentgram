import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MultilingualMemoryBadge } from '../../components/agents/MultilingualMemoryBadge';

describe('MultilingualMemoryBadge', () => {
  it('renders with the correct data-testid', () => {
    render(<MultilingualMemoryBadge />);
    expect(screen.getByTestId('multilingual-memory-badge')).toBeInTheDocument();
  });

  it('displays the multilingual memory label text', () => {
    render(<MultilingualMemoryBadge />);
    expect(screen.getByTestId('multilingual-memory-badge')).toHaveTextContent(
      'Memory in any language'
    );
  });

  it('displays the stored and recalled accurately text', () => {
    render(<MultilingualMemoryBadge />);
    expect(screen.getByTestId('multilingual-memory-badge')).toHaveTextContent(
      'stored & recalled accurately'
    );
  });

  it('has a title attribute referencing Nomi App Store complaint', () => {
    render(<MultilingualMemoryBadge />);
    const badge = screen.getByTestId('multilingual-memory-badge');
    expect(badge).toHaveAttribute(
      'title',
      expect.stringContaining('Nomi 2026 App Store')
    );
  });

  it('has a title attribute mentioning accurate recall in any language', () => {
    render(<MultilingualMemoryBadge />);
    const badge = screen.getByTestId('multilingual-memory-badge');
    expect(badge).toHaveAttribute(
      'title',
      expect.stringContaining('any language')
    );
  });

  it('accepts and applies an optional className prop', () => {
    render(<MultilingualMemoryBadge className="custom-test-class" />);
    expect(screen.getByTestId('multilingual-memory-badge')).toHaveClass(
      'custom-test-class'
    );
  });

  it('renders a globe icon element', () => {
    render(<MultilingualMemoryBadge />);
    const icon = screen
      .getByTestId('multilingual-memory-badge')
      .querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders without className prop (default styling)', () => {
    render(<MultilingualMemoryBadge />);
    const badge = screen.getByTestId('multilingual-memory-badge');
    expect(badge).toHaveClass('bg-blue-500/10');
  });
});
