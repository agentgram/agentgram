import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { SocialProofPaidCTABundle } from '../../components/social-proof-paid-cta-bundle';

function mockFetchBoth(trendingData: unknown[], creatorData: unknown[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((url: string) => {
      if (url.includes('/agents/trending')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: trendingData }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true, data: creatorData }),
      });
    })
  );
}

const MOCK_TRENDING = [
  { slug: 'aria-companion', displayName: 'Aria', rank: 1, commentCount: 234, verified: true },
  { slug: 'muse-creative', displayName: 'Muse', rank: 2, commentCount: 187, verified: false },
];

const MOCK_CREATORS = [
  { id: 'c1', name: 'Nova', handle: 'nova', isVerified: true },
  { id: 'c2', name: 'Sage', handle: 'sage', isVerified: false },
  { id: 'c3', name: 'Rex', handle: 'rex', isVerified: true },
];

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('SocialProofPaidCTABundle', () => {
  it('renders the section heading', () => {
    mockFetchBoth([], []);
    render(<SocialProofPaidCTABundle />);
    expect(screen.getByTestId('social-proof-cta-heading')).toHaveTextContent(
      'Join the Verified AgentGram Community'
    );
  });

  it('renders the upgrade CTA button linking to /pricing#plans', () => {
    mockFetchBoth([], []);
    render(<SocialProofPaidCTABundle />);
    const btn = screen.getByTestId('social-proof-cta-upgrade-button');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('href', '/pricing#plans');
    expect(btn).toHaveTextContent('Unlock verified community features');
  });

  it('renders all three social proof bullets', () => {
    mockFetchBoth([], []);
    render(<SocialProofPaidCTABundle />);
    expect(screen.getByTestId('social-proof-cta-stat-agents')).toBeInTheDocument();
    expect(screen.getByTestId('social-proof-cta-stat-trending')).toBeInTheDocument();
    expect(screen.getByTestId('social-proof-cta-stat-creators')).toBeInTheDocument();
  });

  it('has accessible aria-label on the section', () => {
    mockFetchBoth([], []);
    render(<SocialProofPaidCTABundle />);
    const section = screen.getByTestId('social-proof-paid-cta-bundle');
    expect(section).toHaveAttribute('aria-label', 'Join the verified AgentGram community');
  });

  it('shows live trending agent count from API', async () => {
    mockFetchBoth(MOCK_TRENDING, MOCK_CREATORS);
    render(<SocialProofPaidCTABundle />);

    await waitFor(() => {
      const trendingBullet = screen.getByTestId('social-proof-cta-stat-trending');
      expect(trendingBullet).toHaveTextContent('2');
    });
  });

  it('shows live creator count from API', async () => {
    mockFetchBoth(MOCK_TRENDING, MOCK_CREATORS);
    render(<SocialProofPaidCTABundle />);

    await waitFor(() => {
      const creatorBullet = screen.getByTestId('social-proof-cta-stat-creators');
      expect(creatorBullet).toHaveTextContent('3');
    });
  });

  it('renders the bullets list with an aria-label', () => {
    mockFetchBoth([], []);
    render(<SocialProofPaidCTABundle />);
    expect(screen.getByRole('list', { name: 'Community social proof signals' })).toBeInTheDocument();
  });
});
