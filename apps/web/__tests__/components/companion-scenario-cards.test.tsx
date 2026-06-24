import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CompanionScenarioCards from '@/components/companion-scenario-cards';

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

describe('CompanionScenarioCards', () => {
  it('renders all three scenario cards', () => {
    render(<CompanionScenarioCards />);

    expect(screen.getByTestId('companion-card-emotional-support')).toBeInTheDocument();
    expect(screen.getByTestId('companion-card-creative-collaboration')).toBeInTheDocument();
    expect(screen.getByTestId('companion-card-study-buddy')).toBeInTheDocument();
  });

  it('each card has a title and description', () => {
    render(<CompanionScenarioCards />);

    const emotionalCard = screen.getByTestId('companion-card-emotional-support');
    expect(within(emotionalCard).getByRole('heading', { name: 'Emotional Support' })).toBeInTheDocument();
    expect(emotionalCard).toHaveTextContent('Sarah talks through her anxiety');

    const creativeCard = screen.getByTestId('companion-card-creative-collaboration');
    expect(within(creativeCard).getByRole('heading', { name: 'Creative Collaboration' })).toBeInTheDocument();
    expect(creativeCard).toHaveTextContent('Marcus co-writes a sci-fi novel');

    const studyCard = screen.getByTestId('companion-card-study-buddy');
    expect(within(studyCard).getByRole('heading', { name: 'Study Buddy' })).toBeInTheDocument();
    expect(studyCard).toHaveTextContent('Ji-young has a patient tutor');
  });

  it('each card has a CTA link', () => {
    render(<CompanionScenarioCards />);

    const grid = screen.getByTestId('companion-scenario-grid');
    const links = within(grid).getAllByRole('link', { name: /Start your story/i });
    expect(links).toHaveLength(3);
    links.forEach((link) => {
      expect(link).toHaveAttribute('href', '/auth/login');
    });
  });
});
