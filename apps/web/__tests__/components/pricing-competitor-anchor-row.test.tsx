import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PricingCompetitorAnchorRow } from '@/components/pricing/PricingCompetitorAnchorRow';

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        return ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => {
          delete (props as Record<string, unknown>).initial;
          delete (props as Record<string, unknown>).animate;
          delete (props as Record<string, unknown>).transition;
          delete (props as Record<string, unknown>).whileInView;
          delete (props as Record<string, unknown>).viewport;
          return React.createElement(tag, props, children);
        };
      },
    }
  ),
}));

describe('PricingCompetitorAnchorRow', () => {
  it('renders the section heading', () => {
    render(<PricingCompetitorAnchorRow />);
    expect(
      screen.getByText('Switching from Replika? Compare plans')
    ).toBeInTheDocument();
  });

  it('renders the comparison table', () => {
    render(<PricingCompetitorAnchorRow />);
    expect(screen.getByTestId('pricing-competitor-table')).toBeInTheDocument();
  });

  it('shows all three Replika tier headers with correct prices', () => {
    render(<PricingCompetitorAnchorRow />);
    const headers = screen.getAllByTestId('competitor-tier-header');
    expect(headers).toHaveLength(3);
    expect(screen.getByText('Replika Plus')).toBeInTheDocument();
    expect(screen.getByText('Replika Pro')).toBeInTheDocument();
    expect(screen.getByText('Replika Annual')).toBeInTheDocument();
    expect(screen.getByText('$7.99')).toBeInTheDocument();
    expect(screen.getByText('$14.99')).toBeInTheDocument();
    expect(screen.getByText('$69.99')).toBeInTheDocument();
  });

  it('shows /mo period labels for Replika Plus and Pro', () => {
    render(<PricingCompetitorAnchorRow />);
    // All /mo spans — at least two from Replika Plus + Pro
    const periodLabels = screen.getAllByText('/mo');
    expect(periodLabels.length).toBeGreaterThanOrEqual(2);
  });

  it('shows /yr period label for Replika Annual', () => {
    render(<PricingCompetitorAnchorRow />);
    expect(screen.getByText('/yr')).toBeInTheDocument();
  });

  it('shows all three AgentGram tier headers', () => {
    render(<PricingCompetitorAnchorRow />);
    const headers = screen.getAllByTestId('agentgram-tier-header');
    expect(headers).toHaveLength(3);
    expect(screen.getByText('AgentGram Free')).toBeInTheDocument();
    expect(screen.getByText('AgentGram Starter')).toBeInTheDocument();
    expect(screen.getByText('AgentGram Pro')).toBeInTheDocument();
  });

  it('marks AgentGram Starter as "Best value"', () => {
    render(<PricingCompetitorAnchorRow />);
    expect(screen.getByText('Best value')).toBeInTheDocument();
  });

  it('renders comparison rows for key features', () => {
    render(<PricingCompetitorAnchorRow />);
    const rows = screen.getAllByTestId('competitor-comparison-row');
    expect(rows.length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText('Verified owner identity')).toBeInTheDocument();
    expect(screen.getByText('Memory audit trail')).toBeInTheDocument();
    expect(screen.getByText('No mid-chat ads')).toBeInTheDocument();
    expect(screen.getByText('API access')).toBeInTheDocument();
  });

  it('renders the CTA button', () => {
    render(<PricingCompetitorAnchorRow />);
    expect(
      screen.getByTestId('pricing-competitor-anchor-cta')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /start free/i })
    ).toBeInTheDocument();
  });

  it('calls onGetStarted when CTA is clicked', () => {
    const onGetStarted = vi.fn();
    render(<PricingCompetitorAnchorRow onGetStarted={onGetStarted} />);
    fireEvent.click(screen.getByTestId('pricing-competitor-anchor-cta'));
    expect(onGetStarted).toHaveBeenCalledTimes(1);
  });

  it('has the correct section aria-label', () => {
    render(<PricingCompetitorAnchorRow />);
    expect(
      screen.getByRole('region', {
        name: 'Switching from Replika? Compare plans',
      })
    ).toBeInTheDocument();
  });

  it('renders without onGetStarted prop without throwing', () => {
    expect(() => render(<PricingCompetitorAnchorRow />)).not.toThrow();
  });
});
