'use client';

import { useState, useCallback } from 'react';
import { Check, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
}

export const NOMI_V3_VOICES: VoiceOption[] = [
  {
    id: 'warm-gentle',
    name: 'Warm & Gentle',
    description: 'Soft, nurturing tone with calm delivery',
  },
  {
    id: 'playful-bright',
    name: 'Playful & Bright',
    description: 'Upbeat, energetic, and lighthearted',
  },
  {
    id: 'deep-calm',
    name: 'Deep & Calm',
    description: 'Rich, measured voice with quiet confidence',
  },
  {
    id: 'crisp-clear',
    name: 'Crisp & Clear',
    description: 'Sharp articulation, professional and direct',
  },
  {
    id: 'expressive-dramatic',
    name: 'Expressive & Dramatic',
    description: 'Vivid, emotionally dynamic range',
  },
];

const PLAY_STATE_DURATION_MS = 2000;

export interface VoiceAuditionCarouselProps {
  voices?: VoiceOption[];
  selectedVoiceId?: string;
  onChange?: (voiceId: string) => void;
  className?: string;
  /** Injected for unit tests to control timers. */
  _setTimeout?: typeof setTimeout;
}

export function VoiceAuditionCarousel({
  voices = NOMI_V3_VOICES,
  selectedVoiceId,
  onChange,
  className,
  _setTimeout: setTimeoutFn = setTimeout,
}: VoiceAuditionCarouselProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handlePlay = useCallback(
    (voiceId: string, voiceName: string) => {
      if (playingId === voiceId) return;

      console.log(`Playing: ${voiceName}`);
      setPlayingId(voiceId);

      setTimeoutFn(() => {
        setPlayingId(null);
      }, PLAY_STATE_DURATION_MS);
    },
    [playingId, setTimeoutFn]
  );

  const handleSelect = useCallback(
    (voiceId: string) => {
      onChange?.(voiceId);
    },
    [onChange]
  );

  return (
    <div
      className={cn('space-y-3', className)}
      data-testid="voice-audition-carousel"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Voice selection
      </p>
      <div
        className="flex flex-wrap gap-3"
        role="listbox"
        aria-label="Voice options"
      >
        {voices.map((voice) => {
          const isSelected = selectedVoiceId === voice.id;
          const isPlaying = playingId === voice.id;

          return (
            <div
              key={voice.id}
              role="option"
              aria-selected={isSelected}
              data-testid={`voice-card-${voice.id}`}
              className={cn(
                'relative flex w-44 flex-col gap-2 rounded-xl border p-3 transition-all',
                isSelected
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-border/60 bg-card hover:border-primary/30 hover:bg-primary/5'
              )}
            >
              {isSelected && (
                <span
                  className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary"
                  data-testid={`voice-card-${voice.id}-checkmark`}
                  aria-hidden="true"
                >
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                </span>
              )}

              <button
                type="button"
                onClick={() => handleSelect(voice.id)}
                className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-sm"
                aria-label={`Select ${voice.name} voice`}
                data-testid={`voice-card-${voice.id}-select-button`}
              >
                <p className="pr-5 text-sm font-semibold leading-tight text-foreground">
                  {voice.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {voice.description}
                </p>
              </button>

              <button
                type="button"
                onClick={() => handlePlay(voice.id, voice.name)}
                disabled={isPlaying}
                aria-label={
                  isPlaying
                    ? `Playing ${voice.name}`
                    : `Preview ${voice.name} voice`
                }
                data-testid={`voice-card-${voice.id}-play-button`}
                className={cn(
                  'inline-flex items-center gap-1.5 self-start rounded-full border px-2 py-0.5 text-xs font-medium transition',
                  isPlaying
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border/60 bg-background text-foreground/70 hover:border-primary/30 hover:bg-primary/5'
                )}
              >
                <Play
                  className={cn('h-2.5 w-2.5', isPlaying && 'text-primary')}
                  aria-hidden="true"
                />
                {isPlaying ? 'Playing...' : 'Preview'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VoiceAuditionCarousel;
