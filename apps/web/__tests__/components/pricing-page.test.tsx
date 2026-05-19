import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import PricingPage from '@/app/(public)/pricing/page';

const { push, viewPricing, beginCheckout, pricingProofCardClick } = vi.hoisted(() => ({
  push: vi.fn(),
  viewPricing: vi.fn(),
  beginCheckout: vi.fn(),
  pricingProofCardClick: vi.fn(),
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
    pricingProofCardClick,
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
    process.env.NEXT_PUBLIC_ENABLE_BILLING = 'true';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          success: true,
          data: { url: 'https://checkout.example.com/session' },
        }),
      })
    );
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        assign: vi.fn(),
      },
    });
  });

  it('shows quote-card and group-chat pricing examples plus verified-owner proof cards above the plan CTAs', () => {
    render(<PricingPage />);

    const proofSection = screen.getByTestId('pricing-proof-section');
    const galleryGrid = screen.getByTestId('pricing-gallery-grid');
    const trustGuarantee = screen.getByTestId('pricing-trust-guarantee');
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
    const heroCta = screen.getByTestId('pricing-hero-primary-cta');
    expect(
      screen.getByRole('button', { name: /start with pro/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create a free agent/i })
    ).toBeInTheDocument();
    expect(
      heroCta.compareDocumentPosition(planGrid) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      screen.getByText('Let buyers inspect verified owner trust before they subscribe')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Quote-card proof buyers can screenshot')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Group-chat examples make collaboration legible before upgrade'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Verified owner: Harper Lee')).toBeInTheDocument();
    expect(
      screen.getByText('Proof now, rollback if trust drifts later')
    ).toBeInTheDocument();
    expect(screen.getByText('Memory rollback promise')).toBeInTheDocument();
    expect(screen.getAllByTestId('pricing-gallery-card')).toHaveLength(2);
    expect(screen.getAllByTestId('pricing-proof-card')).toHaveLength(3);
    expect(galleryGrid).toBeInTheDocument();
    expect(trustGuarantee).toBeInTheDocument();
    expect(
      proofSection.compareDocumentPosition(planGrid) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('starts checkout from the first-viewport Pro CTA', async () => {
    render(<PricingPage />);

    fireEvent.click(screen.getByRole('button', { name: /start with pro/i }));

    expect(beginCheckout).toHaveBeenCalledWith(
      'pro',
      'monthly',
      'pricing_plan_grid',
      undefined
    );
  });

  it('routes free-agent onboarding from the first-viewport secondary CTA', () => {
    render(<PricingPage />);

    fireEvent.click(screen.getByRole('button', { name: /create a free agent/i }));

    expect(push).toHaveBeenCalledWith('/dashboard/onboard');
  });

  it('tracks a pricing page view on mount', () => {
    render(<PricingPage />);

    expect(viewPricing).toHaveBeenCalledTimes(1);
  });

  it('logs proof-card clicks and carries the trust-surface source into checkout starts', async () => {
    render(<PricingPage />);

    fireEvent.click(screen.getAllByTestId('pricing-proof-card')[0]);

    expect(pricingProofCardClick).toHaveBeenCalledWith(
      'deploy-notes',
      'Release notes + CI receipt'
    );

    fireEvent.click(screen.getAllByRole('button', { name: /subscribe/i })[0]);

    expect(beginCheckout).toHaveBeenCalledWith(
      'starter',
      'monthly',
      'pricing_proof_section',
      'deploy-notes'
    );
  });
});
