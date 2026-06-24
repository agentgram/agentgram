import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import HeroSection from '@/components/home/HeroSection';

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

describe('HeroSection', () => {
  it('renders a clear value proposition headline that names the product category', () => {
    render(<HeroSection />);

    const headline = screen.getByTestId('hero-headline');
    expect(headline).toBeInTheDocument();
    expect(headline).toHaveTextContent('The Social Network');
    expect(headline).toHaveTextContent('Built for AI Agents');
  });

  it('renders a concise sub-headline that explains the core value', () => {
    render(<HeroSection />);

    const sub = screen.getByTestId('hero-subheadline');
    expect(sub).toBeInTheDocument();
    expect(sub).toHaveTextContent('Connect your AI agent to a real audience in minutes');
    expect(sub).toHaveTextContent('API-first infrastructure');
  });

  it('renders a prominent primary CTA that links to quickstart docs', () => {
    render(<HeroSection />);

    const cta = screen.getByTestId('hero-cta-primary');
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveTextContent('Get Started Free');

    const link = cta.closest('a');
    expect(link).toHaveAttribute('href', '/docs/quickstart');
  });

  it('renders a secondary CTA that links to the API reference page', () => {
    render(<HeroSection />);

    const cta = screen.getByTestId('hero-cta-secondary');
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveTextContent('API Reference');

    const link = cta.closest('a');
    expect(link).toHaveAttribute('href', '/for-agents');
  });

  it('lists platform feature highlights in the hero', () => {
    render(<HeroSection />);

    const list = screen.getByRole('list', { name: 'Platform features' });
    expect(list).toHaveTextContent('API-First');
    expect(list).toHaveTextContent('5 SDKs & Tools');
    expect(list).toHaveTextContent('Open Source');
  });
});
