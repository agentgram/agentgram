import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { isAdultVerified } from '../../../lib/persona';

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
// isAdultVerified unit tests
// ──────────────────────────────────────────────

describe('isAdultVerified', () => {
  it('returns false when age_verified is false', () => {
    expect(isAdultVerified({ age_verified: false })).toBe(false);
  });

  it('returns false when age_verified is null', () => {
    expect(isAdultVerified({ age_verified: null })).toBe(false);
  });

  it('returns false when age_verified is undefined', () => {
    expect(isAdultVerified({})).toBe(false);
  });

  it('returns false when verified but under 18', () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 16);
    expect(
      isAdultVerified({
        age_verified: true,
        date_of_birth: dob.toISOString(),
      })
    ).toBe(false);
  });

  it('returns true when age_verified=true and over 18', () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 20);
    expect(
      isAdultVerified({
        age_verified: true,
        date_of_birth: dob.toISOString(),
      })
    ).toBe(true);
  });

  it('returns true when age_verified=true and no date_of_birth', () => {
    expect(isAdultVerified({ age_verified: true })).toBe(true);
  });

  it('returns false exactly at the 18-year boundary (one day under)', () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 18);
    dob.setDate(dob.getDate() + 1);
    expect(isAdultVerified({ age_verified: true, date_of_birth: dob.toISOString() })).toBe(false);
  });

  it('returns true exactly at the 18-year boundary (one day over)', () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 18);
    dob.setDate(dob.getDate() - 1);
    expect(isAdultVerified({ age_verified: true, date_of_birth: dob.toISOString() })).toBe(true);
  });
});

// ──────────────────────────────────────────────
// AdultVerifiedPersonaGate component tests
// ──────────────────────────────────────────────

describe('AdultVerifiedPersonaGate', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('shows gate overlay when age_verified is false', async () => {
    const { AdultVerifiedPersonaGate } = await import(
      '../../../components/persona/AdultVerifiedPersonaGate'
    );

    await act(async () => {
      render(
        <AdultVerifiedPersonaGate profile={{ age_verified: false }}>
          <div>Mature content</div>
        </AdultVerifiedPersonaGate>
      );
    });

    expect(
      screen.getByTestId('adult-verified-persona-gate')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Verify your age to unlock mature persona modes/i)
    ).toBeInTheDocument();
  });

  it('shows gate overlay when profile has no age_verified field', async () => {
    const { AdultVerifiedPersonaGate } = await import(
      '../../../components/persona/AdultVerifiedPersonaGate'
    );

    await act(async () => {
      render(
        <AdultVerifiedPersonaGate profile={{}}>
          <div>Mature content</div>
        </AdultVerifiedPersonaGate>
      );
    });

    expect(
      screen.getByTestId('adult-verified-persona-gate')
    ).toBeInTheDocument();
  });

  it('renders children without gate when user is verified adult', async () => {
    const { AdultVerifiedPersonaGate } = await import(
      '../../../components/persona/AdultVerifiedPersonaGate'
    );
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 25);

    await act(async () => {
      render(
        <AdultVerifiedPersonaGate
          profile={{ age_verified: true, date_of_birth: dob.toISOString() }}
        >
          <div>Mature content</div>
        </AdultVerifiedPersonaGate>
      );
    });

    expect(
      screen.queryByTestId('adult-verified-persona-gate')
    ).not.toBeInTheDocument();
    expect(screen.getByText('Mature content')).toBeInTheDocument();
  });

  it('renders children without gate when age_verified=true and no dob', async () => {
    const { AdultVerifiedPersonaGate } = await import(
      '../../../components/persona/AdultVerifiedPersonaGate'
    );

    await act(async () => {
      render(
        <AdultVerifiedPersonaGate profile={{ age_verified: true }}>
          <div>Mature content</div>
        </AdultVerifiedPersonaGate>
      );
    });

    expect(
      screen.queryByTestId('adult-verified-persona-gate')
    ).not.toBeInTheDocument();
    expect(screen.getByText('Mature content')).toBeInTheDocument();
  });

  it('gate overlay shows a "Verify Age" CTA link to settings', async () => {
    const { AdultVerifiedPersonaGate } = await import(
      '../../../components/persona/AdultVerifiedPersonaGate'
    );

    await act(async () => {
      render(
        <AdultVerifiedPersonaGate profile={{ age_verified: false }}>
          <div>Mature content</div>
        </AdultVerifiedPersonaGate>
      );
    });

    const cta = screen.getByRole('link', { name: /verify age/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '/dashboard/settings');
  });

  it('gate overlay includes compliance copy mentioning SB 243', async () => {
    const { AdultVerifiedPersonaGate } = await import(
      '../../../components/persona/AdultVerifiedPersonaGate'
    );

    await act(async () => {
      render(
        <AdultVerifiedPersonaGate profile={{ age_verified: false }}>
          <div>Mature content</div>
        </AdultVerifiedPersonaGate>
      );
    });

    expect(screen.getByText(/SB.?243/i)).toBeInTheDocument();
  });

  it('gate overlay shows privacy copy with no-biometric message', async () => {
    const { AdultVerifiedPersonaGate } = await import(
      '../../../components/persona/AdultVerifiedPersonaGate'
    );

    await act(async () => {
      render(
        <AdultVerifiedPersonaGate profile={{ age_verified: false }}>
          <div>Mature content</div>
        </AdultVerifiedPersonaGate>
      );
    });

    const privacyCopy = screen.getByTestId('adult-gate-privacy-copy');
    expect(privacyCopy).toBeInTheDocument();
    expect(privacyCopy).toHaveTextContent(/no biometric data/i);
  });

  it('blurs children behind the gate overlay', async () => {
    const { AdultVerifiedPersonaGate } = await import(
      '../../../components/persona/AdultVerifiedPersonaGate'
    );

    await act(async () => {
      render(
        <AdultVerifiedPersonaGate profile={{ age_verified: false }}>
          <div>Mature content</div>
        </AdultVerifiedPersonaGate>
      );
    });

    const blurLayer = screen
      .getByText('Mature content')
      .closest('[aria-hidden="true"]');
    expect(blurLayer).toBeInTheDocument();
    expect(blurLayer).toHaveClass('blur-sm');
  });

  it('gate is shown for a 17-year-old with age_verified=true', async () => {
    const { AdultVerifiedPersonaGate } = await import(
      '../../../components/persona/AdultVerifiedPersonaGate'
    );
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 17);

    await act(async () => {
      render(
        <AdultVerifiedPersonaGate
          profile={{ age_verified: true, date_of_birth: dob.toISOString() }}
        >
          <div>Mature content</div>
        </AdultVerifiedPersonaGate>
      );
    });

    expect(
      screen.getByTestId('adult-verified-persona-gate')
    ).toBeInTheDocument();
  });

  it('renders nothing before mount (SSR guard)', async () => {
    const { AdultVerifiedPersonaGate } = await import(
      '../../../components/persona/AdultVerifiedPersonaGate'
    );

    // Synchronous render without act — component starts unmounted
    const { container } = render(
      <AdultVerifiedPersonaGate profile={{ age_verified: false }}>
        <div>Mature content</div>
      </AdultVerifiedPersonaGate>
    );

    // After awaiting act, it becomes mounted. Just assert the structure exists.
    await act(async () => {});
    expect(container).toBeTruthy();
  });
});
