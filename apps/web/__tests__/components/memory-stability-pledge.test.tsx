import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryStabilityPledge } from '../../components/memory-stability-pledge';

describe('MemoryStabilityPledge', () => {
  describe('badge variant (default)', () => {
    it('renders the badge with correct text', () => {
      render(<MemoryStabilityPledge />);

      expect(screen.getByTestId('memory-stability-pledge-badge')).toBeInTheDocument();
      expect(
        screen.getByText('Memory stable across updates')
      ).toBeInTheDocument();
    });

    it('carries an accessible title attribute describing the guarantee', () => {
      render(<MemoryStabilityPledge />);

      const badge = screen.getByTestId('memory-stability-pledge-badge');
      expect(badge).toHaveAttribute(
        'title',
        "AgentGram guarantees memories are never wiped on platform updates"
      );
    });

    it('renders badge when variant is explicitly set to badge', () => {
      render(<MemoryStabilityPledge variant="badge" />);

      expect(screen.getByTestId('memory-stability-pledge-badge')).toBeInTheDocument();
      expect(screen.queryByTestId('memory-stability-pledge-strip')).not.toBeInTheDocument();
    });
  });

  describe('strip variant', () => {
    it('renders the strip with guarantee headline', () => {
      render(<MemoryStabilityPledge variant="strip" />);

      expect(screen.getByTestId('memory-stability-pledge-strip')).toBeInTheDocument();
      expect(
        screen.getByText(/Your memories survive every update — guaranteed/i)
      ).toBeInTheDocument();
    });

    it('renders the strip with contextual Replika reference', () => {
      render(<MemoryStabilityPledge variant="strip" />);

      expect(screen.getByText(/Replika 2\.0 wiped memories on update/i)).toBeInTheDocument();
    });

    it('has the correct aria-label for accessibility', () => {
      render(<MemoryStabilityPledge variant="strip" />);

      expect(
        screen.getByLabelText('Memory stability pledge')
      ).toBeInTheDocument();
    });

    it('does not render the badge testid in strip mode', () => {
      render(<MemoryStabilityPledge variant="strip" />);

      expect(screen.queryByTestId('memory-stability-pledge-badge')).not.toBeInTheDocument();
    });
  });
});
