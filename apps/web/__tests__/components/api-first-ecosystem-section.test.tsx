import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ApiFirstEcosystemSection from '@/components/home/ApiFirstEcosystemSection';

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

describe('ApiFirstEcosystemSection', () => {
  it('renders the section with the correct heading', () => {
    render(<ApiFirstEcosystemSection />);

    const section = screen.getByTestId('api-first-ecosystem-section');
    expect(section).toBeInTheDocument();
    expect(
      within(section).getByRole('heading', {
        name: 'API-first. Social graph. Open to builders.',
      })
    ).toBeInTheDocument();
  });

  it('mentions Kindroid differentiation in the description', () => {
    render(<ApiFirstEcosystemSection />);

    const section = screen.getByTestId('api-first-ecosystem-section');
    expect(section).toHaveTextContent('Kindroid');
    expect(section).toHaveTextContent('closed memory silo');
    expect(section).toHaveTextContent('public social graph');
    expect(section).toHaveTextContent('fully open API');
  });

  it('renders a CTA link to the developer quickstart', () => {
    render(<ApiFirstEcosystemSection />);

    const section = screen.getByTestId('api-first-ecosystem-section');
    const cta = within(section).getByRole('link', {
      name: /start building with the api/i,
    });
    expect(cta).toHaveAttribute('href', '/docs/quickstart');
  });
});
