import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { PostUpdateContinuityBanner } from '../../components/ui/PostUpdateContinuityBanner';

const VERSION_KEY = 'agentgram_app_version';
const CURRENT_VERSION = '1.0.0';

function makeDismissedKey(version: string) {
  return `agentgram_update_banner_dismissed_${version}`;
}

describe('PostUpdateContinuityBanner', () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, val: string) => {
          store[key] = val;
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          store = {};
        }),
      },
      writable: true,
    });

    // Default: env version is '1.0.0'
    vi.stubEnv('NEXT_PUBLIC_APP_VERSION', CURRENT_VERSION);
  });

  it('shows banner when stored version differs from current version', async () => {
    store[VERSION_KEY] = '0.9.0';
    await act(async () => {
      render(<PostUpdateContinuityBanner />);
    });
    expect(screen.getByTestId('post-update-continuity-banner')).toBeInTheDocument();
  });

  it('hides banner when stored version matches current version', async () => {
    store[VERSION_KEY] = CURRENT_VERSION;
    await act(async () => {
      render(<PostUpdateContinuityBanner />);
    });
    expect(screen.queryByTestId('post-update-continuity-banner')).not.toBeInTheDocument();
  });

  it('hides banner on first-time install (no stored version)', async () => {
    // store is empty — no prior version
    await act(async () => {
      render(<PostUpdateContinuityBanner />);
    });
    expect(screen.queryByTestId('post-update-continuity-banner')).not.toBeInTheDocument();
  });

  it('dismiss button hides the banner', async () => {
    store[VERSION_KEY] = '0.9.0';
    await act(async () => {
      render(<PostUpdateContinuityBanner />);
    });
    expect(screen.getByTestId('post-update-continuity-banner')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('post-update-continuity-banner-dismiss'));
    expect(screen.queryByTestId('post-update-continuity-banner')).not.toBeInTheDocument();
  });

  it('sets localStorage dismissed flag when user clicks dismiss', async () => {
    store[VERSION_KEY] = '0.9.0';
    await act(async () => {
      render(<PostUpdateContinuityBanner />);
    });
    fireEvent.click(screen.getByTestId('post-update-continuity-banner-dismiss'));
    expect(store[makeDismissedKey(CURRENT_VERSION)]).toBe('1');
  });

  it('updates stored version to current version on mount when versions differ', async () => {
    store[VERSION_KEY] = '0.9.0';
    await act(async () => {
      render(<PostUpdateContinuityBanner />);
    });
    expect(store[VERSION_KEY]).toBe(CURRENT_VERSION);
  });

  it('displays the correct banner message text', async () => {
    store[VERSION_KEY] = '0.8.0';
    await act(async () => {
      render(<PostUpdateContinuityBanner />);
    });
    expect(screen.getByTestId('post-update-continuity-banner-text')).toHaveTextContent(
      'We recently updated AgentGram'
    );
    expect(screen.getByTestId('post-update-continuity-banner-text')).toHaveTextContent(
      "they'll stabilize within a few conversations"
    );
  });

  it('renders the "Learn more" link pointing to /help/updates', async () => {
    store[VERSION_KEY] = '0.8.0';
    await act(async () => {
      render(<PostUpdateContinuityBanner />);
    });
    const link = screen.getByTestId('post-update-continuity-banner-learn-more');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/help/updates');
    expect(link).toHaveTextContent('Learn more');
  });

  it('does not show banner again if already dismissed for this version', async () => {
    store[VERSION_KEY] = '0.9.0';
    store[makeDismissedKey(CURRENT_VERSION)] = '1';
    await act(async () => {
      render(<PostUpdateContinuityBanner />);
    });
    expect(screen.queryByTestId('post-update-continuity-banner')).not.toBeInTheDocument();
  });
});
