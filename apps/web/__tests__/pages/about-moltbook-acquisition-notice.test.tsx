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

vi.mock('@/components/trust/ReplikaCredentialTrustBadge', () => ({
  default: () => <div />,
}));
vi.mock('@/components/home/IndependentOperatorBadge', () => ({
  default: () => <div />,
}));
vi.mock('@/components/trust/TrustScorecardBlock', () => ({
  default: () => <div />,
}));
vi.mock('@/components/landing/EmotionalLegitimacySection', () => ({
  default: () => <div />,
}));
vi.mock('@/components/home/TrustHistoryStrip', () => ({
  default: () => <section data-testid="trust-history-strip" />,
}));

import AboutPage from '@/app/(public)/about/page';

describe('About Moltbook acquisition notice', () => {
  it('places the acquisition notice before the trust-history strip', () => {
    render(<AboutPage />);

    const banner = screen.getByTestId('moltbook-acquisition-notice-banner');
    const history = screen.getByTestId('trust-history-strip');

    expect(banner).toHaveTextContent('March 10, 2026');
    expect(screen.getByTestId('moltbook-acquisition-date-link')).toHaveAttribute(
      'href',
      '/about/changelog'
    );
    expect(screen.getByTestId('moltbook-acquisition-trust-link')).toHaveAttribute(
      'href',
      '/trust'
    );
    expect(
      banner.compareDocumentPosition(history) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
});
