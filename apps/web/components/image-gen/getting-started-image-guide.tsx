'use client';

import { useState } from 'react';
import { HelpCircle, X, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'agentgram:image-guide-dismissed';

const TIPS = [
  {
    id: 'tip-describe',
    text: 'Describe the scene in detail — include lighting, mood, and setting for better results.',
  },
  {
    id: 'tip-style',
    text: 'Mention an art style (e.g. "cinematic photo", "anime illustration") to guide the look.',
  },
  {
    id: 'tip-character',
    text: 'Reference your agent by name so Nomi V5 keeps appearance consistent across images.',
  },
  {
    id: 'tip-avoid',
    text: 'Add "avoid text overlays, watermarks" at the end to keep images clean.',
  },
] as const;

export const ANCHOR_PRESETS = [
  { id: 'cinematic-portrait', label: 'cinematic portrait', prompt: 'cinematic portrait, dramatic lighting, shallow depth of field, film grain' },
  { id: 'anime-style', label: 'anime style', prompt: 'anime illustration, clean linework, vibrant colors, expressive character design' },
  { id: 'realistic-photo', label: 'realistic photo', prompt: 'photorealistic, high resolution, natural lighting, sharp focus' },
  { id: 'fantasy-art', label: 'fantasy art', prompt: 'epic fantasy illustration, magical atmosphere, detailed environment, painterly style' },
  { id: 'cozy-scene', label: 'cozy scene', prompt: 'warm cozy atmosphere, soft lighting, intimate setting, comfortable mood' },
  { id: 'dark-aesthetic', label: 'dark aesthetic', prompt: 'dark moody aesthetic, high contrast, dramatic shadows, noir atmosphere' },
] as const;

export type AnchorPreset = (typeof ANCHOR_PRESETS)[number];

interface GettingStartedImageGuideProps {
  onSelectPreset?: (prompt: string) => void;
  forceVisible?: boolean;
}

export function GettingStartedImageGuide({
  onSelectPreset,
  forceVisible = false,
}: GettingStartedImageGuideProps) {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return !localStorage.getItem(STORAGE_KEY);
    } catch {
      return true;
    }
  });
  const [manuallyOpen, setManuallyOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  function handleDismiss() {
    setVisible(false);
    setManuallyOpen(false);
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // storage unavailable
    }
  }

  function handleToggle() {
    if (visible && manuallyOpen) {
      setVisible(false);
      setManuallyOpen(false);
    } else {
      setVisible(true);
      setManuallyOpen(true);
    }
  }

  const isOpen = !dismissed && (forceVisible || visible || manuallyOpen);

  return (
    <div data-testid="getting-started-image-guide">
      {!isOpen && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          data-testid="image-guide-toggle"
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          aria-label="Show image generation tips"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Prompt tips
        </Button>
      )}

      {isOpen && (
        <div
          className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-4"
          data-testid="image-guide-panel"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" aria-hidden="true" />
              <p className="text-sm font-semibold" data-testid="image-guide-title">
                Getting started with image generation
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              data-testid="image-guide-dismiss"
              className="h-6 w-6 p-0"
              aria-label="Dismiss image guide"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <ul className="space-y-2" data-testid="image-guide-tips">
            {TIPS.map((tip) => (
              <li
                key={tip.id}
                data-testid={tip.id}
                className="flex gap-2 text-sm text-muted-foreground"
              >
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden="true" />
                {tip.text}
              </li>
            ))}
          </ul>

          {onSelectPreset && (
            <div data-testid="image-guide-presets">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Quick start — click to add to your prompt:
              </p>
              <div className="flex flex-wrap gap-2">
                {ANCHOR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onSelectPreset(preset.prompt)}
                    data-testid={`image-guide-preset-${preset.id}`}
                    className="rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
