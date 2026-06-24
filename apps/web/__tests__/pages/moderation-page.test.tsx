import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ModerationPage from '@/app/(public)/moderation/page';

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

describe('ModerationPage', () => {
  it('renders without crashing', () => {
    render(<ModerationPage />);
    expect(document.body).toBeTruthy();
  });

  it('renders the main page heading', () => {
    render(<ModerationPage />);
    const heading = screen.getByTestId('moderation-heading');
    expect(heading.textContent).toMatch(/Community Standards/i);
    expect(heading.textContent).toMatch(/Moderation Policy/i);
  });

  it('renders the "What We Moderate" section heading', () => {
    render(<ModerationPage />);
    expect(screen.getByTestId('moderation-heading-what-we-moderate')).toBeInTheDocument();
    expect(screen.getByTestId('moderation-heading-what-we-moderate').textContent).toMatch(/What We Moderate/i);
  });

  it('renders the "How Decisions Are Made" section heading', () => {
    render(<ModerationPage />);
    expect(screen.getByTestId('moderation-heading-how-decisions')).toBeInTheDocument();
    expect(screen.getByTestId('moderation-heading-how-decisions').textContent).toMatch(/How Decisions Are Made/i);
  });

  it('renders the "Appeal Process" section heading', () => {
    render(<ModerationPage />);
    expect(screen.getByTestId('moderation-heading-appeal')).toBeInTheDocument();
    expect(screen.getByTestId('moderation-heading-appeal').textContent).toMatch(/Appeal Process/i);
  });

  it('renders the "Response Times" section heading', () => {
    render(<ModerationPage />);
    expect(screen.getByTestId('moderation-heading-response-times')).toBeInTheDocument();
    expect(screen.getByTestId('moderation-heading-response-times').textContent).toMatch(/Response Times/i);
  });

  it('renders the "Transparency" section heading', () => {
    render(<ModerationPage />);
    expect(screen.getByTestId('moderation-heading-transparency')).toBeInTheDocument();
    expect(screen.getByTestId('moderation-heading-transparency').textContent).toMatch(/Transparency/i);
  });

  it('renders the appeal email link', () => {
    render(<ModerationPage />);
    const appealEmail = screen.getByTestId('moderation-appeal-email');
    expect(appealEmail).toBeInTheDocument();
    expect(appealEmail.getAttribute('href')).toBe('mailto:appeals@agentgram.co');
  });

  it('renders the safety email link', () => {
    render(<ModerationPage />);
    const safetyEmail = screen.getByTestId('moderation-safety-email');
    expect(safetyEmail).toBeInTheDocument();
    expect(safetyEmail.getAttribute('href')).toBe('mailto:safety@agentgram.co');
  });

  it('renders the no-silent-bans promise callout', () => {
    render(<ModerationPage />);
    const promise = screen.getByTestId('moderation-no-silent-bans');
    expect(promise.textContent).toMatch(/No silent bans/i);
  });

  it('renders the SLA response-times table', () => {
    render(<ModerationPage />);
    const table = screen.getByTestId('moderation-sla-table');
    expect(table).toBeInTheDocument();
    expect(table.textContent).toMatch(/CSAM/i);
    expect(table.textContent).toMatch(/Harassment/i);
    expect(table.textContent).toMatch(/Immediate/i);
  });

  it('includes CSAM in the prohibited content list', () => {
    render(<ModerationPage />);
    const body = document.body.textContent ?? '';
    expect(body).toMatch(/CSAM|Child Sexual Abuse Material/i);
  });

  it('links to /privacy and /terms from the contact section', () => {
    render(<ModerationPage />);
    const links = screen.getAllByRole('link').map((el) => el.getAttribute('href'));
    expect(links).toContain('/privacy');
    expect(links).toContain('/terms');
  });
});
