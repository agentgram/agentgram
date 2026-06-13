import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  CompanionInsightsPanel,
  CompanionInsightsButton,
} from '@/components/companion-insights-panel';

describe('CompanionInsightsPanel', () => {
  it('renders the panel container', () => {
    render(<CompanionInsightsPanel agentLabel="Aria" isPaidUser={false} />);
    expect(screen.getByTestId('companion-insights-panel')).toBeInTheDocument();
  });

  it('shows the paywall gate for free users', () => {
    render(<CompanionInsightsPanel agentLabel="Aria" isPaidUser={false} />);
    expect(
      screen.getByTestId('companion-insights-paywall')
    ).toBeInTheDocument();
  });

  it('does not show paid content for free users', () => {
    render(<CompanionInsightsPanel agentLabel="Aria" isPaidUser={false} />);
    expect(
      screen.queryByTestId('companion-insights-paid-content')
    ).not.toBeInTheDocument();
  });

  it('shows paid content for paid users', () => {
    render(<CompanionInsightsPanel agentLabel="Aria" isPaidUser={true} />);
    expect(
      screen.getByTestId('companion-insights-paid-content')
    ).toBeInTheDocument();
  });

  it('does not show paywall for paid users', () => {
    render(<CompanionInsightsPanel agentLabel="Aria" isPaidUser={true} />);
    expect(
      screen.queryByTestId('companion-insights-paywall')
    ).not.toBeInTheDocument();
  });

  it('renders all three insight sections for paid users', () => {
    render(<CompanionInsightsPanel agentLabel="Aria" isPaidUser={true} />);
    expect(
      screen.getByTestId('insights-section-how_i_see_you')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('insights-section-what_i_remember_most')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('insights-section-our_connection_story')
    ).toBeInTheDocument();
  });

  it('renders section labels for paid users', () => {
    render(<CompanionInsightsPanel agentLabel="Aria" isPaidUser={true} />);
    expect(screen.getByText('How I see you')).toBeInTheDocument();
    expect(screen.getByText('What I remember most')).toBeInTheDocument();
    expect(screen.getByText('Our connection story')).toBeInTheDocument();
  });

  it('shows upgrade CTA in paywall for free users', () => {
    render(<CompanionInsightsPanel agentLabel="Aria" isPaidUser={false} />);
    expect(
      screen.getByTestId('companion-insights-upgrade-cta')
    ).toBeInTheDocument();
  });

  it('upgrade CTA links to /pricing', () => {
    render(<CompanionInsightsPanel agentLabel="Aria" isPaidUser={false} />);
    const cta = screen.getByTestId('companion-insights-upgrade-cta');
    const anchor = cta.tagName === 'A' ? cta : cta.querySelector('a');
    expect(anchor ?? cta).toHaveAttribute('href', '/pricing');
  });

  it('includes agentLabel in card description', () => {
    render(<CompanionInsightsPanel agentLabel="Pixel" isPaidUser={true} />);
    const panel = screen.getByTestId('companion-insights-panel');
    expect(panel.textContent).toContain('Pixel');
  });

  it('renders individual insight items for paid users', () => {
    render(<CompanionInsightsPanel agentLabel="Aria" isPaidUser={true} />);
    expect(screen.getByTestId('insight-item-hsv-1')).toBeInTheDocument();
    expect(screen.getByTestId('insight-item-wrm-1')).toBeInTheDocument();
    expect(screen.getByTestId('insight-item-ocs-1')).toBeInTheDocument();
  });
});

describe('CompanionInsightsButton', () => {
  it('renders the button', () => {
    render(
      <CompanionInsightsButton agentLabel="Aria" isPaidUser={false} />
    );
    expect(
      screen.getByTestId('companion-insights-button')
    ).toBeInTheDocument();
  });

  it('shows lock icon for free users', () => {
    render(
      <CompanionInsightsButton agentLabel="Aria" isPaidUser={false} />
    );
    const btn = screen.getByTestId('companion-insights-button');
    expect(btn.textContent).toContain('Companion Insights');
  });

  it('shows agent label in button text for paid users', () => {
    render(
      <CompanionInsightsButton agentLabel="Aria" isPaidUser={true} />
    );
    const btn = screen.getByTestId('companion-insights-button');
    expect(btn.textContent).toContain("Aria's insights");
  });
});
