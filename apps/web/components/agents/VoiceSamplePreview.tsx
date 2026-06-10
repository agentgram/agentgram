'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Mic, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

// Silent 0.1 s WAV placeholder — keeps the preview functional with no network call
// when no real ElevenLabs sample URL is wired up.
const PLACEHOLDER_SAMPLE_URL =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

export interface VoiceSamplePreviewProps {
  sampleUrl?: string;
  agentName?: string;
  className?: string;
  /** Injected for unit tests; defaults to the Web Audio constructor. */
  _audioFactory?: (src: string) => HTMLAudioElement;
}

function defaultAudioFactory(src: string): HTMLAudioElement {
  return new Audio(src);
}

export function VoiceSamplePreview({
  sampleUrl = PLACEHOLDER_SAMPLE_URL,
  agentName,
  className,
  _audioFactory = defaultAudioFactory,
}: VoiceSamplePreviewProps) {
  const [state, setState] = useState<PlaybackState>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const handleToggle = useCallback(() => {
    if (state === 'error') return;

    if (state === 'playing') {
      audioRef.current?.pause();
      setState('paused');
      return;
    }

    if (state === 'paused' && audioRef.current) {
      void audioRef.current.play().catch(() => setState('error'));
      setState('playing');
      return;
    }

    cleanup();
    const audio = _audioFactory(sampleUrl);
    audioRef.current = audio;
    setState('loading');

    audio.addEventListener('canplay', () => {
      void audio.play().catch(() => setState('error'));
      setState('playing');
    });

    audio.addEventListener('ended', () => {
      setState('idle');
      audioRef.current = null;
    });

    audio.addEventListener('error', () => {
      setState('error');
      audioRef.current = null;
    });
  }, [state, sampleUrl, cleanup, _audioFactory]);

  const buttonLabel =
    state === 'loading'
      ? 'Loading…'
      : state === 'playing'
        ? 'Pause sample'
        : state === 'error'
          ? 'Sample unavailable'
          : state === 'paused'
            ? 'Resume sample'
            : 'Hear voice sample';

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      data-testid="voice-sample-preview"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        disabled={state === 'loading' || state === 'error'}
        aria-label={agentName ? `${buttonLabel} for ${agentName}` : buttonLabel}
        className={cn(
          'gap-2 rounded-full text-xs font-medium',
          state === 'playing' && 'border-primary/40 bg-primary/10 text-primary',
          state === 'error' && 'opacity-60'
        )}
        data-testid="voice-sample-button"
      >
        {state === 'loading' ? (
          <Loader2
            className="h-3 w-3 animate-spin"
            data-testid="voice-sample-icon-loading"
          />
        ) : state === 'playing' ? (
          <Pause className="h-3 w-3" data-testid="voice-sample-icon-pause" />
        ) : state === 'error' ? (
          <Volume2
            className="h-3 w-3 text-muted-foreground"
            data-testid="voice-sample-icon-error"
          />
        ) : (
          <Mic className="h-3 w-3" data-testid="voice-sample-icon-mic" />
        )}
        {buttonLabel}
      </Button>
      {state === 'playing' && (
        <div
          className="flex items-end gap-[2px]"
          aria-hidden="true"
          data-testid="voice-sample-waveform"
        >
          {[3, 5, 4, 6, 3].map((h, i) => (
            <span
              key={i}
              className="w-0.5 animate-pulse rounded-full bg-primary"
              style={{ height: `${h * 2}px`, animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
