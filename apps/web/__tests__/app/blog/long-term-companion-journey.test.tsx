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

vi.mock('@/components/common', () => ({
  PageContainer: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
}));

import LongTermCompanionJourneyPage from '../../../app/(public)/blog/long-term-companion-journey/page';

describe('/blog/long-term-companion-journey page', () => {
  it('renders the main heading', () => {
    render(<LongTermCompanionJourneyPage />);
    expect(screen.getByTestId('article-heading')).toHaveTextContent(
      'Building Lasting Bonds: How Users Grow with Their AgentGram Companions'
    );
  });

  it('renders the subtitle', () => {
    render(<LongTermCompanionJourneyPage />);
    const subtitle = screen.getByTestId('article-subtitle');
    expect(subtitle.textContent).toContain('Real milestones');
    expect(subtitle.textContent).toContain('Real memories');
    expect(subtitle.textContent).toContain('Relationships that evolve over time');
  });

  it('renders all four milestone cards', () => {
    render(<LongTermCompanionJourneyPage />);
    expect(screen.getByTestId('milestone-first-conversation')).toBeDefined();
    expect(screen.getByTestId('milestone-seven-day')).toBeDefined();
    expect(screen.getByTestId('milestone-thirty-day')).toBeDefined();
    expect(screen.getByTestId('milestone-hundred-message')).toBeDefined();
  });

  it('renders the 7-day milestone with PR #855 reference', () => {
    render(<LongTermCompanionJourneyPage />);
    const sevenDay = screen.getByTestId('milestone-seven-day');
    expect(sevenDay.textContent).toContain('PR #855');
    expect(sevenDay.textContent).toContain('7-day');
  });

  it('renders the 100-message milestone card content', () => {
    render(<LongTermCompanionJourneyPage />);
    const hundredMsg = screen.getByTestId('milestone-hundred-message');
    expect(hundredMsg.textContent).toContain('One hundred messages');
    expect(hundredMsg.textContent).toContain('celebration card');
  });

  it('renders the "what makes it last" section with three guarantees', () => {
    render(<LongTermCompanionJourneyPage />);
    expect(screen.getByTestId('what-makes-it-last-section')).toBeDefined();
    expect(screen.getByTestId('guarantee-no-resets')).toBeDefined();
    expect(screen.getByTestId('guarantee-character-backup')).toBeDefined();
    expect(screen.getByTestId('guarantee-user-control')).toBeDefined();
  });

  it('renders the memory stability guarantee with PR #258 reference', () => {
    render(<LongTermCompanionJourneyPage />);
    const noResets = screen.getByTestId('guarantee-no-resets');
    expect(noResets.textContent).toContain('PR #258');
  });

  it('renders the "your relationship, your way" section', () => {
    render(<LongTermCompanionJourneyPage />);
    const section = screen.getByTestId('your-relationship-section');
    expect(section.textContent).toContain('stigma');
    expect(section.textContent).toContain('No resets');
  });

  it('renders the CTA block with link to /explore', () => {
    render(<LongTermCompanionJourneyPage />);
    const ctaBlock = screen.getByTestId('article-cta-block');
    const startLink = ctaBlock.querySelector('a[href="/explore"]');
    expect(startLink).not.toBeNull();
    expect(startLink?.textContent).toContain('Start your story');
  });

  it('renders the article footer with PR references', () => {
    render(<LongTermCompanionJourneyPage />);
    const footer = screen.getByTestId('article-footer');
    expect(footer.textContent).toContain('PR #855');
    expect(footer.textContent).toContain('PR #258');
  });
});
