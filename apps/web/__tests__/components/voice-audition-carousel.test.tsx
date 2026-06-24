import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  VoiceAuditionCarousel,
  NOMI_V3_VOICES,
} from '../../components/agent/VoiceAuditionCarousel';

describe('VoiceAuditionCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders all 5 default voice options', () => {
    render(<VoiceAuditionCarousel />);

    expect(screen.getByTestId('voice-audition-carousel')).toBeInTheDocument();

    for (const voice of NOMI_V3_VOICES) {
      expect(
        screen.getByTestId(`voice-card-${voice.id}`)
      ).toBeInTheDocument();
      expect(screen.getByText(voice.name)).toBeInTheDocument();
    }
  });

  it('shows Playing... state for 2 seconds after play button click then resets', () => {
    render(<VoiceAuditionCarousel />);

    const firstVoice = NOMI_V3_VOICES[0];
    const playButton = screen.getByTestId(
      `voice-card-${firstVoice.id}-play-button`
    );

    expect(playButton).toHaveTextContent('Preview');

    fireEvent.click(playButton);

    expect(playButton).toHaveTextContent('Playing...');
    expect(playButton).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(playButton).toHaveTextContent('Preview');
    expect(playButton).not.toBeDisabled();
  });

  it('calls onChange with voice id when a voice card is selected', () => {
    const onChange = vi.fn();
    render(<VoiceAuditionCarousel onChange={onChange} />);

    const secondVoice = NOMI_V3_VOICES[1];
    const selectButton = screen.getByTestId(
      `voice-card-${secondVoice.id}-select-button`
    );

    fireEvent.click(selectButton);

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(secondVoice.id);
  });

  it('shows checkmark on selected voice and marks aria-selected', () => {
    const selectedId = NOMI_V3_VOICES[2].id;
    render(<VoiceAuditionCarousel selectedVoiceId={selectedId} />);

    const selectedCard = screen.getByTestId(`voice-card-${selectedId}`);
    expect(selectedCard).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByTestId(`voice-card-${selectedId}-checkmark`)
    ).toBeInTheDocument();

    // Non-selected card should not have checkmark
    const otherId = NOMI_V3_VOICES[0].id;
    expect(
      screen.queryByTestId(`voice-card-${otherId}-checkmark`)
    ).not.toBeInTheDocument();
  });

  it('play buttons are keyboard accessible with correct aria-labels', () => {
    render(<VoiceAuditionCarousel />);

    for (const voice of NOMI_V3_VOICES) {
      const playButton = screen.getByTestId(
        `voice-card-${voice.id}-play-button`
      );
      expect(playButton).toHaveAttribute(
        'aria-label',
        `Preview ${voice.name} voice`
      );

      const selectButton = screen.getByTestId(
        `voice-card-${voice.id}-select-button`
      );
      expect(selectButton).toHaveAttribute(
        'aria-label',
        `Select ${voice.name} voice`
      );
    }

    // The listbox container has proper role and label
    const listbox = screen.getByRole('listbox', { name: 'Voice options' });
    expect(listbox).toBeInTheDocument();
  });

  it('returns selected voice id via onChange for all 5 voice options', () => {
    const onChange = vi.fn();
    render(<VoiceAuditionCarousel onChange={onChange} />);

    for (const voice of NOMI_V3_VOICES) {
      const selectButton = screen.getByTestId(
        `voice-card-${voice.id}-select-button`
      );
      fireEvent.click(selectButton);
    }

    expect(onChange).toHaveBeenCalledTimes(NOMI_V3_VOICES.length);
    NOMI_V3_VOICES.forEach((voice, index) => {
      expect(onChange).toHaveBeenNthCalledWith(index + 1, voice.id);
    });
  });
});
