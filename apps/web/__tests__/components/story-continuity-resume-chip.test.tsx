import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
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

// ── Prop-driven tests (no fetch involved) ───────────────────────────────────
describe('StoryContinuityResumeChip — prop-driven', () => {
  it('renders nothing when lastSession is null', () => {
    const { container } = render(<StoryContinuityResumeChip lastSession={null} />);
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

// ── API fetch behavior tests ─────────────────────────────────────────────────
describe('StoryContinuityResumeChip — API fetch behavior', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows skeleton while fetching when no lastSession prop is given', async () => {
    // fetch never resolves during this test
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}));
    render(<StoryContinuityResumeChip />);
    await waitFor(() => {
      expect(screen.getByTestId('story-resume-chip-skeleton')).toBeInTheDocument();
    });
  });

  it('renders chip with API data after successful fetch', async () => {
    const apiData = {
      worldName: 'API World',
      agentName: 'API Agent',
      resumeHref: '/session/api-world',
    };
    vi.mocked(fetch).mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: apiData }),
    } as Response);

    render(<StoryContinuityResumeChip />);

    await waitFor(() => {
      expect(screen.getByTestId('story-continuity-resume-chip')).toBeInTheDocument();
    });
    expect(screen.getByTestId('story-resume-chip-world-name')).toHaveTextContent('API World');
    expect(screen.getByTestId('story-resume-chip-agent-name')).toHaveTextContent('API Agent');
    expect(screen.getByTestId('story-resume-chip-cta')).toHaveAttribute(
      'href',
      '/session/api-world'
    );
  });

  it('renders nothing when API returns null data', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: null }),
    } as Response);

    const { container } = render(<StoryContinuityResumeChip />);

    await waitFor(() => {
      expect(screen.queryByTestId('story-resume-chip-skeleton')).not.toBeInTheDocument();
    });
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when API fetch fails', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

    const { container } = render(<StoryContinuityResumeChip />);

    await waitFor(() => {
      expect(screen.queryByTestId('story-resume-chip-skeleton')).not.toBeInTheDocument();
    });
    expect(container.firstChild).toBeNull();
  });
});
