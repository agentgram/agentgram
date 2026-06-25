import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  PremiumFeaturePreviewPanel,
  PremiumFeatureRow,
  PremiumFeatureCategorySection,
  PREMIUM_FEATURE_CATEGORIES,
} from '@/components/settings/PremiumFeaturePreviewPanel';

describe('PremiumFeaturePreviewPanel', () => {
  it('renders the panel container', () => {
    render(<PremiumFeaturePreviewPanel />);
    expect(
      screen.getByTestId('premium-feature-preview-panel')
    ).toBeInTheDocument();
  });

  it('renders the column header table with Starter and Pro labels', () => {
    render(<PremiumFeaturePreviewPanel />);
    expect(
      screen.getByTestId('premium-feature-table-header')
    ).toBeInTheDocument();
    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('renders all five feature categories', () => {
    render(<PremiumFeaturePreviewPanel />);
    expect(screen.getByTestId('premium-category-memory')).toBeInTheDocument();
    expect(screen.getByTestId('premium-category-voice')).toBeInTheDocument();
    expect(
      screen.getByTestId('premium-category-image-generation')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('premium-category-group-chat')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('premium-category-analytics')
    ).toBeInTheDocument();
  });

  it('shows upgrade CTA section', () => {
    render(<PremiumFeaturePreviewPanel />);
    expect(
      screen.getByTestId('premium-upgrade-cta-section')
    ).toBeInTheDocument();
  });

  it('upgrade CTA button links to /pricing', () => {
    render(<PremiumFeaturePreviewPanel />);
    const button = screen.getByTestId('premium-upgrade-cta-button');
    expect(button).toBeInTheDocument();
    const anchor = button.tagName === 'A' ? button : button.querySelector('a');
    expect(anchor ?? button).toHaveAttribute('href', '/pricing');
  });

  it('trial CTA button is present and links to /pricing', () => {
    render(<PremiumFeaturePreviewPanel />);
    const trialBtn = screen.getByTestId('premium-trial-cta-button');
    expect(trialBtn).toBeInTheDocument();
    const anchor =
      trialBtn.tagName === 'A' ? trialBtn : trialBtn.querySelector('a');
    expect(anchor ?? trialBtn).toHaveAttribute('href', '/pricing');
  });

  it('trial CTA contains "7 days" copy', () => {
    render(<PremiumFeaturePreviewPanel />);
    const trialBtn = screen.getByTestId('premium-trial-cta-button');
    expect(trialBtn.textContent).toMatch(/7 days/i);
  });

  it('renders "Upgrade to Pro" text in CTA', () => {
    render(<PremiumFeaturePreviewPanel />);
    expect(screen.getByTestId('premium-upgrade-cta-button')).toHaveTextContent(
      'Upgrade to Pro'
    );
  });
});

describe('PremiumFeatureRow', () => {
  const lockedFeature = {
    id: 'test-locked',
    name: 'Locked Feature',
    description: 'Only on Pro',
    starterIncluded: false,
    proIncluded: true,
  };

  const includedFeature = {
    id: 'test-included',
    name: 'Included Feature',
    description: 'Available on Starter',
    starterIncluded: true,
    proIncluded: true,
  };

  it('renders the feature row container', () => {
    render(<PremiumFeatureRow feature={lockedFeature} />);
    expect(
      screen.getByTestId('premium-feature-row-test-locked')
    ).toBeInTheDocument();
  });

  it('shows locked state for Starter when feature not included', () => {
    render(<PremiumFeatureRow feature={lockedFeature} />);
    expect(
      screen.getByTestId('starter-locked-test-locked')
    ).toBeInTheDocument();
  });

  it('shows included badge for Starter when feature is included', () => {
    render(<PremiumFeatureRow feature={includedFeature} />);
    expect(
      screen.getByTestId('starter-included-test-included')
    ).toBeInTheDocument();
  });

  it('shows Pro included badge when pro feature is included', () => {
    render(<PremiumFeatureRow feature={lockedFeature} />);
    expect(
      screen.getByTestId('pro-included-test-locked')
    ).toBeInTheDocument();
  });

  it('renders feature name and description', () => {
    render(<PremiumFeatureRow feature={lockedFeature} />);
    expect(screen.getByText('Locked Feature')).toBeInTheDocument();
    expect(screen.getByText('Only on Pro')).toBeInTheDocument();
  });
});

describe('PremiumFeatureCategorySection', () => {
  const category = PREMIUM_FEATURE_CATEGORIES[0]; // Memory

  it('renders the category container', () => {
    render(<PremiumFeatureCategorySection category={category} />);
    expect(
      screen.getByTestId(`premium-category-${category.id}`)
    ).toBeInTheDocument();
  });

  it('renders category label', () => {
    render(<PremiumFeatureCategorySection category={category} />);
    expect(screen.getByText(category.label)).toBeInTheDocument();
  });

  it('renders all features in the category', () => {
    render(<PremiumFeatureCategorySection category={category} />);
    category.features.forEach((feature) => {
      expect(
        screen.getByTestId(`premium-feature-row-${feature.id}`)
      ).toBeInTheDocument();
    });
  });
});
