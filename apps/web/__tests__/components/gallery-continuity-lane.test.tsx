import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import GalleryContinuityLane from '@/components/gallery-continuity/GalleryContinuityLane';

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
  worldId: 'silver-realm-42',
  worldName: 'The Silver Realm Chronicles',
  agentName: 'Aria',
  resumeHref: '/session/silver-realm-42',
};

// ── Prop-driven tests ────────────────────────────────────────────────────────

describe('GalleryContinuityLane — prop-driven', () => {
  it('renders the lane container', () => {
    render(<GalleryContinuityLane lastPlayedSession={null} />);
    expect(screen.getByTestId('gallery-continuity-lane')).toBeInTheDocument();
  });

  it('always renders the Imagine Gallery jump-in tile', () => {
    render(<GalleryContinuityLane lastPlayedSession={null} />);
    expect(screen.getByTestId('imagine-gallery-jump-in')).toBeInTheDocument();
  });

  it('renders last-played world tile when session is provided', () => {
    render(<GalleryContinuityLane lastPlayedSession={DEMO_SESSION} />);
    expect(screen.getByTestId('last-played-world-tile')).toBeInTheDocument();
  });

  it('does not render world tile when lastPlayedSession is null', () => {
    render(<GalleryContinuityLane lastPlayedSession={null} />);
    expect(screen.queryByTestId('last-played-world-tile')).not.toBeInTheDocument();
  });

  it('shows world name in the last-played tile', () => {
    render(<GalleryContinuityLane lastPlayedSession={DEMO_SESSION} />);
    expect(screen.getByTestId('last-played-tile-world-name')).toHaveTextContent(
      'The Silver Realm Chronicles'
    );
  });

  it('shows agent name in the last-played tile', () => {
    render(<GalleryContinuityLane lastPlayedSession={DEMO_SESSION} />);
    expect(screen.getByTestId('last-played-tile-agent-name')).toHaveTextContent('Aria');
  });

  it('Resume CTA links to the resumeHref', () => {
    render(<GalleryContinuityLane lastPlayedSession={DEMO_SESSION} />);
    const cta = screen.getByTestId('last-played-tile-cta');
    expect(cta).toHaveAttribute('href', '/session/silver-realm-42');
  });

  it('Imagine Gallery CTA links to /image-gen', () => {
    render(<GalleryContinuityLane lastPlayedSession={null} />);
    const cta = screen.getByTestId('imagine-gallery-jump-in-cta');
    expect(cta).toHaveAttribute('href', '/image-gen');
  });

  it('shows "Last story world" label in tile', () => {
    render(<GalleryContinuityLane lastPlayedSession={DEMO_SESSION} />);
    expect(screen.getByTestId('last-played-tile-label')).toHaveTextContent('Last story world');
  });

  it('shows "Imagine Gallery" label in jump-in tile', () => {
    render(<GalleryContinuityLane lastPlayedSession={null} />);
    expect(screen.getByTestId('imagine-gallery-jump-in-label')).toHaveTextContent(
      'Imagine Gallery'
    );
  });
});

// ── API fetch behavior tests ─────────────────────────────────────────────────

describe('GalleryContinuityLane — API fetch behavior', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows skeletons while fetching when no prop is given', async () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}));
    render(<GalleryContinuityLane />);
    await waitFor(() => {
      expect(screen.getAllByTestId('gallery-lane-tile-skeleton').length).toBeGreaterThan(0);
    });
  });

  it('renders last-played tile with API data after successful fetch', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: DEMO_SESSION }),
    } as Response);

    render(<GalleryContinuityLane />);

    await waitFor(() => {
      expect(screen.getByTestId('last-played-world-tile')).toBeInTheDocument();
    });
    expect(screen.getByTestId('last-played-tile-world-name')).toHaveTextContent(
      'The Silver Realm Chronicles'
    );
  });

  it('still renders Imagine Gallery tile even when API returns null', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: null }),
    } as Response);

    render(<GalleryContinuityLane />);

    await waitFor(() => {
      expect(screen.queryByTestId('gallery-lane-tile-skeleton')).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('imagine-gallery-jump-in')).toBeInTheDocument();
    expect(screen.queryByTestId('last-played-world-tile')).not.toBeInTheDocument();
  });
});
