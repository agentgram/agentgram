import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { MinorSafeGate } from '../../components/minor-safe-gate';
import { isMinorOrUnverified } from '../../lib/minor-safe-mode';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe('isMinorOrUnverified', () => {
  it('returns true when age_verified is false', () => {
    expect(isMinorOrUnverified({ age_verified: false })).toBe(true);
  });

  it('returns true when age_verified is null', () => {
    expect(isMinorOrUnverified({ age_verified: null })).toBe(true);
  });

  it('returns true when age_verified is undefined', () => {
    expect(isMinorOrUnverified({})).toBe(true);
  });

  it('returns true when verified but under 18', () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 16);
    expect(
      isMinorOrUnverified({
        age_verified: true,
        date_of_birth: dob.toISOString(),
      })
    ).toBe(true);
  });

  it('returns false when age_verified=true and over 18', () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 20);
    expect(
      isMinorOrUnverified({
        age_verified: true,
        date_of_birth: dob.toISOString(),
      })
    ).toBe(false);
  });

  it('returns false when age_verified=true and no dob', () => {
    expect(isMinorOrUnverified({ age_verified: true })).toBe(false);
  });
});

describe('MinorSafeGate', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
        removeItem: (key: string) => {
          storage.delete(key);
        },
        clear: () => {
          storage.clear();
        },
      },
      configurable: true,
      writable: true,
    });
  });

  it('shows gate overlay when age_verified is false', async () => {
    await act(async () => {
      render(
        <MinorSafeGate profile={{ age_verified: false }}>
          <div>Protected content</div>
        </MinorSafeGate>
      );
    });

    expect(screen.getByTestId('minor-safe-gate')).toBeInTheDocument();
    expect(screen.getByText(/Age verification required/i)).toBeInTheDocument();
  });

  it('shows children without gate when age_verified is true and adult', async () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 20);

    await act(async () => {
      render(
        <MinorSafeGate
          profile={{ age_verified: true, date_of_birth: dob.toISOString() }}
        >
          <div>Protected content</div>
        </MinorSafeGate>
      );
    });

    expect(screen.queryByTestId('minor-safe-gate')).not.toBeInTheDocument();
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('dismisses gate and sets safe mode when Continue in Safe Mode is clicked', async () => {
    await act(async () => {
      render(
        <MinorSafeGate profile={{ age_verified: false }}>
          <div>Protected content</div>
        </MinorSafeGate>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText(/Continue in Safe Mode/i));
    });

    expect(storage.get('agentgram_safe_mode')).toBe('true');
    expect(
      screen.queryByText(/Age verification required/i)
    ).not.toBeInTheDocument();
  });

  it('skips gate when safe mode is already set in localStorage', async () => {
    storage.set('agentgram_safe_mode', 'true');

    await act(async () => {
      render(
        <MinorSafeGate profile={{ age_verified: false }}>
          <div>Protected content</div>
        </MinorSafeGate>
      );
    });

    expect(screen.queryByTestId('minor-safe-gate')).not.toBeInTheDocument();
  });
});
