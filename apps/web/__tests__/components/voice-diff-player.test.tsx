import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { VoiceDiffPlayer } from '../../components/voice/VoiceDiffPlayer';

function makeMockAudio() {
  const listeners: Record<string, (() => void)[]> = {};
  return {
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    set src(_: string) {},
    addEventListener(event: string, cb: () => void) {
      listeners[event] = listeners[event] ?? [];
      listeners[event].push(cb);
    },
    emit(event: string) {
      listeners[event]?.forEach((cb) => cb());
    },
  };
}

describe('VoiceDiffPlayer', () => {
  it('renders the player container with correct test id', () => {
    render(<VoiceDiffPlayer />);
    expect(screen.getByTestId('voice-diff-player')).toBeInTheDocument();
  });

  it('renders V2 and V3 cards with correct labels', () => {
    render(<VoiceDiffPlayer />);
    expect(screen.getByTestId('voice-diff-label-v2')).toHaveTextContent('V2 Legacy');
    expect(screen.getByTestId('voice-diff-label-v3')).toHaveTextContent('V3 Enhanced');
  });

  it('renders Legacy and New badges on respective cards', () => {
    render(<VoiceDiffPlayer />);
    expect(screen.getByTestId('voice-diff-badge-v2')).toHaveTextContent('Legacy');
    expect(screen.getByTestId('voice-diff-badge-v3')).toHaveTextContent('New');
  });

  it('calls onSelect with "v2" when V2 select button is clicked', () => {
    const onSelect = vi.fn();
    render(<VoiceDiffPlayer onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId('voice-diff-select-btn-v2'));
    expect(onSelect).toHaveBeenCalledWith('v2');
  });

  it('calls onSelect with "v3" when V3 select button is clicked', () => {
    const onSelect = vi.fn();
    render(<VoiceDiffPlayer onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId('voice-diff-select-btn-v3'));
    expect(onSelect).toHaveBeenCalledWith('v3');
  });

  it('marks the selected version card as selected via aria-pressed', () => {
    render(<VoiceDiffPlayer selectedVersion="v3" />);
    const v3SelectBtn = screen.getByTestId('voice-diff-select-btn-v3');
    const v2SelectBtn = screen.getByTestId('voice-diff-select-btn-v2');
    expect(v3SelectBtn).toHaveAttribute('aria-pressed', 'true');
    expect(v2SelectBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows "Selected" label on the active version button', () => {
    render(<VoiceDiffPlayer selectedVersion="v2" />);
    expect(screen.getByTestId('voice-diff-select-btn-v2')).toHaveTextContent('Selected');
    expect(screen.getByTestId('voice-diff-select-btn-v3')).toHaveTextContent('Use V3 Enhanced');
  });

  it('changes play button label to Pause when audio starts playing', async () => {
    let capturedAudio: ReturnType<typeof makeMockAudio> | null = null;
    const audioFactory = () => {
      capturedAudio = makeMockAudio();
      return capturedAudio as unknown as HTMLAudioElement;
    };

    render(<VoiceDiffPlayer _audioFactory={audioFactory} />);
    const playBtn = screen.getByTestId('voice-diff-play-btn-v2');
    expect(playBtn).toHaveTextContent('Play sample');

    fireEvent.click(playBtn);
    await act(async () => {
      capturedAudio!.emit('canplay');
    });

    expect(screen.getByTestId('voice-diff-play-btn-v2')).toHaveTextContent('Pause');
  });
});
