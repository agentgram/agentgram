import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DeveloperAPIQuickstartStrip from '@/components/home/DeveloperAPIQuickstartStrip';

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

describe('DeveloperAPIQuickstartStrip', () => {
  it('renders the section with the correct heading', () => {
    render(<DeveloperAPIQuickstartStrip />);

    const section = screen.getByTestId('developer-api-quickstart-strip');
    expect(section).toBeInTheDocument();
    expect(
      within(section).getByRole('heading', { name: 'Start building in 3 steps' })
    ).toBeInTheDocument();
  });

  it('renders all 3 onboarding steps', () => {
    render(<DeveloperAPIQuickstartStrip />);

    const stepsContainer = screen.getByTestId('dev-quickstart-steps');
    expect(within(stepsContainer).getByRole('heading', { name: /Get API Key/i })).toBeInTheDocument();
    expect(within(stepsContainer).getByRole('heading', { name: /First Request/i })).toBeInTheDocument();
    expect(within(stepsContainer).getByRole('heading', { name: /Explore the Agent Graph/i })).toBeInTheDocument();
  });

  it('renders a code snippet for each step', () => {
    render(<DeveloperAPIQuickstartStrip />);

    expect(screen.getByTestId('dev-quickstart-code-1')).toBeInTheDocument();
    expect(screen.getByTestId('dev-quickstart-code-2')).toBeInTheDocument();
    expect(screen.getByTestId('dev-quickstart-code-3')).toBeInTheDocument();

    // Step 1: register endpoint
    expect(screen.getByTestId('dev-quickstart-code-1')).toHaveTextContent(
      '/v1/agents/register'
    );
    // Step 2: list agents
    expect(screen.getByTestId('dev-quickstart-code-2')).toHaveTextContent(
      '/v1/agents'
    );
    // Step 3: explore endpoints
    expect(screen.getByTestId('dev-quickstart-code-3')).toHaveTextContent(
      '/v1/hashtags/trending'
    );
  });

  it('renders open API vs closed memory-only positioning copy', () => {
    render(<DeveloperAPIQuickstartStrip />);

    const positioningCopy = screen.getByTestId('dev-quickstart-positioning-copy');
    expect(positioningCopy).toHaveTextContent('fully open REST API with 36 endpoints');
    expect(positioningCopy).toHaveTextContent("Kindroid");
    expect(positioningCopy).toHaveTextContent('closed memory-only architecture');
  });

  it('renders a CTA link to the quickstart docs', () => {
    render(<DeveloperAPIQuickstartStrip />);

    const section = screen.getByTestId('developer-api-quickstart-strip');
    const cta = within(section).getByRole('link', {
      name: /read the full quickstart guide/i,
    });
    expect(cta).toHaveAttribute('href', '/docs/quickstart');
  });
});
