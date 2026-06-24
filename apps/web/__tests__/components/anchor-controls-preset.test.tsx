import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnchorControlsPreset } from '@/components/image-gen/AnchorControlsPreset';
import {
  buildAnchorHints,
  DEFAULT_ANCHOR_CONTROLS,
  loadAnchorControlsDefault,
  saveAnchorControlsDefault,
} from '@/lib/image-gen/anchor-controls';

describe('AnchorControlsPreset', () => {
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

  it('renders all four fidelity options', () => {
    render(<AnchorControlsPreset />);
    expect(screen.getByTestId('anchor-controls-fidelity-low')).toBeInTheDocument();
    expect(screen.getByTestId('anchor-controls-fidelity-medium')).toBeInTheDocument();
    expect(screen.getByTestId('anchor-controls-fidelity-high')).toBeInTheDocument();
    expect(screen.getByTestId('anchor-controls-fidelity-exact')).toBeInTheDocument();
  });

  it('renders all four trait checkboxes', () => {
    render(<AnchorControlsPreset />);
    expect(screen.getByTestId('anchor-controls-trait-hairColor')).toBeInTheDocument();
    expect(screen.getByTestId('anchor-controls-trait-eyeColor')).toBeInTheDocument();
    expect(screen.getByTestId('anchor-controls-trait-style')).toBeInTheDocument();
    expect(screen.getByTestId('anchor-controls-trait-expression')).toBeInTheDocument();
  });

  it('defaults to medium fidelity', () => {
    render(<AnchorControlsPreset />);
    expect(screen.getByTestId('anchor-controls-fidelity-medium')).toBeChecked();
    expect(screen.getByTestId('anchor-controls-fidelity-low')).not.toBeChecked();
    expect(screen.getByTestId('anchor-controls-fidelity-high')).not.toBeChecked();
    expect(screen.getByTestId('anchor-controls-fidelity-exact')).not.toBeChecked();
  });

  it('selecting a fidelity radio calls onChange with new fidelity', () => {
    const onChange = vi.fn();
    render(<AnchorControlsPreset onChange={onChange} />);
    fireEvent.click(screen.getByTestId('anchor-controls-fidelity-high'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ fidelity: 'high' })
    );
  });

  it('toggling a trait checkbox calls onChange with updated traits', () => {
    const onChange = vi.fn();
    render(<AnchorControlsPreset onChange={onChange} />);
    fireEvent.click(screen.getByTestId('anchor-controls-trait-style'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        traits: expect.objectContaining({ style: true }),
      })
    );
  });

  it('save-as-default button saves to localStorage and shows "Saved!" label', () => {
    render(<AnchorControlsPreset />);
    const saveBtn = screen.getByTestId('anchor-controls-save-default');
    expect(saveBtn).toHaveTextContent('Save as default');
    fireEvent.click(saveBtn);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'agentgram:anchor-controls-default',
      expect.any(String)
    );
    expect(saveBtn).toHaveTextContent('Saved!');
  });

  it('accepts initialValue prop and reflects it in UI', () => {
    render(
      <AnchorControlsPreset
        initialValue={{ fidelity: 'exact', traits: { ...DEFAULT_ANCHOR_CONTROLS.traits, style: true } }}
      />
    );
    expect(screen.getByTestId('anchor-controls-fidelity-exact')).toBeChecked();
    expect(screen.getByTestId('anchor-controls-trait-style')).toBeChecked();
  });

  it('shows the component title', () => {
    render(<AnchorControlsPreset />);
    expect(screen.getByTestId('anchor-controls-title')).toHaveTextContent('Anchor Controls');
  });
});

describe('anchor-controls lib', () => {
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

  it('loadAnchorControlsDefault returns DEFAULT_ANCHOR_CONTROLS when nothing stored', () => {
    const result = loadAnchorControlsDefault();
    expect(result.fidelity).toBe('medium');
    expect(result.traits.hairColor).toBe(true);
    expect(result.traits.eyeColor).toBe(true);
    expect(result.traits.style).toBe(false);
  });

  it('saveAnchorControlsDefault writes to localStorage', () => {
    saveAnchorControlsDefault({ fidelity: 'high', traits: { ...DEFAULT_ANCHOR_CONTROLS.traits } });
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'agentgram:anchor-controls-default',
      expect.stringContaining('"fidelity":"high"')
    );
  });

  it('loadAnchorControlsDefault returns saved value after saveAnchorControlsDefault', () => {
    const saved = { fidelity: 'exact' as const, traits: { hairColor: false, eyeColor: true, style: true, expression: true } };
    saveAnchorControlsDefault(saved);
    store['agentgram:anchor-controls-default'] = JSON.stringify(saved);
    const result = loadAnchorControlsDefault();
    expect(result.fidelity).toBe('exact');
    expect(result.traits.style).toBe(true);
  });

  it('buildAnchorHints includes fidelity label', () => {
    const hint = buildAnchorHints({ fidelity: 'high', traits: DEFAULT_ANCHOR_CONTROLS.traits });
    expect(hint).toContain('strict appearance match');
  });

  it('buildAnchorHints lists active traits', () => {
    const hint = buildAnchorHints({
      fidelity: 'medium',
      traits: { hairColor: true, eyeColor: false, style: true, expression: false },
    });
    expect(hint).toContain('hair color');
    expect(hint).toContain('style');
    expect(hint).not.toContain('eye color');
  });
});
