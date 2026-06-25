import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    asChild,
    ...rest
  }: {
    children: React.ReactNode;
    asChild?: boolean;
    [key: string]: unknown;
  }) => {
    if (asChild && React.isValidElement(children)) {
      return children;
    }
    return <button {...rest}>{children}</button>;
  },
}));

import { FilterEffectExplainer } from '../../components/agents/FilterEffectExplainer';

describe('FilterEffectExplainer', () => {
  describe('filtered effect', () => {
    it('renders the explainer card with correct testid', () => {
      render(<FilterEffectExplainer effect="filtered" />);
      expect(screen.getByTestId('filter-effect-explainer')).toBeInTheDocument();
    });

    it('sets data-effect attribute to "filtered"', () => {
      render(<FilterEffectExplainer effect="filtered" />);
      expect(screen.getByTestId('filter-effect-explainer')).toHaveAttribute(
        'data-effect',
        'filtered'
      );
    });

    it('displays "Content Filtered" title', () => {
      render(<FilterEffectExplainer effect="filtered" />);
      expect(screen.getByTestId('filter-effect-title')).toHaveTextContent('Content Filtered');
    });

    it('renders action button linking to /docs/content-policy', () => {
      render(<FilterEffectExplainer effect="filtered" />);
      const action = screen.getByTestId('filter-effect-action');
      expect(action).toBeInTheDocument();
      expect(action.closest('a') ?? action).toHaveAttribute('href', '/docs/content-policy');
    });
  });

  describe('hidden effect', () => {
    it('sets data-effect attribute to "hidden"', () => {
      render(<FilterEffectExplainer effect="hidden" />);
      expect(screen.getByTestId('filter-effect-explainer')).toHaveAttribute(
        'data-effect',
        'hidden'
      );
    });

    it('displays "Content Hidden" title', () => {
      render(<FilterEffectExplainer effect="hidden" />);
      expect(screen.getByTestId('filter-effect-title')).toHaveTextContent('Content Hidden');
    });

    it('renders action button linking to /dashboard/tune', () => {
      render(<FilterEffectExplainer effect="hidden" />);
      const action = screen.getByTestId('filter-effect-action');
      expect(action.closest('a') ?? action).toHaveAttribute('href', '/dashboard/tune');
    });
  });

  describe('deprioritized effect', () => {
    it('displays "Deprioritized in Discovery" title', () => {
      render(<FilterEffectExplainer effect="deprioritized" />);
      expect(screen.getByTestId('filter-effect-title')).toHaveTextContent(
        'Deprioritized in Discovery'
      );
    });

    it('sets data-effect attribute to "deprioritized"', () => {
      render(<FilterEffectExplainer effect="deprioritized" />);
      expect(screen.getByTestId('filter-effect-explainer')).toHaveAttribute(
        'data-effect',
        'deprioritized'
      );
    });
  });

  describe('characterName prop', () => {
    it('includes character name in description when provided', () => {
      render(<FilterEffectExplainer effect="filtered" characterName="Luna" />);
      expect(screen.getByTestId('filter-effect-description')).toHaveTextContent('"Luna"');
    });

    it('falls back to "This character" when characterName is omitted', () => {
      render(<FilterEffectExplainer effect="hidden" />);
      expect(screen.getByTestId('filter-effect-description')).toHaveTextContent(
        'This character'
      );
    });
  });

  describe('accessibility', () => {
    it('has role="note" on the card', () => {
      render(<FilterEffectExplainer effect="filtered" />);
      expect(screen.getByRole('note')).toBeInTheDocument();
    });

    it('renders guidance text', () => {
      render(<FilterEffectExplainer effect="filtered" />);
      expect(screen.getByTestId('filter-effect-guidance')).toBeInTheDocument();
    });

    it('renders icon element', () => {
      render(<FilterEffectExplainer effect="deprioritized" />);
      expect(screen.getByTestId('filter-effect-icon')).toBeInTheDocument();
    });
  });
});
