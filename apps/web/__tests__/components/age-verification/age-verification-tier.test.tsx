import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  getAgeVerificationTier,
  TIER_CONTENT_ACCESS,
  TIER_LABELS,
  TIER_DESCRIPTIONS,
} from '../../../lib/age-verification-tier';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// ──────────────────────────────────────────────
// getAgeVerificationTier — pure function tests
// ──────────────────────────────────────────────

describe('getAgeVerificationTier', () => {
  it('returns "unknown" for null profile', () => {
    expect(getAgeVerificationTier(null)).toBe('unknown');
  });

  it('returns "adult_unverified" when age_verified is false', () => {
    expect(getAgeVerificationTier({ age_verified: false })).toBe(
      'adult_unverified'
    );
  });

  it('returns "adult_unverified" when age_verified is null', () => {
    expect(getAgeVerificationTier({ age_verified: null })).toBe(
      'adult_unverified'
    );
  });

  it('returns "adult_unverified" when age_verified is undefined (empty profile)', () => {
    expect(getAgeVerificationTier({})).toBe('adult_unverified');
  });

  it('returns "minor" when age_verified=true and dob indicates under-18', () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 16);
    expect(
      getAgeVerificationTier({ age_verified: true, date_of_birth: dob.toISOString() })
    ).toBe('minor');
  });

  it('returns "adult_verified" when age_verified=true and dob indicates 20-year-old', () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 20);
    expect(
      getAgeVerificationTier({ age_verified: true, date_of_birth: dob.toISOString() })
    ).toBe('adult_verified');
  });

  it('returns "adult_verified" when age_verified=true and no date_of_birth', () => {
    expect(getAgeVerificationTier({ age_verified: true })).toBe('adult_verified');
  });

  it('returns "minor" exactly at 17 years + 364 days (one day under 18)', () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 18);
    dob.setDate(dob.getDate() + 1);
    expect(
      getAgeVerificationTier({ age_verified: true, date_of_birth: dob.toISOString() })
    ).toBe('minor');
  });

  it('returns "adult_verified" one day past the 18-year cutoff', () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 18);
    dob.setDate(dob.getDate() - 1);
    expect(
      getAgeVerificationTier({ age_verified: true, date_of_birth: dob.toISOString() })
    ).toBe('adult_verified');
  });
});

// ──────────────────────────────────────────────
// TIER_CONTENT_ACCESS rules
// ──────────────────────────────────────────────

describe('TIER_CONTENT_ACCESS', () => {
  it('"minor" tier has safetyModeOnly=true', () => {
    expect(TIER_CONTENT_ACCESS.minor.safetyModeOnly).toBe(true);
  });

  it('"minor" tier requires WA rest nudge', () => {
    expect(TIER_CONTENT_ACCESS.minor.waRestNudgeRequired).toBe(true);
  });

  it('"minor" tier does not have standardFeatures', () => {
    expect(TIER_CONTENT_ACCESS.minor.standardFeatures).toBe(false);
  });

  it('"minor" tier does not have advancedPersonas', () => {
    expect(TIER_CONTENT_ACCESS.minor.advancedPersonas).toBe(false);
  });

  it('"unknown" tier has safetyModeOnly=true', () => {
    expect(TIER_CONTENT_ACCESS.unknown.safetyModeOnly).toBe(true);
  });

  it('"unknown" tier does not require WA rest nudge', () => {
    expect(TIER_CONTENT_ACCESS.unknown.waRestNudgeRequired).toBe(false);
  });

  it('"adult_unverified" has standardFeatures but not advancedPersonas', () => {
    expect(TIER_CONTENT_ACCESS.adult_unverified.standardFeatures).toBe(true);
    expect(TIER_CONTENT_ACCESS.adult_unverified.advancedPersonas).toBe(false);
  });

  it('"adult_verified" has full access including advancedPersonas', () => {
    expect(TIER_CONTENT_ACCESS.adult_verified.safetyModeOnly).toBe(false);
    expect(TIER_CONTENT_ACCESS.adult_verified.standardFeatures).toBe(true);
    expect(TIER_CONTENT_ACCESS.adult_verified.advancedPersonas).toBe(true);
  });

  it('"adult_verified" does not require WA rest nudge', () => {
    expect(TIER_CONTENT_ACCESS.adult_verified.waRestNudgeRequired).toBe(false);
  });
});

// ──────────────────────────────────────────────
// TIER_LABELS & TIER_DESCRIPTIONS coverage
// ──────────────────────────────────────────────

