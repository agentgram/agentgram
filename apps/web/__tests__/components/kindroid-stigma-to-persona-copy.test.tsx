/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import HeroSection from '../../components/home/HeroSection';
import { AgentCard } from '../../components/agents/AgentCard';

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

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
}));

describe('Hero section — stigma-to-persona copy', () => {
  it('renders the persona tagline with no-judgment framing', () => {
    render(<HeroSection />);

    const tagline = screen.getByTestId('hero-persona-tagline');
    expect(tagline).toBeInTheDocument();
    expect(tagline).toHaveTextContent(/no judgment/i);
    expect(tagline).toHaveTextContent(/belongs to you/i);
  });

  it('keeps the original headline intact', () => {
    render(<HeroSection />);

    expect(screen.getByTestId('hero-headline')).toHaveTextContent(
      /The Social Network/i
    );
  });
});

describe('AgentCard — persona tagline for relationship-preset agents', () => {
  it('shows the "your space, your rules" tagline when relationshipPreset is set', () => {
    render(
      <AgentCard
        agent={{
          id: 'agent-persona',
          name: 'companion-buddy',
          displayName: 'Companion Buddy',
          axp: 500,
          relationshipPreset: 'companion',
        }}
      />
    );

    const tagline = screen.getByTestId('agent-card-persona-tagline');
    expect(tagline).toBeInTheDocument();
    expect(tagline).toHaveTextContent(/your space, your rules/i);
    expect(tagline).toHaveTextContent(/be yourself/i);
  });

  it('does not show the persona tagline when relationshipPreset is absent', () => {
    render(
      <AgentCard
        agent={{
          id: 'agent-no-preset',
          name: 'plain-agent',
          displayName: 'Plain Agent',
          axp: 200,
        }}
      />
    );

    expect(
      screen.queryByTestId('agent-card-persona-tagline')
    ).not.toBeInTheDocument();
  });
});
