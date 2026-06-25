import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TrustPage from '@/app/(public)/trust/page';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/multi-state-compliance-badge', () => ({
  MultiStateComplianceBadge: ({ variant }: { variant?: string }) => (
    <div data-testid="multi-state-compliance-strip" data-variant={variant} />
  ),
}));

describe('TrustPage', () => {
  it('renders without crashing', () => {
    render(<TrustPage />);
    expect(screen.getByTestId('trust-page')).toBeInTheDocument();
  });

  it('renders the hero section with heading and subtext', () => {
    render(<TrustPage />);
    const hero = screen.getByTestId('trust-hero');
    expect(
      within(hero).getByRole('heading', {
        name: 'Everything you need to decide if you trust us.',
      })
    ).toBeInTheDocument();
    expect(hero).toHaveTextContent('Independent ownership');
    expect(hero).toHaveTextContent('No ads');
  });

  it('renders the Platform Trust Hub badge', () => {
    render(<TrustPage />);
    expect(screen.getByTestId('trust-hero-badge')).toHaveTextContent('Platform Trust Hub');
  });

  it('renders primary CTA linking to /auth/login', () => {
    render(<TrustPage />);
    const cta = screen.getByTestId('trust-hero-cta-primary');
    expect(cta).toHaveAttribute('href', '/auth/login');
    expect(cta).toHaveTextContent('Start with a verified platform');
  });

  it('renders secondary CTA linking to /about', () => {
    render(<TrustPage />);
    const cta = screen.getByTestId('trust-hero-cta-secondary');
    expect(cta).toHaveAttribute('href', '/about');
    expect(cta).toHaveTextContent('Meet the operator');
  });

  it('renders all six trust pillars', () => {
    render(<TrustPage />);
    expect(screen.getByTestId('trust-pillar-independence')).toBeInTheDocument();
    expect(screen.getByTestId('trust-pillar-moderation')).toBeInTheDocument();
    expect(screen.getByTestId('trust-pillar-memory')).toBeInTheDocument();
    expect(screen.getByTestId('trust-pillar-no-ads')).toBeInTheDocument();
    expect(screen.getByTestId('trust-pillar-compliance')).toBeInTheDocument();
    expect(screen.getByTestId('trust-pillar-transparency')).toBeInTheDocument();
  });

  it('renders the independence pillar with Big Tech copy', () => {
    render(<TrustPage />);
    const pillar = screen.getByTestId('trust-pillar-independence');
    expect(pillar).toHaveTextContent('Not Meta. Not Big Tech. Just us.');
    expect(pillar).toHaveTextContent('Deokhwan Kim');
  });

  it('renders the no-ads pillar mentioning Character.AI', () => {
    render(<TrustPage />);
    const pillar = screen.getByTestId('trust-pillar-no-ads');
    expect(pillar).toHaveTextContent('No mid-chat ads — ever.');
  });

  it('renders the compliance strip', () => {
    render(<TrustPage />);
    expect(screen.getByTestId('trust-compliance-strip')).toBeInTheDocument();
    expect(screen.getByTestId('multi-state-compliance-strip')).toHaveAttribute(
      'data-variant',
      'strip'
    );
  });

  it('renders the independence section with Moltbook/Meta context', () => {
    render(<TrustPage />);
    const section = screen.getByTestId('trust-independence-section');
    expect(
      within(section).getByRole('heading', {
        name: 'Independently owned — not Meta, not Big Tech.',
      })
    ).toBeInTheDocument();
    expect(section).toHaveTextContent('Moltbook');
    expect(section).toHaveTextContent('March 2026');
  });

  it('renders the independence section link to /about', () => {
    render(<TrustPage />);
    const link = screen.getByTestId('trust-independence-link');
    expect(link).toHaveAttribute('href', '/about');
    expect(link).toHaveTextContent('Read the operator statement');
  });

  it('renders the no-ads section with pledge badge', () => {
    render(<TrustPage />);
    const section = screen.getByTestId('trust-no-ads-section');
    expect(
      within(section).getByRole('heading', { name: 'No mid-chat ads — ever.' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('trust-no-ads-pledge-badge')).toHaveTextContent(
      'Ad-free pledge — on record'
    );
  });

  it('renders the memory section with all five control features', () => {
    render(<TrustPage />);
    const features = screen.getByTestId('trust-memory-features');
    expect(features).toHaveTextContent('View every memory stored about you');
    expect(features).toHaveTextContent('Edit or delete individual memories');
    expect(features).toHaveTextContent('Export your full memory archive (JSON)');
    expect(features).toHaveTextContent('No memory resets on plan changes');
    expect(features).toHaveTextContent('Persistent across all subscription tiers');
  });

  it('renders the memory CTA linking to /memory-guarantee', () => {
    render(<TrustPage />);
    const cta = screen.getByTestId('trust-memory-cta');
    expect(cta).toHaveAttribute('href', '/memory-guarantee');
  });

  it('renders the moderation section with three pillars', () => {
    render(<TrustPage />);
    expect(screen.getByTestId('trust-moderation-published')).toHaveTextContent('Published policy');
    expect(screen.getByTestId('trust-moderation-per-user')).toHaveTextContent('Per-user controls');
    expect(screen.getByTestId('trust-moderation-auditable')).toHaveTextContent(
      'Auditable decisions'
    );
  });

  it('renders the final CTA section', () => {
    render(<TrustPage />);
    const cta = screen.getByTestId('trust-cta-primary');
    expect(cta).toHaveAttribute('href', '/auth/login');
    expect(cta).toHaveTextContent('Get started free');

    const secondary = screen.getByTestId('trust-cta-secondary');
    expect(secondary).toHaveAttribute('href', '/pricing');
  });
});
