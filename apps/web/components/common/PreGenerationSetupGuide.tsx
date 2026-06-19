'use client';

import { useState } from 'react';
import { CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────────

export type ImageQuality = 'standard' | 'hd';

export type ImageStyle = 'Photorealistic' | 'Illustrated' | 'Pixel Art';

export interface PreGenerationConfig {
  memoryContext: string;
  quality: ImageQuality;
  style: ImageStyle;
}

export interface PreGenerationSetupGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (config: PreGenerationConfig) => void;
  onCancel: () => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const QUALITY_OPTIONS: { value: ImageQuality; label: string; description: string }[] = [
  { value: 'standard', label: 'Standard', description: 'Faster generation, great for drafts' },
  { value: 'hd', label: 'HD', description: 'Higher detail, ideal for final output' },
];

const STYLE_OPTIONS: { value: ImageStyle; label: string }[] = [
  { value: 'Photorealistic', label: 'Photorealistic' },
  { value: 'Illustrated', label: 'Illustrated' },
  { value: 'Pixel Art', label: 'Pixel Art' },
];

const STEPS = [
  { id: 1, title: 'Memory Context', description: 'Set memory anchor for this generation' },
  { id: 2, title: 'Quality Pre-flight', description: 'Check image generation settings' },
  { id: 3, title: 'Generate', description: 'Ready to generate' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

// ── Step indicator ─────────────────────────────────────────────────────────────

interface StepIndicatorProps {
  currentStep: StepId;
}

function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5" aria-label="Setup progress">
      {STEPS.map((step, idx) => {
        const isDone = step.id < currentStep;
        const isActive = step.id === currentStep;
        return (
          <div key={step.id} className="flex items-center gap-1.5">
            <div
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                isDone && 'bg-primary text-primary-foreground',
                isActive && 'border-2 border-primary bg-primary/10 text-primary',
                !isDone && !isActive && 'border border-border/60 bg-muted text-muted-foreground',
              )}
              aria-current={isActive ? 'step' : undefined}
              data-testid={`pre-gen-step-indicator-${step.id}`}
            >
              {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : step.id}
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-px w-8 transition-colors',
                  isDone ? 'bg-primary' : 'bg-border/60',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1: Memory Context ────────────────────────────────────────────────────

interface MemoryContextStepProps {
  value: string;
  onChange: (value: string) => void;
}

function MemoryContextStep({ value, onChange }: MemoryContextStepProps) {
  return (
    <div className="space-y-3" data-testid="pre-gen-step-memory">
      <p className="text-sm text-muted-foreground">
        Add character traits, style notes, or scene details. This context will be embedded
        directly into the image prompt to keep generations consistent.
      </p>
      <div className="space-y-1.5">
        <label
          htmlFor="pre-gen-memory-context"
          className="text-xs font-medium text-foreground"
        >
          Memory anchor context
        </label>
        <textarea
          id="pre-gen-memory-context"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          placeholder="e.g. Silver hair, violet eyes, wears a dark coat. Always looks calm and composed. Prefers muted tones and soft lighting."
          className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          data-testid="pre-gen-memory-textarea"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Leave blank to generate without a memory anchor.
      </p>
    </div>
  );
}

// ── Step 2: Quality Pre-flight ────────────────────────────────────────────────

interface QualityPreflightStepProps {
  quality: ImageQuality;
  style: ImageStyle;
  onQualityChange: (quality: ImageQuality) => void;
  onStyleChange: (style: ImageStyle) => void;
}

function QualityPreflightStep({
  quality,
  style,
  onQualityChange,
  onStyleChange,
}: QualityPreflightStepProps) {
  return (
    <div className="space-y-5" data-testid="pre-gen-step-quality">
      <fieldset>
        <legend className="text-xs font-medium text-muted-foreground mb-2.5">
          Quality tier
        </legend>
        <div className="grid grid-cols-2 gap-2" data-testid="pre-gen-quality-group">
          {QUALITY_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                'flex cursor-pointer flex-col gap-0.5 rounded-xl border p-3 transition-colors',
                quality === opt.value
                  ? 'border-primary/40 bg-primary/5 text-primary'
                  : 'border-border/60 bg-background hover:border-primary/20',
              )}
            >
              <input
                type="radio"
                name="pre-gen-quality"
                value={opt.value}
                checked={quality === opt.value}
                onChange={() => onQualityChange(opt.value)}
                className="sr-only"
                data-testid={`pre-gen-quality-${opt.value}`}
              />
              <span className="text-sm font-semibold">{opt.label}</span>
              <span className="text-xs text-muted-foreground">{opt.description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-medium text-muted-foreground mb-2.5">
          Style
        </legend>
        <div className="flex flex-wrap gap-2" data-testid="pre-gen-style-group">
          {STYLE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                'flex cursor-pointer items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                style === opt.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/60 bg-background text-muted-foreground hover:border-primary/40',
              )}
            >
              <input
                type="radio"
                name="pre-gen-style"
                value={opt.value}
                checked={style === opt.value}
                onChange={() => onStyleChange(opt.value)}
                className="sr-only"
                data-testid={`pre-gen-style-${opt.value.toLowerCase().replace(/\s+/g, '-')}`}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

// ── Step 3: Summary + Generate ────────────────────────────────────────────────

interface SummaryStepProps {
  memoryContext: string;
  quality: ImageQuality;
  style: ImageStyle;
}

function SummaryStep({ memoryContext, quality, style }: SummaryStepProps) {
  return (
    <div className="space-y-4" data-testid="pre-gen-step-summary">
      <p className="text-sm text-muted-foreground">
        Review your setup before generating. You can go back to adjust any settings.
      </p>

      <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-3">
        <div data-testid="pre-gen-summary-memory">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Memory context
          </p>
          {memoryContext.trim() ? (
            <p className="text-sm text-foreground leading-relaxed">{memoryContext}</p>
          ) : (
            <p className="text-sm italic text-muted-foreground">None — generating without anchor</p>
          )}
        </div>

        <div className="h-px bg-border/40" />

        <div className="flex gap-6" data-testid="pre-gen-summary-settings">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Quality
            </p>
            <p className="text-sm font-medium text-foreground capitalize">{quality}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Style
            </p>
            <p className="text-sm font-medium text-foreground">{style}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * PreGenerationSetupGuide is a 3-step modal that walks users through memory
 * context input and quality/style pre-flight before triggering image generation.
 *
 * Usage:
 * ```tsx
 * <PreGenerationSetupGuide
 *   open={guideOpen}
 *   onOpenChange={setGuideOpen}
 *   onComplete={(config) => startGeneration(config)}
 *   onCancel={() => setGuideOpen(false)}
 * />
 * ```
 */
export function PreGenerationSetupGuide({
  open,
  onOpenChange,
  onComplete,
  onCancel,
}: PreGenerationSetupGuideProps) {
  const [step, setStep] = useState<StepId>(1);
  const [memoryContext, setMemoryContext] = useState('');
  const [quality, setQuality] = useState<ImageQuality>('standard');
  const [style, setStyle] = useState<ImageStyle>('Photorealistic');

  function handleClose(next: boolean) {
    onOpenChange(next);
    if (!next) {
      // Reset state when closed
      setStep(1);
      setMemoryContext('');
      setQuality('standard');
      setStyle('Photorealistic');
    }
  }

  function handleCancel() {
    handleClose(false);
    onCancel();
  }

  function handleNext() {
    if (step < 3) {
      setStep((s) => (s + 1) as StepId);
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep((s) => (s - 1) as StepId);
    }
  }

  function handleGenerate() {
    onComplete({ memoryContext, quality, style });
    handleClose(false);
  }

  const currentStepMeta = STEPS.find((s) => s.id === step)!;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-md"
        data-testid="pre-generation-setup-guide"
        aria-labelledby="pre-gen-title"
      >
        <DialogHeader>
          <div className="mb-3">
            <StepIndicator currentStep={step} />
          </div>
          <DialogTitle id="pre-gen-title" data-testid="pre-gen-title">
            {currentStepMeta.title}
          </DialogTitle>
          <DialogDescription data-testid="pre-gen-description">
            {currentStepMeta.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {step === 1 && (
            <MemoryContextStep value={memoryContext} onChange={setMemoryContext} />
          )}
          {step === 2 && (
            <QualityPreflightStep
              quality={quality}
              style={style}
              onQualityChange={setQuality}
              onStyleChange={setStyle}
            />
          )}
          {step === 3 && (
            <SummaryStep memoryContext={memoryContext} quality={quality} style={style} />
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between gap-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              data-testid="pre-gen-cancel-btn"
            >
              Cancel
            </Button>
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBack}
                data-testid="pre-gen-back-btn"
              >
                Back
              </Button>
            )}
          </div>

          {step < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              size="sm"
              data-testid="pre-gen-next-btn"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleGenerate}
              size="sm"
              data-testid="pre-gen-generate-btn"
            >
              <Sparkles className="mr-1.5 h-4 w-4" />
              Generate Image
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
