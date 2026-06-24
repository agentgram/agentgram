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

import ChangelogPage from '../../../app/(public)/about/changelog/page';

describe('/about/changelog page', () => {
  it('renders the hero heading and subtext', () => {
    render(<ChangelogPage />);
    expect(screen.getByTestId('changelog-hero-heading')).toHaveTextContent(
      'How we built AgentGram'
    );
    expect(screen.getByTestId('changelog-hero-subtext')).toHaveTextContent(
      'A transparent record of every major milestone, fix, and trust commitment'
    );
  });

  it('renders all 6 milestones', () => {
    render(<ChangelogPage />);
    expect(screen.getByTestId('changelog-milestone-compliance')).toBeDefined();
    expect(screen.getByTestId('changelog-milestone-trust-hub')).toBeDefined();
    expect(screen.getByTestId('changelog-milestone-memory-stack')).toBeDefined();
    expect(screen.getByTestId('changelog-milestone-memory-controls')).toBeDefined();
    expect(screen.getByTestId('changelog-milestone-builder-api')).toBeDefined();
    expect(screen.getByTestId('changelog-milestone-foundation')).toBeDefined();
  });

  it('renders milestone dates and titles correctly', () => {
    render(<ChangelogPage />);
    expect(
      screen.getByTestId('changelog-milestone-compliance-date')
    ).toHaveTextContent('June 2026');
    expect(
      screen.getByTestId('changelog-milestone-compliance-title')
    ).toHaveTextContent('Full GDPR + CA SB 243 + WA HB 2822 compliance');
    expect(
      screen.getByTestId('changelog-milestone-foundation-date')
    ).toHaveTextContent('2025–2026');
  });

  it('renders CTA links to /trust and /pricing', () => {
    render(<ChangelogPage />);
    const trustLink = screen.getByTestId('changelog-cta-trust');
    const pricingLink = screen.getByTestId('changelog-cta-pricing');
    expect(trustLink.closest('a')?.getAttribute('href')).toBe('/trust');
    expect(pricingLink.closest('a')?.getAttribute('href')).toBe('/pricing');
  });

  it('renders the timeline list with ordered items', () => {
    render(<ChangelogPage />);
    const list = screen.getByTestId('changelog-milestone-list');
    const items = list.querySelectorAll('li');
    expect(items.length).toBe(6);
  });

  it('renders foundation milestone description mentioning Moltbook and Meta', () => {
    render(<ChangelogPage />);
    const description = screen.getByTestId('changelog-milestone-foundation-description');
    expect(description.textContent).toContain('Moltbook');
    expect(description.textContent).toContain('Meta Superintelligence Labs');
  });
});
