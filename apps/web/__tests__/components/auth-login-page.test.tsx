import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import LoginPage from '@/app/(auth)/auth/login/page';

const { login, signInWithOAuth, toast, useSearchParamsMock } = vi.hoisted(
  () => ({
    login: vi.fn(),
    signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
    toast: vi.fn(),
    useSearchParamsMock: vi.fn<() => URLSearchParams>(
      () => new URLSearchParams()
    ),
  })
);

vi.mock('next/navigation', () => ({
  useSearchParams: () => useSearchParamsMock(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth,
    },
  }),
}));

vi.mock('@/lib/env', () => ({
  getBaseUrl: () => 'https://agentgram.test',
}));

vi.mock('@/hooks/use-toast', () => ({
  toast,
}));

vi.mock('@/lib/analytics', () => ({
  analytics: {
    login,
  },
}));

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        return ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => {
          delete (props as Record<string, unknown>).initial;
          delete (props as Record<string, unknown>).animate;
          delete (props as Record<string, unknown>).transition;
          return React.createElement(tag, props, children);
        };
      },
    }
  ),
}));

describe('LoginPage screenshot surface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
  });

  it('keeps the login surface wide and dense on desktop captures while preserving SSO buttons', () => {
    render(<LoginPage />);

    const surface = screen.getByTestId('auth-login-surface');
    const readinessPanel = screen.getByTestId('auth-login-readiness-panel');
    const loginCard = screen.getByTestId('auth-login-card');

    expect(surface.className).toContain('max-w-5xl');
    expect(surface.className).toContain('lg:min-h-[640px]');
    expect(surface.className).toContain(
      'lg:grid-cols-[minmax(0,1fr)_minmax(22rem,26rem)]'
    );
    expect(readinessPanel.className).toContain('min-h-[560px]');
    expect(loginCard.className).toContain('min-h-[520px]');

    const googleBtn = screen.getByTestId('sso-google-btn');
    const githubBtn = screen.getByTestId('sso-github-btn');
    expect(googleBtn).toBeInTheDocument();
    expect(githubBtn).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /continue with google/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /continue with github/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Capture checklist')).toBeInTheDocument();
    expect(screen.getByText('OAuth SSO')).toBeInTheDocument();
    expect(screen.getByText('Redirect guard')).toBeInTheDocument();
    expect(within(readinessPanel).getByText('/auth/login')).toBeInTheDocument();
  });
  it('preserves the requested redirect when starting Google SSO', async () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams('redirect=/dashboard/onboard?from=pricing')
    );

    render(<LoginPage />);

    fireEvent.click(
      screen.getByRole('button', { name: /continue with google/i })
    );

    await waitFor(() => {
      expect(signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo:
            'https://agentgram.test/auth/callback?redirect=%2Fdashboard%2Fonboard%3Ffrom%3Dpricing',
        },
      });
    });
    expect(login).toHaveBeenCalledWith('google');
  });
});
