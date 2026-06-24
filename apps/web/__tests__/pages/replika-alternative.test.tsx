import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ReplikaAlternativePage from '@/app/(public)/replika-alternative/page';

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

describe('ReplikaAlternativePage', () => {
  it('renders without crashing', () => {
    render(<ReplikaAlternativePage />);
    expect(document.body).toBeTruthy();
  });

  it('renders a heading containing "Replika"', () => {
    render(<ReplikaAlternativePage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toMatch(/Replika/i);
  });

  it('renders a heading containing "Replika Alternative"', () => {
    render(<ReplikaAlternativePage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toMatch(/Replika Alternative/i);
  });

  it('renders a primary CTA link to /', () => {
    render(<ReplikaAlternativePage />);
    const ctaLinks = screen
      .getAllByRole('link')
      .filter((el) => el.getAttribute('href') === '/');
    expect(ctaLinks.length).toBeGreaterThan(0);
    expect(ctaLinks[0].textContent).toMatch(/Try AgentGram Free/i);
  });

  it('renders a comparison table with AgentGram and Replika columns', () => {
    render(<ReplikaAlternativePage />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Replika')).toBeInTheDocument();
    expect(screen.getByText('AgentGram')).toBeInTheDocument();
  });

  it('renders the GDPR safety block mentioning the €5M fine', () => {
    render(<ReplikaAlternativePage />);
    const body = document.body.textContent ?? '';
    expect(body).toMatch(/€5 million|€5M/i);
    expect(body).toMatch(/GDPR/i);
  });
});
