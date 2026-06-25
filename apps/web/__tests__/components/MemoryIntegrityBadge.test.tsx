import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryIntegrityBadge } from '../../components/shared/MemoryIntegrityBadge';

describe('MemoryIntegrityBadge', () => {
  it('renders without errors (compact variant by default)', () => {
    render(<MemoryIntegrityBadge />);
    expect(screen.getByTestId('memory-integrity-badge-compact')).toBeInTheDocument();
  });

  it('links to /trust', () => {
    render(<MemoryIntegrityBadge />);
    const link = screen.getByTestId('memory-integrity-badge-compact');
    expect(link).toHaveAttribute('href', '/trust');
  });

  it('displays "Memory Integrity" badge text', () => {
    render(<MemoryIntegrityBadge />);
    expect(screen.getByText('Memory Integrity Guaranteed')).toBeInTheDocument();
  });

  describe('full variant', () => {
    it('renders without errors', () => {
      render(<MemoryIntegrityBadge variant="full" />);
      expect(screen.getByTestId('memory-integrity-badge-full')).toBeInTheDocument();
    });

    it('link to /trust is present in full variant', () => {
      render(<MemoryIntegrityBadge variant="full" />);
      const link = screen.getByTestId('memory-integrity-badge-link');
      expect(link).toHaveAttribute('href', '/trust');
    });

    it('displays "Memory Integrity" text in full variant', () => {
      render(<MemoryIntegrityBadge variant="full" />);
      expect(screen.getAllByText('Memory Integrity Guaranteed').length).toBeGreaterThan(0);
    });
  });
});
