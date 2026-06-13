import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimeBudgetPanel } from '@/components/dashboard/TimeBudgetPanel';

const STORAGE_KEY = 'agentgram:timeBudget';

describe('TimeBudgetPanel', () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, val: string) => {
          store[key] = val;
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          store = {};
        }),
      },
      writable: true,
    });
  });

  it('renders the panel container', () => {
    render(<TimeBudgetPanel initialGoals={{ dailyMinutes: 30, weeklyHours: 3 }} />);
    expect(screen.getByTestId('time-budget-panel')).toBeInTheDocument();
  });

  it('renders the daily goal input with default value', () => {
    render(<TimeBudgetPanel initialGoals={{ dailyMinutes: 30, weeklyHours: 3 }} />);
    const input = screen.getByTestId('daily-goal-input') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('30');
  });

  it('renders the weekly goal input with default value', () => {
    render(<TimeBudgetPanel initialGoals={{ dailyMinutes: 30, weeklyHours: 3 }} />);
    const input = screen.getByTestId('weekly-goal-input') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('3');
  });

  it('renders the save goals button', () => {
    render(<TimeBudgetPanel initialGoals={{ dailyMinutes: 30, weeklyHours: 3 }} />);
    expect(screen.getByTestId('time-budget-save-btn')).toBeInTheDocument();
  });

  it('renders the weekly trend chart', () => {
    render(<TimeBudgetPanel initialGoals={{ dailyMinutes: 30, weeklyHours: 3 }} />);
    expect(screen.getByTestId('weekly-trend-chart')).toBeInTheDocument();
  });

  it('renders the weekly trend summary', () => {
    render(<TimeBudgetPanel initialGoals={{ dailyMinutes: 30, weeklyHours: 3 }} />);
    expect(screen.getByTestId('weekly-trend-summary')).toBeInTheDocument();
  });

  it('renders 7 trend bars (one per weekday)', () => {
    render(<TimeBudgetPanel initialGoals={{ dailyMinutes: 30, weeklyHours: 3 }} />);
    const chart = screen.getByTestId('weekly-trend-chart');
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    for (const day of days) {
      expect(
        chart.querySelector(`[data-testid="trend-bar-${day}"]`)
      ).toBeInTheDocument();
    }
  });

  it('updates daily goal input when user types', () => {
    render(<TimeBudgetPanel initialGoals={{ dailyMinutes: 30, weeklyHours: 3 }} />);
    const input = screen.getByTestId('daily-goal-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '45' } });
    expect(input.value).toBe('45');
  });

  it('updates weekly goal input when user types', () => {
    render(<TimeBudgetPanel initialGoals={{ dailyMinutes: 30, weeklyHours: 3 }} />);
    const input = screen.getByTestId('weekly-goal-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '5' } });
    expect(input.value).toBe('5');
  });

  it('save button persists goals to localStorage', () => {
    render(<TimeBudgetPanel initialGoals={{ dailyMinutes: 30, weeklyHours: 3 }} />);
    const dailyInput = screen.getByTestId('daily-goal-input');
    const weeklyInput = screen.getByTestId('weekly-goal-input');
    fireEvent.change(dailyInput, { target: { value: '60' } });
    fireEvent.change(weeklyInput, { target: { value: '5' } });
    fireEvent.click(screen.getByTestId('time-budget-save-btn'));
    const raw = store[STORAGE_KEY];
    expect(raw).toBeDefined();
    const stored = JSON.parse(raw) as { dailyMinutes: number; weeklyHours: number };
    expect(stored.dailyMinutes).toBe(60);
    expect(stored.weeklyHours).toBe(5);
  });

  it('shows success status message after saving', () => {
    render(<TimeBudgetPanel initialGoals={{ dailyMinutes: 30, weeklyHours: 3 }} />);
    fireEvent.click(screen.getByTestId('time-budget-save-btn'));
    expect(screen.getByRole('status')).toHaveTextContent('Session goals saved.');
  });

  it('renders the wellbeing badge', () => {
    render(<TimeBudgetPanel initialGoals={{ dailyMinutes: 30, weeklyHours: 3 }} />);
    expect(screen.getByTestId('time-budget-free-badge')).toBeInTheDocument();
  });
});
