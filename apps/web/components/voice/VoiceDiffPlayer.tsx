'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PlaybackState = 'idle' | 'playing' | 'paused' | 'error';

export type VoiceVersion = 'v2' | 'v3';

export interface VoiceDiffPlayerProps {
  v2SampleUrl?: string;
  v3SampleUrl?: string;
  selectedVersion?: VoiceVersion;
  onSelect?: (version: VoiceVersion) => void;
  className?: string;
  /** Injected for unit tests to avoid real Audio instantiation. */
  _audioFactory?: (src: string) => HTMLAudioElement;
}

const DEFAULT_V2_URL = '/api/voice/sample/v2';
const DEFAULT_V3_URL = '/api/voice/sample/v3';

interface TrackState {
  playback: PlaybackState;
}

function useAudioTrack(
  src: string,
  audioFactory: (src: string) => HTMLAudioElement
) {
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

  const toggle = useCallback(() => {
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
    const audio = audioFactory(src);
    audioRef.current = audio;

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
  }, [state, src, cleanup, audioFactory]);

  const stop = useCallback(() => {
    cleanup();
    setState('idle');
  }, [cleanup]);

  return { state, toggle, stop };
}

function defaultAudioFactory(src: string): HTMLAudioElement {
  return new Audio(src);
}

interface TrackCardProps {
  version: VoiceVersion;
  label: string;
  badge: string;
  description: string;
  playback: PlaybackState;
  isSelected: boolean;
  onToggle: () => void;
  onSelect: () => void;
}

function TrackCard({
  version,
  label,
  badge,
  description,
  playback,
  isSelected,
  onToggle,
  onSelect,
}: TrackCardProps) {
  const isPlaying = playback === 'playing';

  return (
    <div
      className={cn(
        'flex flex-1 flex-col gap-3 rounded-xl border p-4 transition-colors',
        isSelected
          ? 'border-primary/60 bg-primary/5'
          : 'border-border bg-card hover:border-primary/30'
      )}
      data-testid={`voice-diff-card-${version}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p
            className="text-sm font-semibold"
            data-testid={`voice-diff-label-${version}`}
          >
            {label}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {description}
          </p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            version === 'v3'
              ? 'bg-primary/15 text-primary'
              : 'bg-muted text-muted-foreground'
          )}
          data-testid={`voice-diff-badge-${version}`}
        >
          {badge}
        </span>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        disabled={playback === 'error'}
        aria-label={isPlaying ? `Pause ${label}` : `Play ${label}`}
        className={cn(
          'w-full gap-2 rounded-lg text-xs font-medium',
          isPlaying && 'border-primary/40 bg-primary/10 text-primary'
        )}
        data-testid={`voice-diff-play-btn-${version}`}
      >
        {isPlaying ? (
          <Pause className="h-3 w-3" />
        ) : (
          <Play className="h-3 w-3" />
        )}
        {isPlaying ? 'Pause' : 'Play sample'}
      </Button>

      <Button
        variant={isSelected ? 'default' : 'ghost'}
        size="sm"
        onClick={onSelect}
        className="w-full gap-2 rounded-lg text-xs font-medium"
        data-testid={`voice-diff-select-btn-${version}`}
        aria-pressed={isSelected}
      >
        {isSelected && <CheckCircle2 className="h-3 w-3" />}
        {isSelected ? 'Selected' : `Use ${label}`}
      </Button>
    </div>
  );
}

export function VoiceDiffPlayer({
  v2SampleUrl = DEFAULT_V2_URL,
  v3SampleUrl = DEFAULT_V3_URL,
  selectedVersion,
  onSelect,
  className,
  _audioFactory = defaultAudioFactory,
}: VoiceDiffPlayerProps) {
  const v2 = useAudioTrack(v2SampleUrl, _audioFactory);
  const v3 = useAudioTrack(v3SampleUrl, _audioFactory);

  const handleToggleV2 = useCallback(() => {
    v3.stop();
    v2.toggle();
  }, [v2, v3]);

  const handleToggleV3 = useCallback(() => {
    v2.stop();
    v3.toggle();
  }, [v2, v3]);

  return (
    <div
      className={cn('space-y-3', className)}
      data-testid="voice-diff-player"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Voice comparison
      </p>
      <div className="flex gap-3" role="group" aria-label="Voice version comparison">
        <TrackCard
          version="v2"
          label="V2 Legacy"
          badge="Legacy"
          description="Original voice engine — reliable and familiar"
          playback={v2.state}
          isSelected={selectedVersion === 'v2'}
          onToggle={handleToggleV2}
          onSelect={() => onSelect?.('v2')}
        />
        <TrackCard
          version="v3"
          label="V3 Enhanced"
          badge="New"
          description="Next-gen expressiveness with sub-2s latency"
          playback={v3.state}
          isSelected={selectedVersion === 'v3'}
          onToggle={handleToggleV3}
          onSelect={() => onSelect?.('v3')}
        />
      </div>
    </div>
  );
}
