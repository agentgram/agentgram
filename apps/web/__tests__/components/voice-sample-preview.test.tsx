import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VoiceSamplePreview } from '../../components/agents/VoiceSamplePreview';

type EventMap = Record<string, () => void>;

function makeMockAudio() {
  const handlers: EventMap = {};
  const instance = {
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    src: '',
    addEventListener: vi.fn((event: string, handler: () => void) => {
      handlers[event] = handler;
    }),
    _trigger: (event: string) => handlers[event]?.(),
  };
  return instance;
}

type MockAudio = ReturnType<typeof makeMockAudio>;

describe('VoiceSamplePreview', () => {
  let mockAudio: MockAudio;
  let audioFactory: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockAudio = makeMockAudio();
    audioFactory = vi.fn(() => mockAudio as unknown as HTMLAudioElement);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function renderComponent(props: Partial<React.ComponentProps<typeof VoiceSamplePreview>> = {}) {
    return render(
      <VoiceSamplePreview
        sampleUrl="https://example.com/sample.mp3"
        _audioFactory={audioFactory}
        {...props}
      />
    );
  }

  it('renders in idle state with the hear-voice-sample label', () => {
    renderComponent();
    expect(screen.getByTestId('voice-sample-preview')).toBeInTheDocument();
    expect(screen.getByText('Hear voice sample')).toBeInTheDocument();
  });

  it('shows the mic icon in idle state', () => {
    renderComponent();
    expect(screen.getByTestId('voice-sample-icon-mic')).toBeInTheDocument();
  });

  it('does not show the waveform in idle state', () => {
    renderComponent();
    expect(screen.queryByTestId('voice-sample-waveform')).not.toBeInTheDocument();
  });

  it('transitions to loading state and calls the audio factory on first click', async () => {
    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByTestId('voice-sample-button'));
    });
    expect(audioFactory).toHaveBeenCalledWith('https://example.com/sample.mp3');
    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(screen.getByTestId('voice-sample-icon-loading')).toBeInTheDocument();
  });

  it('transitions to playing state when canplay fires', async () => {
    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByTestId('voice-sample-button'));
    });
    await act(async () => {
      mockAudio._trigger('canplay');
    });
    await waitFor(() =>
      expect(screen.getByTestId('voice-sample-icon-pause')).toBeInTheDocument()
    );
    expect(screen.getByText('Pause sample')).toBeInTheDocument();
    expect(screen.getByTestId('voice-sample-waveform')).toBeInTheDocument();
  });

  it('pauses playback when the button is clicked while playing', async () => {
    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByTestId('voice-sample-button'));
    });
    await act(async () => {
      mockAudio._trigger('canplay');
    });
    await waitFor(() => screen.getByTestId('voice-sample-icon-pause'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('voice-sample-button'));
    });
    expect(mockAudio.pause).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Resume sample')).toBeInTheDocument();
  });

  it('transitions to error state when audio fails', async () => {
    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByTestId('voice-sample-button'));
    });
    await act(async () => {
      mockAudio._trigger('error');
    });
    await waitFor(() =>
      expect(screen.getByTestId('voice-sample-icon-error')).toBeInTheDocument()
    );
    expect(screen.getByText('Sample unavailable')).toBeInTheDocument();
  });

  it('disables the button in error state', async () => {
    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByTestId('voice-sample-button'));
    });
    await act(async () => {
      mockAudio._trigger('error');
    });
    await waitFor(() => screen.getByTestId('voice-sample-icon-error'));
    expect(screen.getByTestId('voice-sample-button')).toBeDisabled();
  });

  it('resets to idle state when the audio clip ends', async () => {
    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByTestId('voice-sample-button'));
    });
    await act(async () => {
      mockAudio._trigger('canplay');
    });
    await waitFor(() => screen.getByTestId('voice-sample-icon-pause'));

    await act(async () => {
      mockAudio._trigger('ended');
    });
    await waitFor(() =>
      expect(screen.getByText('Hear voice sample')).toBeInTheDocument()
    );
    expect(screen.queryByTestId('voice-sample-waveform')).not.toBeInTheDocument();
  });

  it('includes the agent name in the button aria-label when provided', () => {
    renderComponent({ agentName: 'Luna' });
    expect(
      screen.getByRole('button', { name: /hear voice sample for Luna/i })
    ).toBeInTheDocument();
  });
});
