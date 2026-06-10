import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import NomiApiEcosystemSection from '@/components/for-agents/NomiApiEcosystemSection';

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

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe('NomiApiEcosystemSection', () => {
  it('renders the section with the correct data-testid', () => {
    render(<NomiApiEcosystemSection />);
    expect(
      screen.getByTestId('nomi-api-ecosystem-section')
    ).toBeInTheDocument();
  });

  it('renders the heading mentioning third-party integrations', () => {
    render(<NomiApiEcosystemSection />);
    const section = screen.getByTestId('nomi-api-ecosystem-section');
    expect(
      within(section).getByRole('heading', {
        name: /third-party integrations/i,
      })
    ).toBeInTheDocument();
  });

  it('references Nomi in the description copy', () => {
    render(<NomiApiEcosystemSection />);
    const section = screen.getByTestId('nomi-api-ecosystem-section');
    expect(section).toHaveTextContent('Nomi');
  });

  it('mentions Slack integration category', () => {
    render(<NomiApiEcosystemSection />);
    const section = screen.getByTestId('nomi-api-ecosystem-section');
    expect(section).toHaveTextContent('Slack');
  });

  it('mentions VR / spatial computing integration category', () => {
    render(<NomiApiEcosystemSection />);
    const section = screen.getByTestId('nomi-api-ecosystem-section');
    expect(section).toHaveTextContent('VR');
    expect(section).toHaveTextContent('Spatial Computing');
  });

  it('mentions productivity tools integration category', () => {
    render(<NomiApiEcosystemSection />);
    const section = screen.getByTestId('nomi-api-ecosystem-section');
    expect(section).toHaveTextContent('Productivity Tools');
  });

  it('mentions Custom Platforms integration category', () => {
    render(<NomiApiEcosystemSection />);
    const section = screen.getByTestId('nomi-api-ecosystem-section');
    expect(section).toHaveTextContent('Custom Platforms');
  });

  it('mentions webhooks integration category', () => {
    render(<NomiApiEcosystemSection />);
    const section = screen.getByTestId('nomi-api-ecosystem-section');
    expect(section).toHaveTextContent('Webhooks');
  });

  it('renders a CTA link to integration guides', () => {
    render(<NomiApiEcosystemSection />);
    const section = screen.getByTestId('nomi-api-ecosystem-section');
    const cta = within(section).getByRole('link', {
      name: /browse integration guides/i,
    });
    expect(cta).toHaveAttribute('href', '/docs/integrations');
  });

  it('has accessible aria-labelledby on the section', () => {
    render(<NomiApiEcosystemSection />);
    const section = screen.getByTestId('nomi-api-ecosystem-section');
    expect(section).toHaveAttribute(
      'aria-labelledby',
      'nomi-api-ecosystem-heading'
    );
  });
});
