import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OnboardingSplitGate from '@/components/onboarding/onboarding-split-gate';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    onClick,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

const GATE_KEY = 'agentgram:onboarding-gate-shown';

let store: Record<string, string> = {};

beforeEach(() => {
  vi.clearAllMocks();
  store = {};
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, val: string) => {
        store[key] = val;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    },
    writable: true,
    configurable: true,
  });
});

describe('OnboardingSplitGate', () => {
  it('renders when localStorage key is absent', () => {
    render(<OnboardingSplitGate />);
    expect(screen.getByTestId('onboarding-split-gate')).toBeInTheDocument();
  });

  it('does not render when gate has already been shown', () => {
    localStorage.setItem(GATE_KEY, '1');
    render(<OnboardingSplitGate />);
    expect(screen.queryByTestId('onboarding-split-gate')).not.toBeInTheDocument();
  });

  it('shows title and subtitle', () => {
    render(<OnboardingSplitGate />);
    expect(screen.getByTestId('split-gate-title')).toHaveTextContent('Welcome to AgentGram');
  });

  it('renders both routing cards', () => {
    render(<OnboardingSplitGate />);
    expect(screen.getByTestId('split-gate-human-card')).toBeInTheDocument();
    expect(screen.getByTestId('split-gate-developer-card')).toBeInTheDocument();
  });

  it('human card links to /agents', () => {
    render(<OnboardingSplitGate />);
    const humanCard = screen.getByTestId('split-gate-human-card');
    expect(humanCard).toHaveAttribute('href', '/agents');
  });

  it('developer card links to /for-agents', () => {
    render(<OnboardingSplitGate />);
    const devCard = screen.getByTestId('split-gate-developer-card');
    expect(devCard).toHaveAttribute('href', '/for-agents');
  });

  it('renders proof strip on human card', () => {
    render(<OnboardingSplitGate />);
    expect(screen.getByTestId('split-gate-proof-human')).toBeInTheDocument();
  });

  it('renders proof strip on developer card', () => {
    render(<OnboardingSplitGate />);
    expect(screen.getByTestId('split-gate-proof-agent')).toBeInTheDocument();
  });

  it('dismiss button hides the gate and sets localStorage', () => {
    render(<OnboardingSplitGate />);
    fireEvent.click(screen.getByTestId('split-gate-dismiss'));
    expect(screen.queryByTestId('onboarding-split-gate')).not.toBeInTheDocument();
    expect(localStorage.getItem(GATE_KEY)).toBe('1');
  });

  it('skip link hides the gate and sets localStorage', () => {
    render(<OnboardingSplitGate />);
    fireEvent.click(screen.getByTestId('split-gate-skip'));
    expect(screen.queryByTestId('onboarding-split-gate')).not.toBeInTheDocument();
    expect(localStorage.getItem(GATE_KEY)).toBe('1');
  });

  it('clicking human card sets localStorage and hides gate', () => {
    render(<OnboardingSplitGate />);
    fireEvent.click(screen.getByTestId('split-gate-human-card'));
    expect(localStorage.getItem(GATE_KEY)).toBe('1');
    expect(screen.queryByTestId('onboarding-split-gate')).not.toBeInTheDocument();
  });

  it('clicking developer card sets localStorage and hides gate', () => {
    render(<OnboardingSplitGate />);
    fireEvent.click(screen.getByTestId('split-gate-developer-card'));
    expect(localStorage.getItem(GATE_KEY)).toBe('1');
    expect(screen.queryByTestId('onboarding-split-gate')).not.toBeInTheDocument();
  });

  it('has accessible dialog role and aria-modal', () => {
    render(<OnboardingSplitGate />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });
});
