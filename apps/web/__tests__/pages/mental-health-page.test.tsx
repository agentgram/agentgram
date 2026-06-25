import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MentalHealthGuidancePage from '@/app/(public)/safety/mental-health/page';

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

describe('MentalHealthGuidancePage', () => {
  it('renders the page root without crashing', () => {
    render(<MentalHealthGuidancePage />);
    expect(screen.getByTestId('mental-health-page')).toBeInTheDocument();
  });

  it('renders the hero heading with correct text', () => {
    render(<MentalHealthGuidancePage />);
    const hero = screen.getByTestId('mh-hero');
    expect(within(hero).getByRole('heading', { level: 1 })).toHaveTextContent(
      'Mental Health & AI Companionship'
    );
    expect(screen.getByTestId('mh-hero-badge')).toHaveTextContent('Mental Health Guidance');
  });

  it('renders the responsible use section with heading and callout', () => {
    render(<MentalHealthGuidancePage />);
    expect(screen.getByTestId('mh-responsible-use-section')).toBeInTheDocument();
    expect(screen.getByTestId('mh-responsible-use-heading')).toHaveTextContent(
      'AI as complement, not replacement'
    );
    expect(screen.getByTestId('mh-responsible-use-callout')).toBeInTheDocument();
  });

  it('renders the seek-help section with warning signals list', () => {
    render(<MentalHealthGuidancePage />);
    expect(screen.getByTestId('mh-seek-help-section')).toBeInTheDocument();
    expect(screen.getByTestId('mh-seek-help-heading')).toHaveTextContent(
      'When to seek professional support'
    );
    const signalItems = screen.getAllByTestId(/^mh-warning-signal-\d+$/);
    expect(signalItems.length).toBeGreaterThanOrEqual(5);
  });

  it('renders the design philosophy section with all three principles', () => {
    render(<MentalHealthGuidancePage />);
    expect(screen.getByTestId('mh-philosophy-section')).toBeInTheDocument();
    expect(screen.getByTestId('mh-principle-relationship-health')).toBeInTheDocument();
    expect(screen.getByTestId('mh-principle-autonomy')).toBeInTheDocument();
    expect(screen.getByTestId('mh-principle-escalation')).toBeInTheDocument();
  });

  it('renders crisis resources with 988 and Crisis Text Line', () => {
    render(<MentalHealthGuidancePage />);
    const section = screen.getByTestId('mh-crisis-resources-section');
    expect(within(section).getByTestId('mh-crisis-988')).toHaveAttribute('href', 'tel:988');
    expect(within(section).getByTestId('mh-crisis-text')).toHaveAttribute(
      'href',
      'sms:741741?body=HOME'
    );
  });

  it('renders the back link to /safety', () => {
    render(<MentalHealthGuidancePage />);
    const backLink = screen.getByTestId('mh-back-link');
    expect(backLink).toHaveAttribute('href', '/safety');
  });

  it('renders the IASP international resources link', () => {
    render(<MentalHealthGuidancePage />);
    const iaspLink = screen.getByTestId('mh-crisis-iasp-link');
    expect(iaspLink).toHaveAttribute('href', 'https://www.iasp.info/resources/Crisis_Centres/');
    expect(iaspLink).toHaveAttribute('target', '_blank');
    expect(iaspLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
