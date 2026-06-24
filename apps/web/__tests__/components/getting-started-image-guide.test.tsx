import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GettingStartedImageGuide,
  ANCHOR_PRESETS,
} from '@/components/image-gen/getting-started-image-guide';

describe('GettingStartedImageGuide', () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    vi.restoreAllMocks();
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

  it('renders the container element', () => {
    render(<GettingStartedImageGuide forceVisible />);
    expect(
      screen.getByTestId('getting-started-image-guide')
    ).toBeInTheDocument();
  });

  it('shows the guide panel when forceVisible is true', () => {
    render(<GettingStartedImageGuide forceVisible />);
    expect(screen.getByTestId('image-guide-panel')).toBeInTheDocument();
    expect(screen.getByTestId('image-guide-title')).toHaveTextContent(
      'Getting started with image generation'
    );
  });

  it('shows the guide automatically for first-time users (no localStorage key)', () => {
    render(<GettingStartedImageGuide />);
    expect(screen.getByTestId('image-guide-panel')).toBeInTheDocument();
  });

  it('hides the guide when localStorage dismissed key is set', () => {
    localStorage.setItem('agentgram:image-guide-dismissed', '1');
    render(<GettingStartedImageGuide />);
    expect(screen.queryByTestId('image-guide-panel')).not.toBeInTheDocument();
    expect(screen.getByTestId('image-guide-toggle')).toBeInTheDocument();
  });

  it('renders all 4 beginner tips', () => {
    render(<GettingStartedImageGuide forceVisible />);
    const tips = screen.getByTestId('image-guide-tips');
    expect(tips.querySelectorAll('li')).toHaveLength(4);
  });

  it('renders the toggle button when guide is dismissed', () => {
    localStorage.setItem('agentgram:image-guide-dismissed', '1');
    render(<GettingStartedImageGuide />);
    expect(screen.getByTestId('image-guide-toggle')).toBeInTheDocument();
  });

  it('opens the guide when toggle button is clicked', () => {
    localStorage.setItem('agentgram:image-guide-dismissed', '1');
    render(<GettingStartedImageGuide />);
    fireEvent.click(screen.getByTestId('image-guide-toggle'));
    expect(screen.getByTestId('image-guide-panel')).toBeInTheDocument();
  });

  it('dismisses the guide and sets localStorage when X is clicked', () => {
    render(<GettingStartedImageGuide forceVisible />);
    fireEvent.click(screen.getByTestId('image-guide-dismiss'));
    expect(screen.queryByTestId('image-guide-panel')).not.toBeInTheDocument();
    expect(localStorage.getItem('agentgram:image-guide-dismissed')).toBe('1');
  });

  it('renders preset chips when onSelectPreset is provided', () => {
    render(<GettingStartedImageGuide forceVisible onSelectPreset={() => {}} />);
    expect(screen.getByTestId('image-guide-presets')).toBeInTheDocument();
    expect(ANCHOR_PRESETS.length).toBeGreaterThanOrEqual(4);
    for (const preset of ANCHOR_PRESETS) {
      expect(
        screen.getByTestId(`image-guide-preset-${preset.id}`)
      ).toBeInTheDocument();
    }
  });

  it('does not render presets section when onSelectPreset is not provided', () => {
    render(<GettingStartedImageGuide forceVisible />);
    expect(screen.queryByTestId('image-guide-presets')).not.toBeInTheDocument();
  });

  it('calls onSelectPreset with the preset prompt when a chip is clicked', () => {
    const handler = vi.fn();
    render(<GettingStartedImageGuide forceVisible onSelectPreset={handler} />);
    const firstPreset = ANCHOR_PRESETS[0];
    fireEvent.click(screen.getByTestId(`image-guide-preset-${firstPreset.id}`));
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(firstPreset.prompt);
  });

  it('renders preset chip labels correctly', () => {
    render(<GettingStartedImageGuide forceVisible onSelectPreset={() => {}} />);
    for (const preset of ANCHOR_PRESETS) {
      expect(
        screen.getByTestId(`image-guide-preset-${preset.id}`)
      ).toHaveTextContent(preset.label);
    }
  });
});
