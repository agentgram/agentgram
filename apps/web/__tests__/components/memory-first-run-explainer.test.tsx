import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MemoryFirstRunExplainer from '@/components/memory/MemoryFirstRunExplainer';

const STORAGE_KEY = 'agentgram:memory-explainer-seen';

let store: Record<string, string> = {};

function mockLocalStorage() {
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
}

beforeEach(() => {
  store = {};
  mockLocalStorage();
  vi.clearAllMocks();
});

describe('MemoryFirstRunExplainer', () => {
  it('renders on first visit when localStorage key is absent', () => {
    render(<MemoryFirstRunExplainer />);
    expect(screen.getByTestId('memory-first-run-explainer')).toBeInTheDocument();
  });

  it('does not render when localStorage key is already set', () => {
    store[STORAGE_KEY] = '1';
    mockLocalStorage();
    render(<MemoryFirstRunExplainer />);
    expect(screen.queryByTestId('memory-first-run-explainer')).not.toBeInTheDocument();
  });

  it('has accessible dialog role and aria-modal', () => {
    render(<MemoryFirstRunExplainer />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('starts on step 1 — Story Memory', () => {
    render(<MemoryFirstRunExplainer />);
    expect(screen.getByTestId('memory-explainer-title')).toHaveTextContent('Story Memory');
    expect(screen.getByTestId('memory-explainer-step-story-memory')).toBeInTheDocument();
  });

  it('renders step indicator with 3 dots', () => {
    render(<MemoryFirstRunExplainer />);
    expect(screen.getByTestId('memory-explainer-step-dot-0')).toBeInTheDocument();
    expect(screen.getByTestId('memory-explainer-step-dot-1')).toBeInTheDocument();
    expect(screen.getByTestId('memory-explainer-step-dot-2')).toBeInTheDocument();
  });

  it('shows Next button on first step, not Back or Get started', () => {
    render(<MemoryFirstRunExplainer />);
    expect(screen.getByTestId('memory-explainer-next')).toBeInTheDocument();
    expect(screen.queryByTestId('memory-explainer-back')).not.toBeInTheDocument();
    expect(screen.queryByTestId('memory-explainer-cta')).not.toBeInTheDocument();
  });

  it('advances to Key Facts step on Next click', () => {
    render(<MemoryFirstRunExplainer />);
    fireEvent.click(screen.getByTestId('memory-explainer-next'));
    expect(screen.getByTestId('memory-explainer-title')).toHaveTextContent('Key Facts');
    expect(screen.getByTestId('memory-explainer-step-key-facts')).toBeInTheDocument();
  });

  it('shows Back button on step 2', () => {
    render(<MemoryFirstRunExplainer />);
    fireEvent.click(screen.getByTestId('memory-explainer-next'));
    expect(screen.getByTestId('memory-explainer-back')).toBeInTheDocument();
  });

  it('navigates back from step 2 to step 1', () => {
    render(<MemoryFirstRunExplainer />);
    fireEvent.click(screen.getByTestId('memory-explainer-next'));
    fireEvent.click(screen.getByTestId('memory-explainer-back'));
    expect(screen.getByTestId('memory-explainer-title')).toHaveTextContent('Story Memory');
  });

  it('advances to Memory Usage step on second Next click', () => {
    render(<MemoryFirstRunExplainer />);
    fireEvent.click(screen.getByTestId('memory-explainer-next'));
    fireEvent.click(screen.getByTestId('memory-explainer-next'));
    expect(screen.getByTestId('memory-explainer-title')).toHaveTextContent('Memory Usage');
    expect(screen.getByTestId('memory-explainer-step-memory-usage')).toBeInTheDocument();
  });

  it('shows Get started CTA on last step instead of Next', () => {
    render(<MemoryFirstRunExplainer />);
    fireEvent.click(screen.getByTestId('memory-explainer-next'));
    fireEvent.click(screen.getByTestId('memory-explainer-next'));
    expect(screen.getByTestId('memory-explainer-cta')).toHaveTextContent('Get started');
    expect(screen.queryByTestId('memory-explainer-next')).not.toBeInTheDocument();
  });

  it('Get started CTA sets localStorage and dismisses modal', () => {
    render(<MemoryFirstRunExplainer />);
    fireEvent.click(screen.getByTestId('memory-explainer-next'));
    fireEvent.click(screen.getByTestId('memory-explainer-next'));
    fireEvent.click(screen.getByTestId('memory-explainer-cta'));
    expect(window.localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, '1');
    expect(screen.queryByTestId('memory-first-run-explainer')).not.toBeInTheDocument();
  });

  it('dismiss (X) button sets localStorage and hides modal', () => {
    render(<MemoryFirstRunExplainer />);
    fireEvent.click(screen.getByTestId('memory-explainer-dismiss'));
    expect(window.localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, '1');
    expect(screen.queryByTestId('memory-first-run-explainer')).not.toBeInTheDocument();
  });

  it('Skip link sets localStorage and hides modal', () => {
    render(<MemoryFirstRunExplainer />);
    fireEvent.click(screen.getByTestId('memory-explainer-skip'));
    expect(window.localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, '1');
    expect(screen.queryByTestId('memory-first-run-explainer')).not.toBeInTheDocument();
  });

  it('Story Memory description mentions automatic saving', () => {
    render(<MemoryFirstRunExplainer />);
    expect(screen.getByTestId('memory-explainer-description')).toHaveTextContent(
      'automatically saved'
    );
  });

  it('Memory Usage step highlights no c.ai+ paywall', () => {
    render(<MemoryFirstRunExplainer />);
    fireEvent.click(screen.getByTestId('memory-explainer-next'));
    fireEvent.click(screen.getByTestId('memory-explainer-next'));
    expect(screen.getByTestId('memory-explainer-description')).toHaveTextContent('c.ai+');
  });

  it('Memory Usage bullets mention unlimited and no c.ai+ requirement', () => {
    render(<MemoryFirstRunExplainer />);
    fireEvent.click(screen.getByTestId('memory-explainer-next'));
    fireEvent.click(screen.getByTestId('memory-explainer-next'));
    const bullets = screen.getByTestId('memory-explainer-bullets');
    expect(bullets).toHaveTextContent('Unlimited');
    expect(bullets).toHaveTextContent('no c.ai+ required');
  });

  it('step counter shows correct progress text', () => {
    render(<MemoryFirstRunExplainer />);
    expect(screen.getByText(/Step 1 of 3/)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('memory-explainer-next'));
    expect(screen.getByText(/Step 2 of 3/)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('memory-explainer-next'));
    expect(screen.getByText(/Step 3 of 3/)).toBeInTheDocument();
  });
});
