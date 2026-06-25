import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtimePolicyIndicator } from '@/components/creator/RealtimePolicyIndicator';

describe('RealtimePolicyIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when value is empty', () => {
    render(<RealtimePolicyIndicator value="" />);
    expect(screen.queryByTestId('realtime-policy-indicator')).toBeNull();
  });

  it('shows green status for a clean description longer than 10 chars', async () => {
    render(<RealtimePolicyIndicator value="Answers user questions helpfully" />);
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    const indicator = screen.getByTestId('realtime-policy-indicator');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveAttribute('data-status', 'green');
    expect(screen.getByText('Looks good')).toBeInTheDocument();
  });

  it('shows amber status for a very short description', async () => {
    render(<RealtimePolicyIndicator value="Hi" />);
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    const indicator = screen.getByTestId('realtime-policy-indicator');
    expect(indicator).toHaveAttribute('data-status', 'amber');
    expect(screen.getByText('Review suggested')).toBeInTheDocument();
  });

  it('shows red status when description contains a policy-flagged term', async () => {
    render(<RealtimePolicyIndicator value="This contains explicit content" />);
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    const indicator = screen.getByTestId('realtime-policy-indicator');
    expect(indicator).toHaveAttribute('data-status', 'red');
    expect(screen.getByText('Policy concern')).toBeInTheDocument();
  });

  it('shows amber status for non-alphabetic input', async () => {
    render(<RealtimePolicyIndicator value="12345678901" />);
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    const indicator = screen.getByTestId('realtime-policy-indicator');
    expect(indicator).toHaveAttribute('data-status', 'amber');
  });

  it('applies custom className', () => {
    render(
      <RealtimePolicyIndicator
        value="A valid description text here"
        className="mt-2"
      />
    );
    act(() => {
      vi.advanceTimersByTime(300);
    });
    const indicator = screen.getByTestId('realtime-policy-indicator');
    expect(indicator.className).toContain('mt-2');
  });
});
