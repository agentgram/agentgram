import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LabsPanel } from '@/components/labs/LabsPanel';
import { LabsFeatureToggle } from '@/components/labs/LabsFeatureToggle';
import { Mic } from 'lucide-react';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('LabsPanel', () => {
  it('renders all three feature toggles for free tier', () => {
    render(<LabsPanel plan="free" />);
    expect(screen.getByTestId('labs-panel')).toBeInTheDocument();
    expect(screen.getByTestId('labs-feature-toggle-voice-enhancements')).toBeInTheDocument();
    expect(screen.getByTestId('labs-feature-toggle-image-gen')).toBeInTheDocument();
    expect(screen.getByTestId('labs-feature-toggle-advanced-memory-modes')).toBeInTheDocument();
  });

  it('shows upgrade CTAs for all features on free tier', () => {
    render(<LabsPanel plan="free" />);
    expect(
      screen.getByTestId('labs-feature-toggle-voice-enhancements-upgrade-cta')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('labs-feature-toggle-image-gen-upgrade-cta')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('labs-feature-toggle-advanced-memory-modes-upgrade-cta')
    ).toBeInTheDocument();
  });

  it('hides upgrade CTAs on pro tier', () => {
    render(<LabsPanel plan="pro" />);
    expect(
      screen.queryByTestId('labs-feature-toggle-voice-enhancements-upgrade-cta')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('labs-feature-toggle-image-gen-upgrade-cta')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('labs-feature-toggle-advanced-memory-modes-upgrade-cta')
    ).not.toBeInTheDocument();
  });

  it('hides upgrade CTAs on enterprise tier', () => {
    render(<LabsPanel plan="enterprise" />);
    expect(
      screen.queryByTestId('labs-feature-toggle-voice-enhancements-upgrade-cta')
    ).not.toBeInTheDocument();
  });

  it('renders feature titles correctly', () => {
    render(<LabsPanel plan="free" />);
    expect(
      screen.getByTestId('labs-feature-toggle-voice-enhancements-title')
    ).toHaveTextContent('Voice Enhancements');
    expect(
      screen.getByTestId('labs-feature-toggle-image-gen-title')
    ).toHaveTextContent('Image Generation');
    expect(
      screen.getByTestId('labs-feature-toggle-advanced-memory-modes-title')
    ).toHaveTextContent('Advanced Memory Modes');
  });
});

describe('LabsFeatureToggle', () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, val: string) => { store[key] = val; }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
      },
      writable: true,
    });
  });

  it('persists toggle state to localStorage on click', () => {
    render(
      <LabsFeatureToggle
        id="test-persist"
        title="Persist Feature"
        description="Tests persistence"
        icon={Mic}
        isPaidFeature={false}
        isPaidTier={true}
        defaultEnabled={false}
      />
    );
    const toggle = screen.getByTestId('labs-feature-toggle-test-persist-switch');
    fireEvent.click(toggle);
    expect(localStorage.getItem('agentgram:labs-flag-test-persist')).toBe('true');
    fireEvent.click(toggle);
    expect(localStorage.getItem('agentgram:labs-flag-test-persist')).toBe('false');
  });

  it('restores toggle state from localStorage on mount', () => {
    localStorage.setItem('agentgram:labs-flag-test-restore', 'true');
    render(
      <LabsFeatureToggle
        id="test-restore"
        title="Restore Feature"
        description="Tests restore"
        icon={Mic}
        isPaidFeature={false}
        isPaidTier={true}
        defaultEnabled={false}
      />
    );
    const toggle = screen.getByTestId('labs-feature-toggle-test-restore-switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('renders in unlocked state for paid tier', () => {
    render(
      <LabsFeatureToggle
        id="test-feature"
        title="Test Feature"
        description="A test feature"
        icon={Mic}
        isPaidFeature={true}
        isPaidTier={true}
      />
    );
    expect(
      screen.queryByTestId('labs-feature-toggle-test-feature-upgrade-cta')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('labs-feature-toggle-test-feature-locked-badge')
    ).not.toBeInTheDocument();
  });

  it('shows locked badge when feature is paid and user is free tier', () => {
    render(
      <LabsFeatureToggle
        id="test-feature"
        title="Test Feature"
        description="A test feature"
        icon={Mic}
        isPaidFeature={true}
        isPaidTier={false}
      />
    );
    expect(
      screen.getByTestId('labs-feature-toggle-test-feature-locked-badge')
    ).toBeInTheDocument();
  });

  it('toggle is disabled when feature is locked', () => {
    render(
      <LabsFeatureToggle
        id="test-feature"
        title="Test Feature"
        description="A test feature"
        icon={Mic}
        isPaidFeature={true}
        isPaidTier={false}
      />
    );
    const toggle = screen.getByTestId('labs-feature-toggle-test-feature-switch');
    expect(toggle).toBeDisabled();
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('toggle switches state when clicked in unlocked mode', () => {
    render(
      <LabsFeatureToggle
        id="test-feature"
        title="Test Feature"
        description="A test feature"
        icon={Mic}
        isPaidFeature={true}
        isPaidTier={true}
        defaultEnabled={false}
      />
    );
    const toggle = screen.getByTestId('labs-feature-toggle-test-feature-switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('upgrade button links to /pricing', () => {
    render(
      <LabsFeatureToggle
        id="test-feature"
        title="Test Feature"
        description="A test feature"
        icon={Mic}
        isPaidFeature={true}
        isPaidTier={false}
      />
    );
    const upgradeButton = screen.getByTestId(
      'labs-feature-toggle-test-feature-upgrade-button'
    );
    expect(upgradeButton).toHaveAttribute('href', '/pricing');
  });

  it('paid badge is shown for paid features', () => {
    render(
      <LabsFeatureToggle
        id="test-feature"
        title="Test Feature"
        description="A test feature"
        icon={Mic}
        isPaidFeature={true}
        isPaidTier={true}
      />
    );
    expect(
      screen.getByTestId('labs-feature-toggle-test-feature-paid-badge')
    ).toBeInTheDocument();
  });

  it('does not show paid badge for free features', () => {
    render(
      <LabsFeatureToggle
        id="free-feature"
        title="Free Feature"
        description="A free feature"
        icon={Mic}
        isPaidFeature={false}
        isPaidTier={false}
      />
    );
    expect(
      screen.queryByTestId('labs-feature-toggle-free-feature-paid-badge')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('labs-feature-toggle-free-feature-upgrade-cta')
    ).not.toBeInTheDocument();
  });
});
