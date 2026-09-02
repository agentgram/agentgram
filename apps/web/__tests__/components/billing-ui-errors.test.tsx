import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PricingPage from '@/app/(public)/pricing/page';
import { ManageSubscriptionButton } from '@/components/dashboard/ManageSubscriptionButton';

const { push, toast, manageSubscription, beginCheckout, viewPricing } = vi.hoisted(
  () => ({
    push: vi.fn(),
    toast: vi.fn(),
    manageSubscription: vi.fn(),
    beginCheckout: vi.fn(),
    viewPricing: vi.fn(),
  })
);

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast }),
}));

vi.mock('@/lib/analytics', () => ({
  analytics: {
    beginCheckout,
    manageSubscription,
    viewPricing,
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
          delete (props as Record<string, unknown>).whileInView;
          delete (props as Record<string, unknown>).viewport;
          return React.createElement(tag, props, children);
        };
      },
    }
  ),
}));

describe('billing UI errors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    vi.stubEnv('NEXT_PUBLIC_ENABLE_BILLING', 'true');
  });

  it('shows portal API error code and server message when manage subscription fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({
          success: false,
          error: {
            code: 'PORTAL_ERROR',
            message: 'Failed to retrieve billing portal.',
          },
        }),
      })
    );

    render(<ManageSubscriptionButton />);
    fireEvent.click(screen.getByRole('button', { name: /manage subscription/i }));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
          description: 'PORTAL_ERROR: Failed to retrieve billing portal.',
        })
      );
    });
    expect(
      (screen.getByRole('button', {
        name: /manage subscription/i,
      }) as HTMLButtonElement).disabled
    ).toBe(false);
  });

  it('shows a generic toast and releases loading when manage subscription fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    render(<ManageSubscriptionButton />);
    fireEvent.click(screen.getByRole('button', { name: /manage subscription/i }));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
          description: expect.stringMatching(/try again/i),
        })
      );
    });
    expect(
      (screen.getByRole('button', {
        name: /manage subscription/i,
      }) as HTMLButtonElement).disabled
    ).toBe(false);
  });

  it('replaces checkout alert with a toast containing server error code and message', async () => {
    const alert = vi.fn();
    vi.stubGlobal('alert', alert);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 500,
        json: async () => ({
          success: false,
          error: {
            code: 'VARIANT_NOT_CONFIGURED',
            message: 'Variant for team (annual) is not configured.',
          },
        }),
      })
    );

    render(<PricingPage />);
    fireEvent.click(screen.getByRole('button', { name: /^annual/i }));
    fireEvent.click(screen.getByRole('button', { name: /^subscribe/i }));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
          description:
            'VARIANT_NOT_CONFIGURED: Variant for team (annual) is not configured.',
        })
      );
    });
    expect(alert).not.toHaveBeenCalled();
    expect(
      (screen.getByRole('button', { name: /^subscribe/i }) as HTMLButtonElement)
        .disabled
    ).toBe(false);
  });

  it('shows a generic toast instead of silently swallowing checkout fetch rejects', async () => {
    const alert = vi.fn();
    vi.stubGlobal('alert', alert);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    render(<PricingPage />);
    fireEvent.click(screen.getByRole('button', { name: /^subscribe/i }));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
          description: expect.stringMatching(/try again/i),
        })
      );
    });
    expect(alert).not.toHaveBeenCalled();
    expect(
      (screen.getByRole('button', { name: /^subscribe/i }) as HTMLButtonElement)
        .disabled
    ).toBe(false);
  });
});
