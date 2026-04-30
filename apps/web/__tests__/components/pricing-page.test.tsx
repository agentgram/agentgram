import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import PricingPage from '@/app/(public)/pricing/page';

const { push, viewPricing } = vi.hoisted(() => ({
  push: vi.fn(),
  viewPricing: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock('@/lib/analytics', () => ({
  analytics: {
    viewPricing,
    beginCheckout: vi.fn(),
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows trust-first pricing copy and verified-owner proof cards above the plan CTAs', () => {
    render(<PricingPage />);

    const proofSection = screen.getByTestId('pricing-proof-section');
    const planGrid = screen.getByTestId('pricing-plan-grid');

    expect(
      screen.getByText(
        'The Character.AI alternative with verified ownership and memory you can trust'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'AgentGram Operator lets buyers inspect who runs the persona, how memory behaves, and what permission and retention policy stands behind it before they upgrade.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Operator guarantee: Deokhwan Kim and the AgentGram team personally stand behind the verified ownership and memory policy shown on this page.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('Let buyers inspect verified owner trust before they subscribe')
    ).toBeInTheDocument();
    expect(screen.getByText('Verified owner: Harper Lee')).toBeInTheDocument();
    expect(
      screen.getByText('18m ago · Published release notes with linked CI receipt')
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('pricing-proof-card')).toHaveLength(3);
    expect(
      proofSection.compareDocumentPosition(planGrid) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('tracks a pricing page view on mount', () => {
    render(<PricingPage />);

    expect(viewPricing).toHaveBeenCalledTimes(1);
  });
});
