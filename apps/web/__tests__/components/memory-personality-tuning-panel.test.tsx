import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MemoryPersonalityTuningPanel,
  type MemoryPersonalityTuningPanelSettings,
} from '@/components/dashboard/MemoryPersonalityTuningPanel';
import type { AgentPersonalitySettings } from '@/lib/personality-traits';

function buildPersonality(
  overrides: Partial<AgentPersonalitySettings> = {}
): AgentPersonalitySettings {
  return {
    traits: {
      warmth: 50,
      humor: 30,
      formality: 50,
      creativity: 50,
    },
    voiceStyle: 'natural',
    ...overrides,
  };
}

function buildSettings(
  overrides: Partial<MemoryPersonalityTuningPanelSettings> = {}
): MemoryPersonalityTuningPanelSettings {
  return {
    agentId: 'agent-42',
    agentLabel: 'Nova',
    currentAvatarUrl: null,
    pinnedFactsSettings: {
      agentId: 'agent-42',
      agentLabel: 'Nova',
      facts: [],
      ledger: {
        capacity: 12,
        savedCount: 0,
        remainingCount: 12,
        categoryCounts: { profileFact: 0, relationshipContext: 0 },
      },
    },
    personalitySettings: buildPersonality(),
    ...overrides,
  };
}

describe('MemoryPersonalityTuningPanel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all three tab triggers', () => {
    render(<MemoryPersonalityTuningPanel settings={buildSettings()} />);

    expect(screen.getByTestId('tab-trigger-memory')).toBeInTheDocument();
    expect(screen.getByTestId('tab-trigger-personality')).toBeInTheDocument();
    expect(screen.getByTestId('tab-trigger-avatar')).toBeInTheDocument();
  });

  it('defaults to memory tab and shows pinned facts card', () => {
    render(<MemoryPersonalityTuningPanel settings={buildSettings()} />);

    expect(screen.getByText(/Pinned facts for Nova/)).toBeInTheDocument();
  });

  it('switches to personality tab when clicked', () => {
    render(<MemoryPersonalityTuningPanel settings={buildSettings()} />);

    fireEvent.click(screen.getByTestId('tab-trigger-personality'));

    expect(screen.getByTestId('personality-traits-form')).toBeInTheDocument();
    expect(screen.getByTestId('voice-style-selector')).toBeInTheDocument();
  });

  it('renders all four trait sliders with correct default values', () => {
    render(<MemoryPersonalityTuningPanel settings={buildSettings()} />);
    fireEvent.click(screen.getByTestId('tab-trigger-personality'));

    const warmthSlider = screen
      .getByTestId('trait-slider-warmth')
      .querySelector('input[type="range"]') as HTMLInputElement;
    const humorSlider = screen
      .getByTestId('trait-slider-humor')
      .querySelector('input[type="range"]') as HTMLInputElement;
    const formalitySlider = screen
      .getByTestId('trait-slider-formality')
      .querySelector('input[type="range"]') as HTMLInputElement;
    const creativitySlider = screen
      .getByTestId('trait-slider-creativity')
      .querySelector('input[type="range"]') as HTMLInputElement;

    expect(warmthSlider.value).toBe('50');
    expect(humorSlider.value).toBe('30');
    expect(formalitySlider.value).toBe('50');
    expect(creativitySlider.value).toBe('50');
  });

  it('updates a trait slider value locally', () => {
    render(<MemoryPersonalityTuningPanel settings={buildSettings()} />);
    fireEvent.click(screen.getByTestId('tab-trigger-personality'));

    const humorSlider = screen
      .getByTestId('trait-slider-humor')
      .querySelector('input[type="range"]') as HTMLInputElement;

    fireEvent.change(humorSlider, { target: { value: '70' } });

    expect(humorSlider.value).toBe('70');
  });

  it('renders four voice style options with natural selected by default', () => {
    render(<MemoryPersonalityTuningPanel settings={buildSettings()} />);
    fireEvent.click(screen.getByTestId('tab-trigger-personality'));

    const naturalBtn = screen.getByTestId('voice-style-option-natural');
    const expressiveBtn = screen.getByTestId('voice-style-option-expressive');
    const calmBtn = screen.getByTestId('voice-style-option-calm');
    const playfulBtn = screen.getByTestId('voice-style-option-playful');

    expect(naturalBtn).toBeInTheDocument();
    expect(expressiveBtn).toBeInTheDocument();
    expect(calmBtn).toBeInTheDocument();
    expect(playfulBtn).toBeInTheDocument();

    expect(naturalBtn.className).toContain('bg-primary/10');
    expect(expressiveBtn.className).not.toContain('bg-primary/10');
  });

  it('selects a new voice style when clicked', () => {
    render(<MemoryPersonalityTuningPanel settings={buildSettings()} />);
    fireEvent.click(screen.getByTestId('tab-trigger-personality'));

    const playfulBtn = screen.getByTestId('voice-style-option-playful');
    fireEvent.click(playfulBtn);

    expect(playfulBtn.className).toContain('bg-primary/10');
    expect(screen.getByTestId('voice-style-option-natural').className).not.toContain(
      'bg-primary/10'
    );
  });

  it('calls PUT /api/v1/developers/me/agent-personality on save and shows success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: buildPersonality(),
      }),
    } as unknown as Response);
    vi.stubGlobal('fetch', fetchMock);

    render(<MemoryPersonalityTuningPanel settings={buildSettings()} />);
    fireEvent.click(screen.getByTestId('tab-trigger-personality'));
    fireEvent.click(screen.getByTestId('personality-save-button'));

    await waitFor(() => {
      expect(screen.getByTestId('personality-save-status')).toHaveTextContent(
        'Personality settings saved.'
      );
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/developers/me/agent-personality',
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('shows error message when save fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ success: false, error: { message: 'Network error' } }),
    } as unknown as Response));

    render(<MemoryPersonalityTuningPanel settings={buildSettings()} />);
    fireEvent.click(screen.getByTestId('tab-trigger-personality'));
    fireEvent.click(screen.getByTestId('personality-save-button'));

    await waitFor(() => {
      expect(screen.getByTestId('personality-save-status')).toHaveTextContent(
        'Network error'
      );
    });
  });

  it('switches to avatar tab and shows upload CTA', () => {
    render(<MemoryPersonalityTuningPanel settings={buildSettings()} />);
    fireEvent.click(screen.getByTestId('tab-trigger-avatar'));

    expect(screen.getByTestId('avatar-section')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-upload-cta')).toHaveTextContent('Upload new image');
    expect(screen.getByTestId('avatar-coming-soon')).toBeInTheDocument();
  });

  it('shows agent label in panel heading', () => {
    render(<MemoryPersonalityTuningPanel settings={buildSettings()} />);
    expect(screen.getByTestId('tuning-panel')).toHaveTextContent('Tune Nova');
  });

  it('opens personality tab when defaultTab is personality', () => {
    render(
      <MemoryPersonalityTuningPanel
        defaultTab="personality"
        settings={buildSettings()}
      />
    );
    expect(screen.getByTestId('personality-traits-form')).toBeInTheDocument();
  });
});
