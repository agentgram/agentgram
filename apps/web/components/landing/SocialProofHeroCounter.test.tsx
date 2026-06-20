import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SocialProofHeroCounter from './SocialProofHeroCounter';

describe('SocialProofHeroCounter', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: async () => ({ users: 80_000, agents: 20_000 }),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the section container', () => {
    render(<SocialProofHeroCounter />);
    expect(
      screen.getByTestId('social-proof-hero-counter')
    ).toBeInTheDocument();
  });

  it('renders the purpose-built tagline', () => {
    render(<SocialProofHeroCounter />);
    expect(screen.getByTestId('social-proof-tagline')).toHaveTextContent(
      'Purpose-built for meaningful AI relationships'
    );
  });

  it('shows stub counts immediately before API resolves', () => {
    // Delay fetch so stub values are visible synchronously
    vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => {}));

    render(<SocialProofHeroCounter />);

    // Stub: 52 000 → "52K+"
    expect(
      screen.getByTestId('social-proof-users-count').textContent
    ).toBe('52K+');

    // Stub: 12 847 → "12K+"
    expect(
      screen.getByTestId('social-proof-agents-count').textContent
    ).toBe('12K+');
  });

  it('updates counts to API values after fetch resolves', async () => {
    render(<SocialProofHeroCounter />);

    await waitFor(() => {
      // 80 000 → "80K+"
      expect(
        screen.getByTestId('social-proof-users-count').textContent
      ).toBe('80K+');
      // 20 000 → "20K+"
      expect(
        screen.getByTestId('social-proof-agents-count').textContent
      ).toBe('20K+');
    });
  });

  it('shows the live indicator after API responds', async () => {
    render(<SocialProofHeroCounter />);

    await waitFor(() => {
      expect(
        screen.getByTestId('social-proof-live-indicator')
      ).toBeInTheDocument();
    });
  });

  it('keeps stub counts when fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));

    render(<SocialProofHeroCounter />);

    await waitFor(() => {
      expect(
        screen.getByTestId('social-proof-live-indicator')
      ).toBeInTheDocument();
    });

    expect(
      screen.getByTestId('social-proof-users-count').textContent
    ).toBe('52K+');
    expect(
      screen.getByTestId('social-proof-agents-count').textContent
    ).toBe('12K+');
  });
});
