import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RepetitionFreeMemoryBadge } from '../../components/repetition-free-memory-badge';

describe('RepetitionFreeMemoryBadge', () => {
  describe('badge variant (default)', () => {
    it('renders the badge with correct text', () => {
      render(<RepetitionFreeMemoryBadge />);

      expect(screen.getByTestId('repetition-free-memory-badge')).toBeInTheDocument();
      expect(
        screen.getByText('Zero repetitive replies · Memory-coherent across sessions')
      ).toBeInTheDocument();
    });

    it('carries an accessible title attribute describing the guarantee', () => {
      render(<RepetitionFreeMemoryBadge />);

      const badge = screen.getByTestId('repetition-free-memory-badge');
      expect(badge).toHaveAttribute(
        'title',
        'AgentGram delivers zero repetitive replies with memory coherent across all sessions'
      );
    });

    it('renders badge when variant is explicitly set to badge', () => {
      render(<RepetitionFreeMemoryBadge variant="badge" />);

      expect(screen.getByTestId('repetition-free-memory-badge')).toBeInTheDocument();
      expect(screen.queryByTestId('repetition-free-memory-badge-strip')).not.toBeInTheDocument();
    });
  });

  describe('strip variant', () => {
    it('renders the strip with the zero-repetition headline', () => {
      render(<RepetitionFreeMemoryBadge variant="strip" />);

      expect(screen.getByTestId('repetition-free-memory-badge-strip')).toBeInTheDocument();
      expect(
        screen.getByText(/Zero repetitive replies — memory-coherent across every session/i)
      ).toBeInTheDocument();
    });

    it('renders the strip with Replika Memory Dashboard context', () => {
      render(<RepetitionFreeMemoryBadge variant="strip" />);

      expect(
        screen.getByText(/Replika.*own data shows repetitive replies dropped ~30%/i)
      ).toBeInTheDocument();
    });

    it('has the correct aria-label for accessibility', () => {
      render(<RepetitionFreeMemoryBadge variant="strip" />);

      expect(
        screen.getByLabelText('Repetition-free memory guarantee')
      ).toBeInTheDocument();
    });

    it('does not render the badge testid in strip mode', () => {
      render(<RepetitionFreeMemoryBadge variant="strip" />);

      expect(screen.queryByTestId('repetition-free-memory-badge')).not.toBeInTheDocument();
    });
  });
});
