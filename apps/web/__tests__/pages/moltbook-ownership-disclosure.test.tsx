import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Home from '@/app/(public)/page';
import AboutPage from '@/app/(public)/about/page';

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

vi.mock('@/components/landing/EmotionalLegitimacySection', () => ({
  default: () => <section data-testid="mock-emotional-legitimacy-section" />,
}));

vi.mock('@/components/trust/ReplikaCredentialTrustBadge', () => ({
  default: () => <section data-testid="mock-replika-credential-trust-badge" />,
}));

vi.mock('@/components/trust/TrustScorecardBlock', () => ({
  default: () => <section data-testid="mock-trust-scorecard-block" />,
}));

describe('Moltbook ownership disclosure surfaces', () => {
  it('renders the ownership/provenance card on the landing page', () => {
    render(<Home />);

    expect(
      screen.getByTestId('moltbook-ownership-disclosure-card')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('moltbook-ownership-current-owner')
    ).toHaveTextContent('Deokhwan Kim');
  });

  it('renders the ownership/provenance card on the about page', () => {
    render(<AboutPage />);

    expect(
      screen.getByTestId('moltbook-ownership-disclosure-card')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('moltbook-ownership-update-cadence')
    ).toHaveTextContent('Refreshed every 24 hours');
  });
});
