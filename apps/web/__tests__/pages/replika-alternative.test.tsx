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

  it('explains where Replika legacy customization controls moved', () => {
    render(<ReplikaAlternativePage />);
    const body = document.body.textContent ?? '';

    expect(body).toMatch(/late-May update/i);
    expect(body).toMatch(/Wardrobe moved into the Store closet/i);
    expect(body).toMatch(/Eye color now lives in Face editing/i);
    expect(body).toMatch(/Avatar controls are under Profile appearance/i);
  });

  it('renders the Ask Replika prompt rail with AgentGram context framing', () => {
    render(<ReplikaAlternativePage />);
    const body = document.body.textContent ?? '';

    expect(body).toMatch(/Ask Replika alternative/i);
    expect(body).toMatch(/Prompt starters should not feel like another upsell/i);
    expect(body).toMatch(/Pro \/ Advanced AI flow/i);
    expect(body).toMatch(/Give me a grounding exercise for tonight/i);
    expect(body).toMatch(/Help me practice a hard conversation/i);
    expect(body).toMatch(/Turn my messy week into a simple plan/i);
    expect(body).toMatch(/companion remember what you already shared/i);
  });
});
