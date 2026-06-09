/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CapabilitySampleTray } from '../../components/agent/CapabilitySampleTray';
import type { CapabilitySample } from '../../lib/capability-sample';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

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

function makeAudioFactory(mockAudio: MockAudio) {
  return vi.fn(() => mockAudio as unknown as HTMLAudioElement);
}

describe('CapabilitySampleTray', () => {
  it('renders nothing when capabilities array is empty', () => {
    const { container } = render(<CapabilitySampleTray capabilities={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a chip for each capability', () => {
    const caps: CapabilitySample[] = [
      { type: 'voice', label: 'Voice' },
      { type: 'image', label: 'Image' },
      { type: 'selfie', label: 'Selfie' },
    ];
    render(<CapabilitySampleTray capabilities={caps} />);
    expect(screen.getByTestId('capability-chip-voice')).toBeInTheDocument();
    expect(screen.getByTestId('capability-chip-image')).toBeInTheDocument();
    expect(screen.getByTestId('capability-chip-selfie')).toBeInTheDocument();
  });

  it('shows 샘플 없음 placeholder for voice chip with no sampleUrl', () => {
    const caps: CapabilitySample[] = [{ type: 'voice', label: 'Voice' }];
    render(<CapabilitySampleTray capabilities={caps} />);
    expect(screen.getByTestId('capability-chip-voice-no-sample')).toHaveTextContent(
      '샘플 없음'
    );
  });

  it('shows 샘플 없음 placeholder for image chip with no sampleUrl', () => {
    const caps: CapabilitySample[] = [{ type: 'image', label: 'Image' }];
    render(<CapabilitySampleTray capabilities={caps} />);
    expect(screen.getByTestId('capability-chip-image-no-sample')).toHaveTextContent(
      '샘플 없음'
    );
  });

  it('shows 샘플 없음 placeholder for selfie chip with no sampleUrl', () => {
    const caps: CapabilitySample[] = [{ type: 'selfie', label: 'Selfie' }];
    render(<CapabilitySampleTray capabilities={caps} />);
    expect(screen.getByTestId('capability-chip-selfie-no-sample')).toHaveTextContent(
      '샘플 없음'
    );
  });

  it('renders a clickable button (not a muted span) for chips with sampleUrl', () => {
    const caps: CapabilitySample[] = [
      { type: 'image', label: 'Image', sampleUrl: 'https://example.com/img.jpg' },
    ];
    render(<CapabilitySampleTray capabilities={caps} />);
    const chip = screen.getByTestId('capability-chip-image');
    expect(chip.tagName).toBe('BUTTON');
  });

  it('toggles image preview on chip click', () => {
    const caps: CapabilitySample[] = [
      { type: 'image', label: 'Image', sampleUrl: 'https://example.com/img.jpg' },
    ];
    render(<CapabilitySampleTray capabilities={caps} />);
    const chip = screen.getByTestId('capability-chip-image');

    expect(screen.queryByTestId('capability-sample-preview-image')).not.toBeInTheDocument();

    fireEvent.click(chip);
    expect(screen.getByTestId('capability-sample-preview-image')).toBeInTheDocument();
    expect(screen.getByTestId('image-sample-preview')).toBeInTheDocument();

    fireEvent.click(chip);
    expect(screen.queryByTestId('capability-sample-preview-image')).not.toBeInTheDocument();
  });

  it('shows image thumbnail with correct src for image capability', () => {
    const sampleUrl = 'https://example.com/img.jpg';
    const caps: CapabilitySample[] = [
      { type: 'image', label: 'Image', sampleUrl },
    ];
    render(<CapabilitySampleTray capabilities={caps} />);
    fireEvent.click(screen.getByTestId('capability-chip-image'));
    const img = screen.getByRole('img', { name: /image sample/i });
    expect(img).toHaveAttribute('src', sampleUrl);
  });

  it('renders voice player inside preview when voice chip with sampleUrl is clicked', async () => {
    const mockAudio = makeMockAudio();
    const audioFactory = makeAudioFactory(mockAudio);
    const caps: CapabilitySample[] = [
      { type: 'voice', label: 'Voice', sampleUrl: 'https://example.com/voice.mp3' },
    ];
    render(<CapabilitySampleTray capabilities={caps} _audioFactory={audioFactory} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('capability-chip-voice'));
    });

    expect(screen.getByTestId('capability-sample-preview-voice')).toBeInTheDocument();
    expect(screen.getByTestId('voice-sample-preview')).toBeInTheDocument();
  });

  it('shows sampleDuration in the chip when provided', () => {
    const caps: CapabilitySample[] = [
      { type: 'voice', label: 'Voice', sampleUrl: 'https://example.com/v.mp3', sampleDuration: 5 },
    ];
    render(<CapabilitySampleTray capabilities={caps} />);
    expect(screen.getByTestId('capability-chip-voice')).toHaveTextContent('5s');
  });

  it('renders the tray wrapper with data-testid capability-sample-tray', () => {
    const caps: CapabilitySample[] = [{ type: 'selfie', label: 'Selfie' }];
    render(<CapabilitySampleTray capabilities={caps} />);
    expect(screen.getByTestId('capability-sample-tray')).toBeInTheDocument();
  });

  it('renders a selfie chip with image preview (not voice player) on click', () => {
    const caps: CapabilitySample[] = [
      { type: 'selfie', label: 'Selfie', sampleUrl: 'https://example.com/selfie.jpg' },
    ];
    render(<CapabilitySampleTray capabilities={caps} />);
    fireEvent.click(screen.getByTestId('capability-chip-selfie'));
    expect(screen.getByTestId('image-sample-preview')).toBeInTheDocument();
    expect(screen.queryByTestId('voice-sample-preview')).not.toBeInTheDocument();
  });

  it('matches snapshot with multiple capability types and mixed sampleUrl presence', () => {
    const caps: CapabilitySample[] = [
      { type: 'voice', label: 'Voice', sampleUrl: 'https://example.com/v.mp3', sampleDuration: 5 },
      { type: 'image', label: 'Image' },
      { type: 'selfie', label: 'Selfie', sampleUrl: 'https://example.com/s.jpg' },
    ];
    const { container } = render(<CapabilitySampleTray capabilities={caps} />);
    expect(container).toMatchSnapshot();
  });
});
