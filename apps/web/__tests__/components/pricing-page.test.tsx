import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import PricingPage from '@/app/(public)/pricing/page';

const { push, viewPricing, beginCheckout } = vi.hoisted(() => ({
  push: vi.fn(),
  viewPricing: vi.fn(),
  beginCheckout: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock('@/lib/analytics', () => ({
  analytics: {
    viewPricing,
    beginCheckout,
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

describe('PricingPage', () => {
  const assign = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_ENABLE_BILLING = 'true';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        json: vi.fn().mockResolvedValue({
          success: true,
          data: { url: 'https://checkout.example.com/session' },
        }),
      })
    );
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { assign },
    });
  });

  it('presents the Free / Team / Enterprise governance axis', () => {
    render(<PricingPage />);

    expect(
      screen.getByText(
        'Governance and audit for the MCP servers your team runs'
      )
    ).toBeInTheDocument();

    const grid = screen.getByTestId('pricing-plan-grid');
    expect(grid).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Free' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Team' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Enterprise' })
    ).toBeInTheDocument();
  });

  it('surfaces the governance value pillars instead of companion marketing', () => {
    render(<PricingPage />);

    const pillars = screen.getByTestId('pricing-governance-pillars');
    expect(pillars).toHaveTextContent('Private MCP registry + allow-list');
    expect(pillars).toHaveTextContent('AX Score scoring');
    expect(pillars).toHaveTextContent('Ed25519 signature verification');
    expect(pillars).toHaveTextContent('Signed audit receipts');

    // Companion marketing must be gone from pricing.
    expect(document.body.textContent).not.toMatch(/Character\.AI/i);
    expect(document.body.textContent).not.toMatch(/Replika/i);
    expect(document.body.textContent).not.toMatch(/Nomi/i);
    expect(document.body.textContent).not.toMatch(/companion/i);
  });

  it('starts a Team checkout with plan="team" from the hero CTA', async () => {
    render(<PricingPage />);

    fireEvent.click(screen.getByRole('button', { name: /start with team/i }));

    expect(beginCheckout).toHaveBeenCalledWith(
      'team',
      'monthly',
      'pricing_plan_grid'
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/v1/billing/checkout',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ plan: 'team', billingPeriod: 'monthly' }),
        })
      );
    });
    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith(
        'https://checkout.example.com/session'
      );
    });
  });

  it('routes Free evaluation to login', () => {
    render(<PricingPage />);

    fireEvent.click(screen.getByRole('button', { name: /evaluate for free/i }));

    expect(push).toHaveBeenCalledWith('/auth/login');
    expect(beginCheckout).not.toHaveBeenCalled();
  });

  it('routes Enterprise to a contact mailto', () => {
    render(<PricingPage />);

    const enterpriseButtons = screen.getAllByRole('button', {
      name: /contact sales/i,
    });
    fireEvent.click(enterpriseButtons[0]);

    expect(assign).toHaveBeenCalledWith(
      'mailto:enterprise@agentgram.co?subject=AgentGram%20Enterprise%20Inquiry'
    );
    expect(beginCheckout).not.toHaveBeenCalled();
  });

  it('tracks a pricing page view on mount', () => {
    render(<PricingPage />);

    expect(viewPricing).toHaveBeenCalledTimes(1);
  });

  it('shows "Coming Soon" for Team when billing is disabled and routes to login', () => {
    process.env.NEXT_PUBLIC_ENABLE_BILLING = 'false';
    render(<PricingPage />);

    const grid = screen.getByTestId('pricing-plan-grid');
    expect(grid).toHaveTextContent('Coming Soon');

    fireEvent.click(screen.getByRole('button', { name: /start with team/i }));
    expect(push).toHaveBeenCalledWith('/auth/login');
    expect(beginCheckout).not.toHaveBeenCalled();
  });
});
