import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import StoryContinuityResumeChip from '@/components/home/StoryContinuityResumeChip';

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

const DEMO_SESSION = {
  worldName: 'The Silver Realm Chronicles',
  agentName: 'Aria — your story companion',
  resumeHref: '/session/silver-realm-42',
  chapterLabel: 'Chapter 12 · The Convergence',
};

describe('StoryContinuityResumeChip', () => {
  it('renders nothing when lastSession is null', () => {
    const { container } = render(<StoryContinuityResumeChip lastSession={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when lastSession is undefined', () => {
    const { container } = render(<StoryContinuityResumeChip />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the chip when a session is provided', () => {
    render(<StoryContinuityResumeChip lastSession={DEMO_SESSION} />);
    expect(screen.getByTestId('story-continuity-resume-chip')).toBeInTheDocument();
  });

  it('shows the world name', () => {
    render(<StoryContinuityResumeChip lastSession={DEMO_SESSION} />);
    expect(screen.getByTestId('story-resume-chip-world-name')).toHaveTextContent(
      'The Silver Realm Chronicles'
    );
  });

  it('shows the agent name', () => {
    render(<StoryContinuityResumeChip lastSession={DEMO_SESSION} />);
    expect(screen.getByTestId('story-resume-chip-agent-name')).toHaveTextContent(
      'Aria — your story companion'
    );
  });

  it('appends chapter label to agent name when provided', () => {
    render(<StoryContinuityResumeChip lastSession={DEMO_SESSION} />);
    expect(screen.getByTestId('story-resume-chip-agent-name')).toHaveTextContent(
      'Chapter 12 · The Convergence'
    );
  });

  it('renders the Resume CTA linking to the resume href', () => {
    render(<StoryContinuityResumeChip lastSession={DEMO_SESSION} />);
    const cta = screen.getByTestId('story-resume-chip-cta');
    expect(cta).toHaveTextContent('Resume');
    expect(cta).toHaveAttribute('href', '/session/silver-realm-42');
  });

  it('renders the premium upgrade CTA linking to /pricing', () => {
    render(<StoryContinuityResumeChip lastSession={DEMO_SESSION} />);
    const premiumCta = screen.getByTestId('story-resume-chip-premium-cta');
    expect(premiumCta).toHaveAttribute('href', '/pricing');
    expect(premiumCta).toHaveTextContent('이어하기+기억 제어');
  });

  it('renders the "Continue your story" label', () => {
    render(<StoryContinuityResumeChip lastSession={DEMO_SESSION} />);
    expect(screen.getByTestId('story-resume-chip-label')).toHaveTextContent(
      'Continue your story'
    );
  });

  it('has accessible aria-label on root element', () => {
    render(<StoryContinuityResumeChip lastSession={DEMO_SESSION} />);
    const chip = screen.getByTestId('story-continuity-resume-chip');
    expect(chip).toHaveAttribute(
      'aria-label',
      'Resume story: The Silver Realm Chronicles with Aria — your story companion'
    );
  });

  it('renders chapter label in agent name line when provided', () => {
    render(<StoryContinuityResumeChip lastSession={DEMO_SESSION} />);
    const agentLine = screen.getByTestId('story-resume-chip-agent-name');
    expect(agentLine.textContent).toContain('·');
  });

  it('does not show chapter separator when chapterLabel is omitted', () => {
    const session = { worldName: 'Moonworld', agentName: 'Selene', resumeHref: '/s/1' };
    render(<StoryContinuityResumeChip lastSession={session} />);
    const agentLine = screen.getByTestId('story-resume-chip-agent-name');
    expect(agentLine.textContent).not.toContain('·');
  });
});