describe('TIER_LABELS', () => {
  it('all four tiers have non-empty labels', () => {
    const tiers = ['unknown', 'minor', 'adult_unverified', 'adult_verified'] as const;
    for (const t of tiers) {
      expect(TIER_LABELS[t].length).toBeGreaterThan(0);
    }
  });
});

describe('TIER_DESCRIPTIONS', () => {
  it('"adult_unverified" description mentions verifying age', () => {
    expect(TIER_DESCRIPTIONS.adult_unverified.toLowerCase()).toMatch(/verify/);
  });

  it('"minor" description mentions WA HB 2822', () => {
    expect(TIER_DESCRIPTIONS.minor).toMatch(/WA HB 2822/);
  });
});

// ──────────────────────────────────────────────
// AgeVerificationTierBadge component
// ──────────────────────────────────────────────

describe('AgeVerificationTierBadge', () => {
  it('renders tier badge for adult_verified', async () => {
    const { AgeVerificationTierBadge } = await import(
      '../../../components/age-verification/AgeVerificationTierBadge'
    );

    await act(async () => {
      render(<AgeVerificationTierBadge tier="adult_verified" />);
    });

    expect(screen.getByTestId('age-verification-tier-badge')).toBeInTheDocument();
    expect(screen.getByText(TIER_LABELS.adult_verified)).toBeInTheDocument();
  });

  it('renders tier badge for minor and shows WA compliance note', async () => {
    const { AgeVerificationTierBadge } = await import(
      '../../../components/age-verification/AgeVerificationTierBadge'
    );

    await act(async () => {
      render(<AgeVerificationTierBadge tier="minor" />);
    });

    expect(screen.getByTestId('wa-compliance-note')).toBeInTheDocument();
    expect(screen.getByTestId('wa-compliance-note')).toHaveAttribute(
      'data-wa-compliance',
      'WA_HB_2822'
    );
  });

  it('does not show WA compliance note for adult_verified', async () => {
    const { AgeVerificationTierBadge } = await import(
      '../../../components/age-verification/AgeVerificationTierBadge'
    );

    await act(async () => {
      render(<AgeVerificationTierBadge tier="adult_verified" />);
    });

    expect(screen.queryByTestId('wa-compliance-note')).not.toBeInTheDocument();
  });

  it('renders correct data-tier attribute', async () => {
    const { AgeVerificationTierBadge } = await import(
      '../../../components/age-verification/AgeVerificationTierBadge'
    );

    await act(async () => {
      render(<AgeVerificationTierBadge tier="adult_unverified" />);
    });

    expect(screen.getByTestId('age-verification-tier-badge')).toHaveAttribute(
      'data-tier',
      'adult_unverified'
    );
  });
});

// ──────────────────────────────────────────────
// AgeVerificationUpgradeCTA component
// ──────────────────────────────────────────────

describe('AgeVerificationUpgradeCTA', () => {
  it('renders CTA for adult_unverified tier', async () => {
    const { AgeVerificationUpgradeCTA } = await import(
      '../../../components/age-verification/AgeVerificationUpgradeCTA'
    );

    await act(async () => {
      render(<AgeVerificationUpgradeCTA tier="adult_unverified" />);
    });

    expect(
      screen.getByTestId('age-verification-upgrade-cta')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /verify age now/i })).toHaveAttribute(
      'href',
      '/dashboard/settings'
    );
  });

  it('does not render CTA for adult_verified tier', async () => {
    const { AgeVerificationUpgradeCTA } = await import(
      '../../../components/age-verification/AgeVerificationUpgradeCTA'
    );

    await act(async () => {
      render(<AgeVerificationUpgradeCTA tier="adult_verified" />);
    });

    expect(
      screen.queryByTestId('age-verification-upgrade-cta')
    ).not.toBeInTheDocument();
  });

  it('does not render CTA for minor tier', async () => {
    const { AgeVerificationUpgradeCTA } = await import(
      '../../../components/age-verification/AgeVerificationUpgradeCTA'
    );

    await act(async () => {
      render(<AgeVerificationUpgradeCTA tier="minor" />);
    });

    expect(
      screen.queryByTestId('age-verification-upgrade-cta')
    ).not.toBeInTheDocument();
  });

  it('upgrade CTA copy mentions no biometric data', async () => {
    const { AgeVerificationUpgradeCTA } = await import(
      '../../../components/age-verification/AgeVerificationUpgradeCTA'
    );

    await act(async () => {
      render(<AgeVerificationUpgradeCTA tier="adult_unverified" />);
    });

    expect(screen.getByText(/no biometric data/i)).toBeInTheDocument();
  });
});
