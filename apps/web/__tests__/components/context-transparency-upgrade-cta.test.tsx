import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ContextTransparencyUpgradeCTA } from '@/components/context-transparency-upgrade-cta';

describe('ContextTransparencyUpgradeCTA', () => {
  it('renders without crashing', () => {
    render(<ContextTransparencyUpgradeCTA />);
    expect(
      screen.getByTestId('context-transparency-upgrade-cta')
    ).toBeInTheDocument();
  });

  it('renders the title', () => {
    render(<ContextTransparencyUpgradeCTA />);
    expect(
      screen.getByTestId('context-transparency-upgrade-cta-title')
    ).toHaveTextContent('Privacy-Grade Context Control');
  });

  it('renders the paid tier badge', () => {
    render(<ContextTransparencyUpgradeCTA />);
    expect(
      screen.getByTestId('context-transparency-upgrade-cta-badge')
    ).toBeInTheDocument();
  });

  it('renders the free tier feature list', () => {
    render(<ContextTransparencyUpgradeCTA />);
    const freeList = screen.getByTestId('context-transparency-free-features');
    expect(freeList).toBeInTheDocument();
    expect(freeList).toHaveTextContent(
      'See which context categories were accessed'
    );
  });

  it('renders the paid tier feature list', () => {
    render(<ContextTransparencyUpgradeCTA />);
    const paidList = screen.getByTestId('context-transparency-paid-features');
    expect(paidList).toBeInTheDocument();
    expect(paidList).toHaveTextContent('Full per-source audit log with timestamps');
    expect(paidList).toHaveTextContent('One-click revoke per source');
    expect(paidList).toHaveTextContent('Export your full context history');
  });

  it('upgrade CTA button links to /pricing', () => {
    render(<ContextTransparencyUpgradeCTA />);
    const button = screen.getByTestId('context-transparency-upgrade-cta-button');
    expect(button).toBeInTheDocument();
    // With asChild, the Button renders as the Link (<a>) itself
    expect(button).toHaveAttribute('href', '/pricing');
  });

  it('renders tagline text', () => {
    render(<ContextTransparencyUpgradeCTA />);
    expect(
      screen.getByText(
        'Your conversations, fully transparent. Upgrade for complete visibility.'
      )
    ).toBeInTheDocument();
  });

  it('renders both free and paid tier sections', () => {
    render(<ContextTransparencyUpgradeCTA />);
    expect(screen.getByTestId('context-transparency-free-tier')).toBeInTheDocument();
    expect(screen.getByTestId('context-transparency-paid-tier')).toBeInTheDocument();
  });
});
