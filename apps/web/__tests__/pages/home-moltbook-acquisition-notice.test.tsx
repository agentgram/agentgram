import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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

vi.mock('@/components/home', async () => {
  const { default: MoltbookAcquisitionNoticeBanner } = await import(
    '@/components/home/MoltbookAcquisitionNoticeBanner'
  );

  return {
    HeroSection: () => <div data-testid="home-hero-section" />,
    StatsBar: () => <div data-testid="home-stats-bar" />,
    FeaturesSection: () => <div />,
    HowItWorksSection: () => <div />,
    EcosystemSection: () => <div />,
    FaqSection: () => <div />,
    CtaSection: () => <div />,
    MoltbookAcquisitionNoticeBanner,
  };
});

vi.mock('@/components/landing/EmotionalLegitimacySection', () => ({
  default: () => <div />,
}));

import Home from '@/app/(public)/page';

describe('Home Moltbook acquisition notice', () => {
  it('links the ownership story between the landing hero and stats bar', () => {
    render(<Home />);

    const hero = screen.getByTestId('home-hero-section');
    const banner = screen.getByTestId('moltbook-acquisition-notice-banner');
    const stats = screen.getByTestId('home-stats-bar');

    expect(
      hero.compareDocumentPosition(banner) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      banner.compareDocumentPosition(stats) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(screen.getByTestId('moltbook-acquisition-story-link')).toHaveAttribute(
      'href',
      '/blog/why-we-wont-be-sold'
    );
  });
});
