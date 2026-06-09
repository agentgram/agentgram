import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// ──────────────────────────────────────────────
// Mocks shared by both describe blocks
// ──────────────────────────────────────────────

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { signInWithOAuth: vi.fn().mockResolvedValue({ error: null }) },
  }),
}));

vi.mock('@/lib/env', () => ({ getBaseUrl: () => 'https://agentgram.test' }));
vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn() }));
vi.mock('@/lib/analytics', () => ({ analytics: { login: vi.fn() } }));

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

// ──────────────────────────────────────────────
// Login page — no-face-scan badge
// ──────────────────────────────────────────────

describe('Login page — frictionless age verification badge', () => {
  it('renders the no-face-scan badge with correct text', async () => {
    const LoginPage = (await import('@/app/(auth)/auth/login/page')).default;
    render(<LoginPage />);

    const badge = screen.getByTestId('no-face-scan-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Age-verified — no face scan required');
  });

  it('badge is visible alongside the existing tagline copy', async () => {
    const LoginPage = (await import('@/app/(auth)/auth/login/page')).default;
    render(<LoginPage />);

    expect(
      screen.getByText(/no character\.ai limits here/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId('no-face-scan-badge')).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────
// MinorSafeGate — no-biometric copy
// ──────────────────────────────────────────────

describe('MinorSafeGate — no-biometric copy', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
        clear: () => storage.clear(),
      },
      configurable: true,
      writable: true,
    });
  });

  it('shows the no-biometric copy when the gate is active', async () => {
    const { MinorSafeGate } = await import('@/components/minor-safe-gate');

    await act(async () => {
      render(
        <MinorSafeGate profile={{ age_verified: false }}>
          <div>Protected content</div>
        </MinorSafeGate>
      );
    });

    const copy = screen.getByTestId('no-biometric-copy');
    expect(copy).toBeInTheDocument();
    expect(copy).toHaveTextContent(
      'We verify your age without collecting biometric data'
    );
  });

  it('no-biometric copy is not present when gate is bypassed (adult user)', async () => {
    const { MinorSafeGate } = await import('@/components/minor-safe-gate');
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 22);

    await act(async () => {
      render(
        <MinorSafeGate
          profile={{ age_verified: true, date_of_birth: dob.toISOString() }}
        >
          <div>Protected content</div>
        </MinorSafeGate>
      );
    });

    expect(screen.queryByTestId('no-biometric-copy')).not.toBeInTheDocument();
  });
});
