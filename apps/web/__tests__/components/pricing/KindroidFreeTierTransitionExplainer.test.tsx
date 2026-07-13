import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KindroidFreeTierTransitionExplainer } from '@/components/pricing/KindroidFreeTierTransitionExplainer';

describe('KindroidFreeTierTransitionExplainer', () => {
  it('renders the free-tier transition explainer without crashing', () => {
    render(<KindroidFreeTierTransitionExplainer />);
    expect(
      screen.getByTestId('kindroid-free-tier-transition-explainer')
    ).toBeInTheDocument();
  });

  it('explains that Lite is a bounded path instead of permanent free access', () => {
    render(<KindroidFreeTierTransitionExplainer />);

    expect(screen.getByTestId('kindroid-free-tier-eyebrow')).toHaveTextContent(
      'Free-tier transition explainer'
    );
    expect(screen.getByTestId('kindroid-free-tier-heading')).toHaveTextContent(
      'Explain the bounded Lite path before free access stops feeling permanent'
    );
    expect(
      screen.getByTestId('kindroid-free-tier-policy-badge')
    ).toHaveTextContent('No surprise lockout');
  });

  it('shows the preview, transition date, and bounded upgrade impact steps', () => {
    render(<KindroidFreeTierTransitionExplainer />);
    const grid = screen.getByTestId('kindroid-lite-path-grid');

    expect(grid.children).toHaveLength(3);
    expect(screen.getByTestId('kindroid-lite-path-preview')).toHaveTextContent(
      'Lite starts as a preview'
    );
    expect(screen.getByTestId('kindroid-lite-path-date')).toHaveTextContent(
      'Transition date is explicit'
    );
    expect(screen.getByTestId('kindroid-lite-path-impact')).toHaveTextContent(
      'Upgrade impact is bounded'
    );
  });

  it('answers what happens when free access is no longer permanent', () => {
    render(<KindroidFreeTierTransitionExplainer />);
    const faq = screen.getByTestId('kindroid-free-tier-policy-faq');

    expect(faq).toHaveTextContent(
      'What happens when free access is no longer permanent?'
    );
    expect(faq).toHaveTextContent('Lite conversations stay readable');
    expect(faq).toHaveTextContent('save, export, and upgrade choices');
    expect(faq).toHaveTextContent('never presented as a surprise lock');
  });
});
