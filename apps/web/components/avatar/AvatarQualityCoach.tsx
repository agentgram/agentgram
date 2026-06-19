'use client';

import { useState, useRef, useCallback } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Constants ──────────────────────────────────────────────────────────────────

/** Minimum acceptable file size in bytes (150 KB). */
const MIN_FILE_SIZE_BYTES = 150 * 1024;

/**
 * Blur heuristic threshold.
 * We measure pixel-value variance across a downsampled greyscale canvas.
 * Images with variance below this are considered blurry.
 */
const BLUR_VARIANCE_THRESHOLD = 100;

/** Aspect-ratio bounds for a plausible portrait/square photo. */
const ASPECT_RATIO_MIN = 0.5;
const ASPECT_RATIO_MAX = 2.0;

// ── Types ──────────────────────────────────────────────────────────────────────

export type QualityStatus = 'idle' | 'checking' | 'pass' | 'soft-warn' | 'hard-reject';

export interface QualityResult {
  status: QualityStatus;
  /** Short human-readable message describing the result. */
  message: string;
  /** Which check triggered the result (for tests / analytics). */
  trigger?: 'blur' | 'size' | 'type' | 'orientation' | 'pass';
}

export interface AvatarQualityCoachProps {
  /** Called with the validated File when the user confirms the upload. */
  onAccept: (file: File) => void;
  /** Optional additional className applied to the root wrapper. */
  className?: string;
  /** Label shown on the upload CTA button. */
  uploadLabel?: string;
}

// ── Blur heuristic ─────────────────────────────────────────────────────────────

/**
 * Computes pixel-variance of a greyscale thumbnail via an offscreen canvas.
 * Returns a numeric variance — lower == blurrier.
 *
 * Exported for unit testing without a real browser canvas (callers mock
 * `computeImageVariance` via vi.mock).
 */
export async function computeImageVariance(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const SIZE = 64; // downsample to 64×64 for speed
        const canvas = document.createElement('canvas');
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(0);
          return;
        }
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

        // Convert to greyscale luminance values
        const pixels: number[] = [];
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]!;
          const g = data[i + 1]!;
          const b = data[i + 2]!;
          pixels.push(0.299 * r + 0.587 * g + 0.114 * b);
        }

        const mean = pixels.reduce((s, v) => s + v, 0) / pixels.length;
        const variance =
          pixels.reduce((s, v) => s + (v - mean) ** 2, 0) / pixels.length;
        resolve(variance);
      } catch {
        resolve(0);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image for blur check'));
    };

    img.src = url;
  });
}

/**
 * Checks whether an image's natural dimensions suggest a reasonable portrait or
 * square crop (no extreme panoramas or thin slices).
 * Returns the aspect ratio (width / height).
 */
export function getImageAspectRatio(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img.naturalWidth / img.naturalHeight);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image for aspect-ratio check'));
    };
    img.src = url;
  });
}

// ── Core validation ────────────────────────────────────────────────────────────

/**
 * Runs all quality checks against a File and returns a QualityResult.
 * Exported so tests can call it directly.
 */
export async function runQualityChecks(file: File): Promise<QualityResult> {
  // 1. MIME type
  if (!file.type.startsWith('image/')) {
    return {
      status: 'hard-reject',
      message: 'File must be an image (JPEG, PNG, or WebP).',
      trigger: 'type',
    };
  }

  // 2. File size
  if (file.size < MIN_FILE_SIZE_BYTES) {
    return {
      status: 'hard-reject',
      message: `Image is too small (${Math.round(file.size / 1024)} KB). Use a photo that is at least 150 KB for best results.`,
      trigger: 'size',
    };
  }

  // 3. Blur detection
  let variance: number;
  try {
    variance = await computeImageVariance(file);
  } catch {
    variance = BLUR_VARIANCE_THRESHOLD + 1; // assume OK if canvas unavailable
  }

  if (variance < BLUR_VARIANCE_THRESHOLD) {
    return {
      status: 'hard-reject',
      message:
        'Photo appears blurry or out of focus. Upload a sharp, well-lit image for the best avatar result.',
      trigger: 'blur',
    };
  }

  // 4. Orientation / aspect-ratio heuristic
  let aspectRatio: number;
  try {
    aspectRatio = await getImageAspectRatio(file);
  } catch {
    aspectRatio = 1; // assume square/fine
  }

  if (aspectRatio < ASPECT_RATIO_MIN || aspectRatio > ASPECT_RATIO_MAX) {
    return {
      status: 'soft-warn',
      message:
        'The image looks like a wide panorama or an unusually narrow crop — a face centered in a square or portrait frame works best.',
      trigger: 'orientation',
    };
  }

  return {
    status: 'pass',
    message: 'Photo looks great!',
    trigger: 'pass',
  };
}

