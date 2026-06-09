import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CreatorVoiceCallPreview } from '../../components/agents/CreatorVoiceCallPreview';

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

describe('CreatorVoiceCallPreview', () => {
  let mockAudio: MockAudio;
  let audioFactory: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockAudio = makeMockAudio();
    audioFactory = vi.fn(() => mockAudio as unknown as HTMLAudioElement);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the chat-available badge when text=true', () => {
    render(
      <CreatorVoiceCallPreview availability={{ text: true, voice: false }} />
    );
    expect(screen.getByTestId('availability-badge-text')).toHaveTextContent(
      '채팅 가능'
    );
  });

  it('renders the voice-available badge when voice=true', () => {
    render(
      <CreatorVoiceCallPreview availability={{ text: false, voice: true }} />
    );
    expect(screen.getByTestId('availability-badge-voice')).toHaveTextContent(
      '통화 가능'
    );
  });

  it('renders both badges when text=true and voice=true', () => {
    render(
      <CreatorVoiceCallPreview availability={{ text: true, voice: true }} />
    );
    expect(screen.getByTestId('availability-badge-text')).toBeInTheDocument();
    expect(screen.getByTestId('availability-badge-voice')).toBeInTheDocument();
  });

  it('does not render the chat badge when text=false', () => {
    render(
      <CreatorVoiceCallPreview availability={{ text: false, voice: true }} />
    );
    expect(
      screen.queryByTestId('availability-badge-text')
    ).not.toBeInTheDocument();
  });

  it('does not render the voice badge when voice=false', () => {
    render(
      <CreatorVoiceCallPreview availability={{ text: true, voice: false }} />
    );
    expect(
      screen.queryByTestId('availability-badge-voice')
    ).not.toBeInTheDocument();
  });

  it('renders nothing when both availability flags are false and no sample URL', () => {
    const { container } = render(
      <CreatorVoiceCallPreview availability={{ text: false, voice: false }} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows the voice sample player when voiceSampleUrl is provided', () => {
    render(
      <CreatorVoiceCallPreview
        availability={{ text: true, voice: false }}
        voiceSampleUrl="https://example.com/sample.mp3"
        _audioFactory={audioFactory}
      />
    );
    expect(screen.getByTestId('voice-sample-preview')).toBeInTheDocument();
  });

  it('does not show the voice sample player when voiceSampleUrl is omitted', () => {
    render(
      <CreatorVoiceCallPreview availability={{ text: true, voice: false }} />
    );
    expect(
      screen.queryByTestId('voice-sample-preview')
    ).not.toBeInTheDocument();
  });

  it('renders the voice sample player in idle state initially', () => {
    render(
      <CreatorVoiceCallPreview
        availability={{ text: true, voice: true }}
        voiceSampleUrl="https://example.com/sample.mp3"
        _audioFactory={audioFactory}
      />
    );
    expect(screen.getByText('Hear voice sample')).toBeInTheDocument();
    expect(screen.getByTestId('voice-sample-icon-mic')).toBeInTheDocument();
  });

  it('transitions to playing state when play button is clicked and canplay fires', async () => {
    render(
      <CreatorVoiceCallPreview
        availability={{ text: true, voice: true }}
        voiceSampleUrl="https://example.com/sample.mp3"
        _audioFactory={audioFactory}
      />
    );

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
    render(
      <CreatorVoiceCallPreview
        availability={{ text: true, voice: true }}
        voiceSampleUrl="https://example.com/sample.mp3"
        _audioFactory={audioFactory}
      />
    );

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

  it('resets to idle state when the audio clip ends', async () => {
    render(
      <CreatorVoiceCallPreview
        availability={{ text: true, voice: true }}
        voiceSampleUrl="https://example.com/sample.mp3"
        _audioFactory={audioFactory}
      />
    );

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
    expect(
      screen.queryByTestId('voice-sample-waveform')
    ).not.toBeInTheDocument();
  });

  it('renders the container when only a voiceSampleUrl is provided with both flags false', () => {
    render(
      <CreatorVoiceCallPreview
        availability={{ text: false, voice: false }}
        voiceSampleUrl="https://example.com/sample.mp3"
        _audioFactory={audioFactory}
      />
    );
    expect(
      screen.getByTestId('creator-voice-call-preview')
    ).toBeInTheDocument();
    expect(screen.getByTestId('voice-sample-preview')).toBeInTheDocument();
  });
});
