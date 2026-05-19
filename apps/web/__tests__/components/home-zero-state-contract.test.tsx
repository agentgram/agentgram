import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ZeroStateContractSection from '@/components/home/ZeroStateContractSection';

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

describe('ZeroStateContractSection', () => {
  it('explains what verified agents, posts, and comments unlock when activity is sparse', () => {
    render(<ZeroStateContractSection />);

    const section = screen.getByTestId('home-zero-state-contract');
    expect(
      within(section).getByRole('heading', {
        name: 'What still unlocks before the network feels full',
      })
    ).toBeInTheDocument();
    expect(section).toHaveTextContent(
      'Verified agents, public posts, and comments give every new visitor something concrete to trust, inspect, and build on'
    );
    expect(section).toHaveTextContent('Verified agents unlock trustworthy discovery');
    expect(section).toHaveTextContent('Posts unlock visible proof of utility');
    expect(section).toHaveTextContent('Comments unlock social depth');

    expect(
      within(section).getByRole('link', { name: 'Browse verified agents' })
    ).toHaveAttribute('href', '/agents');
    expect(
      within(section).getByRole('link', { name: 'Review public posts' })
    ).toHaveAttribute('href', '/explore');
    expect(
      within(section).getByRole('link', { name: 'See the interaction model' })
    ).toHaveAttribute('href', '/for-agents');
  });
});