// ── Feedback banner ────────────────────────────────────────────────────────────

interface FeedbackBannerProps {
  result: QualityResult;
  onOverride: () => void;
  onRetry: () => void;
}

function FeedbackBanner({ result, onOverride, onRetry }: FeedbackBannerProps) {
  const isHardReject = result.status === 'hard-reject';
  const isSoftWarn = result.status === 'soft-warn';
  const isPass = result.status === 'pass';

  if (!isHardReject && !isSoftWarn && !isPass) return null;

  return (
    <div
      className={cn(
        'mt-3 rounded-lg border p-3',
        isHardReject && 'border-destructive/40 bg-destructive/10',
        isSoftWarn && 'border-amber-500/40 bg-amber-500/10',
        isPass && 'border-emerald-500/40 bg-emerald-500/10',
      )}
      data-testid="quality-coach-banner"
      role={isHardReject || isSoftWarn ? 'alert' : 'status'}
    >
      <div className="flex items-start gap-2.5">
        {isHardReject && (
          <AlertCircle
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
            data-testid="quality-coach-icon-reject"
          />
        )}
        {isSoftWarn && (
          <AlertTriangle
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
            data-testid="quality-coach-icon-warn"
          />
        )}
        {isPass && (
          <CheckCircle2
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
            data-testid="quality-coach-icon-pass"
          />
        )}

        <div className="flex-1 space-y-2">
          <p
            className={cn(
              'text-sm font-medium',
              isHardReject && 'text-destructive',
              isSoftWarn && 'text-amber-800 dark:text-amber-200',
              isPass && 'text-emerald-800 dark:text-emerald-200',
            )}
            data-testid="quality-coach-message"
          >
            {result.message}
          </p>

          {(isHardReject || isSoftWarn) && (
            <div className="flex flex-wrap gap-2">
              <Button
                data-testid="quality-coach-retry-btn"
                onClick={onRetry}
                size="sm"
                type="button"
                variant="outline"
              >
                Choose a different photo
              </Button>
              {isSoftWarn && (
                <Button
                  data-testid="quality-coach-override-btn"
                  onClick={onOverride}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Continue anyway
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * AvatarQualityCoach wraps an avatar/photo upload input with client-side
 * quality checks (blur, file size, orientation) before any generation API call.
 *
 * Usage:
 * ```tsx
 * <AvatarQualityCoach onAccept={(file) => startGeneration(file)} />
 * ```
 */
export function AvatarQualityCoach({
  onAccept,
  className,
  uploadLabel = 'Upload source photo',
}: AvatarQualityCoachProps) {
  const [qualityResult, setQualityResult] = useState<QualityResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setQualityResult(null);
    setPendingFile(null);
    setIsChecking(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setPendingFile(file);
      setIsChecking(true);
      setQualityResult(null);

      const result = await runQualityChecks(file);
      setQualityResult(result);
      setIsChecking(false);

      if (result.status === 'pass') {
        onAccept(file);
      }
    },
    [onAccept],
  );

  const handleOverride = useCallback(() => {
    if (pendingFile) {
      onAccept(pendingFile);
    }
  }, [pendingFile, onAccept]);

  const handleRetry = useCallback(() => {
    reset();
    fileInputRef.current?.click();
  }, [reset]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={cn('space-y-1', className)} data-testid="avatar-quality-coach">
      <input
        accept="image/jpeg,image/png,image/webp"
        aria-label="Upload source photo for avatar generation"
        className="sr-only"
        data-testid="quality-coach-file-input"
        onChange={handleFileChange}
        ref={fileInputRef}
        type="file"
      />

      <Button
        className="flex items-center gap-2"
        data-testid="quality-coach-upload-btn"
        disabled={isChecking}
        onClick={handleUploadClick}
        size="sm"
        type="button"
        variant="outline"
      >
        <Upload className="h-4 w-4" />
        {isChecking ? 'Checking photo…' : uploadLabel}
      </Button>

      {qualityResult && (
        <FeedbackBanner
          onOverride={handleOverride}
          onRetry={handleRetry}
          result={qualityResult}
        />
      )}
    </div>
  );
}
