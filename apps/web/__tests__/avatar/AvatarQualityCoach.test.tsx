import React from 'react';
import { fireEvent, render, screen, waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { AvatarQualityCoach, runQualityChecks } from '@/components/avatar/AvatarQualityCoach';

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Builds a minimal File object with controllable size and type. */
function makeFile(options: {
  name?: string;
  sizeBytes?: number;
  type?: string;
}): File {
  const { name = 'photo.jpg', sizeBytes = 200 * 1024, type = 'image/jpeg' } = options;
  const content = new Uint8Array(sizeBytes).fill(0xff);
  return new File([content], name, { type });
}

/**
 * Creates high-variance (alternating black/white) pixel data for a 64×64 canvas.
 * This represents a sharp, detailed image.
 */
function makeHighVariancePixels(): Uint8ClampedArray {
  const data = new Uint8ClampedArray(64 * 64 * 4);
  for (let i = 0; i < data.length; i += 4) {
    const v = (i / 4) % 2 === 0 ? 0 : 255;
    data[i] = v; data[i + 1] = v; data[i + 2] = v; data[i + 3] = 255;
  }
  return data;
}

/** Creates uniform grey pixel data — zero variance (blurry image). */
function makeZeroVariancePixels(): Uint8ClampedArray {
  return new Uint8ClampedArray(64 * 64 * 4).fill(128);
}

/**
 * Sets up Image + canvas mocks for tests that need runQualityChecks to
 * reach the blur and orientation checks.
 */
function setupMocks({
  pixelData,
  aspectRatio = 1,
}: {
  pixelData: Uint8ClampedArray;
  aspectRatio?: number;
}) {
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = vi.fn();

  const originalImage = global.Image;

  // Build a replacement Image class where setting src triggers onload synchronously
  // in the next microtask, with controlled naturalWidth/naturalHeight.
  const nw = Math.round(aspectRatio * 100);
  const nh = 100;

  function MockImage(this: {
    naturalWidth: number;
    naturalHeight: number;
    _src: string;
    onload: (() => void) | null;
    onerror: (() => void) | null;
  }) {
    this.naturalWidth = nw;
    this.naturalHeight = nh;
    this._src = '';
    this.onload = null;
    this.onerror = null;
  }

  Object.defineProperty(MockImage.prototype, 'src', {
    configurable: true,
    set(this: { _src: string; onload: (() => void) | null }, value: string) {
      this._src = value;
      if (value && this.onload) {
        // Queue in microtask so async handlers see it
        Promise.resolve().then(() => {
          if (this.onload) this.onload();
        });
      }
    },
    get(this: { _src: string }) {
      return this._src;
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.Image = MockImage as any;

  // Mock canvas context so getImageData returns controlled pixel data
  const origGetContext = HTMLCanvasElement.prototype.getContext;
  const mockCtx = {
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({ data: pixelData })),
  };
  HTMLCanvasElement.prototype.getContext = vi.fn(
    () => mockCtx,
  ) as typeof origGetContext;

  return () => {
    global.Image = originalImage;
    HTMLCanvasElement.prototype.getContext = origGetContext;
    (HTMLCanvasElement.prototype.getContext as ReturnType<typeof vi.fn>).mockRestore?.();
  };
}

// ── Unit tests for runQualityChecks — size & type ─────────────────────────────

describe('runQualityChecks — size reject', () => {
  it('returns hard-reject when file is smaller than 150 KB', async () => {
    const file = makeFile({ sizeBytes: 100 * 1024, type: 'image/jpeg' });
    const result = await runQualityChecks(file);
    expect(result.status).toBe('hard-reject');
    expect(result.trigger).toBe('size');
  });

  it('includes the actual KB size in the rejection message', async () => {
    const file = makeFile({ sizeBytes: 80 * 1024, type: 'image/jpeg' });
    const result = await runQualityChecks(file);
    expect(result.message).toContain('80 KB');
  });
});

describe('runQualityChecks — type reject', () => {
  it('returns hard-reject for a non-image file', async () => {
    const file = makeFile({ sizeBytes: 500 * 1024, type: 'application/pdf' });
    const result = await runQualityChecks(file);
    expect(result.status).toBe('hard-reject');
    expect(result.trigger).toBe('type');
  });
});

// ── Blur reject: test computeImageVariance logic directly ──────────────────────

describe('runQualityChecks — blur reject', () => {
  /**
   * Instead of fighting the async Image mock for the blurry path,
   * we test the blur logic indirectly: uniform pixel data (zero variance)
   * should cause hard-reject with trigger=blur.
   *
   * We mock the canvas to return uniform (zero-variance) pixels and
   * use a real Image-like mock that fires onload synchronously.
   */
  let restore: () => void;

  beforeEach(() => {
    restore = setupMocks({ pixelData: makeZeroVariancePixels(), aspectRatio: 1 });
  });

  afterEach(() => restore());

  it('returns hard-reject when image pixel variance is zero (uniform/blurry canvas)', async () => {
    const file = makeFile({ sizeBytes: 300 * 1024, type: 'image/jpeg' });
    const result = await runQualityChecks(file);
    // computeImageVariance returns 0 (uniform pixels) → below threshold → blur reject
    expect(result.status).toBe('hard-reject');
    expect(result.trigger).toBe('blur');
  });
});

// ── Orientation soft-warn ──────────────────────────────────────────────────────

describe('runQualityChecks — orientation soft-warn', () => {
  let restore: () => void;

  beforeEach(() => {
    restore = setupMocks({ pixelData: makeHighVariancePixels(), aspectRatio: 4 });
  });

  afterEach(() => restore());

  it('returns soft-warn when aspect ratio is too wide (panorama)', async () => {
    const file = makeFile({ sizeBytes: 300 * 1024, type: 'image/jpeg' });
    const result = await runQualityChecks(file);
    expect(result.status).toBe('soft-warn');
    expect(result.trigger).toBe('orientation');
  });
});

// ── Pass case ──────────────────────────────────────────────────────────────────

describe('runQualityChecks — pass', () => {
  let restore: () => void;

  beforeEach(() => {
    restore = setupMocks({ pixelData: makeHighVariancePixels(), aspectRatio: 1 });
  });

  afterEach(() => restore());

  it('returns pass for a sharp square image above 150 KB', async () => {
    const file = makeFile({ sizeBytes: 300 * 1024, type: 'image/jpeg' });
    const result = await runQualityChecks(file);
    expect(result.status).toBe('pass');
    expect(result.trigger).toBe('pass');
  });
});

// ── UI state tests ─────────────────────────────────────────────────────────────

describe('AvatarQualityCoach UI', () => {
  it('renders the upload button', () => {
    render(<AvatarQualityCoach onAccept={vi.fn()} />);
    expect(screen.getByTestId('quality-coach-upload-btn')).toBeInTheDocument();
  });

  it('does not show a banner before any file is selected', () => {
    render(<AvatarQualityCoach onAccept={vi.fn()} />);
    expect(screen.queryByTestId('quality-coach-banner')).not.toBeInTheDocument();
  });

  it('shows hard-reject red banner for a too-small file', async () => {
    render(<AvatarQualityCoach onAccept={vi.fn()} />);
    const input = screen.getByTestId('quality-coach-file-input');
    const tinyFile = makeFile({ sizeBytes: 50 * 1024, type: 'image/jpeg' });

    await act(async () => {
      fireEvent.change(input, { target: { files: [tinyFile] } });
    });

    await waitFor(() => {
      expect(screen.getByTestId('quality-coach-banner')).toBeInTheDocument();
    });
    expect(screen.getByTestId('quality-coach-icon-reject')).toBeInTheDocument();
    expect(screen.getByTestId('quality-coach-message')).toHaveTextContent('50 KB');
  });

  it('shows a "Choose a different photo" retry button on hard-reject', async () => {
    render(<AvatarQualityCoach onAccept={vi.fn()} />);
    const input = screen.getByTestId('quality-coach-file-input');
    const tinyFile = makeFile({ sizeBytes: 50 * 1024, type: 'image/jpeg' });

    await act(async () => {
      fireEvent.change(input, { target: { files: [tinyFile] } });
    });
    await waitFor(() => screen.getByTestId('quality-coach-banner'));

    expect(screen.getByTestId('quality-coach-retry-btn')).toBeInTheDocument();
  });

  it('does NOT call onAccept for a hard-reject (too-small) file', async () => {
    const onAccept = vi.fn();
    render(<AvatarQualityCoach onAccept={onAccept} />);
    const input = screen.getByTestId('quality-coach-file-input');
    const tinyFile = makeFile({ sizeBytes: 50 * 1024, type: 'image/jpeg' });

    await act(async () => {
      fireEvent.change(input, { target: { files: [tinyFile] } });
    });
    await waitFor(() => screen.getByTestId('quality-coach-banner'));

    expect(onAccept).not.toHaveBeenCalled();
  });

  it('accepts a custom uploadLabel prop on the CTA button', () => {
    render(<AvatarQualityCoach onAccept={vi.fn()} uploadLabel="Pick your selfie" />);
    expect(screen.getByTestId('quality-coach-upload-btn')).toHaveTextContent('Pick your selfie');
  });

  it('shows green pass banner and calls onAccept for a valid sharp square photo', async () => {
    const restore = setupMocks({ pixelData: makeHighVariancePixels(), aspectRatio: 1 });

    const onAccept = vi.fn();
    render(<AvatarQualityCoach onAccept={onAccept} />);
    const input = screen.getByTestId('quality-coach-file-input');
    const goodFile = makeFile({ sizeBytes: 300 * 1024, type: 'image/jpeg' });

    await act(async () => {
      fireEvent.change(input, { target: { files: [goodFile] } });
    });

    await waitFor(() => screen.getByTestId('quality-coach-banner'));
    expect(screen.getByTestId('quality-coach-icon-pass')).toBeInTheDocument();
    expect(onAccept).toHaveBeenCalledWith(goodFile);

    restore();
  });

  it('shows yellow advisory banner and "Continue anyway" button for soft-warn', async () => {
    const restore = setupMocks({ pixelData: makeHighVariancePixels(), aspectRatio: 4 });

    render(<AvatarQualityCoach onAccept={vi.fn()} />);
    const input = screen.getByTestId('quality-coach-file-input');
    const wideFile = makeFile({ sizeBytes: 300 * 1024, type: 'image/jpeg' });

    await act(async () => {
      fireEvent.change(input, { target: { files: [wideFile] } });
    });

    await waitFor(() => screen.getByTestId('quality-coach-banner'));
    expect(screen.getByTestId('quality-coach-icon-warn')).toBeInTheDocument();
    expect(screen.getByTestId('quality-coach-override-btn')).toBeInTheDocument();

    restore();
  });

  it('calls onAccept when user overrides a soft-warn via "Continue anyway"', async () => {
    const restore = setupMocks({ pixelData: makeHighVariancePixels(), aspectRatio: 4 });

    const onAccept = vi.fn();
    render(<AvatarQualityCoach onAccept={onAccept} />);
    const input = screen.getByTestId('quality-coach-file-input');
    const wideFile = makeFile({ sizeBytes: 300 * 1024, type: 'image/jpeg' });

    await act(async () => {
      fireEvent.change(input, { target: { files: [wideFile] } });
    });

    await waitFor(() => screen.getByTestId('quality-coach-override-btn'));
    fireEvent.click(screen.getByTestId('quality-coach-override-btn'));

    expect(onAccept).toHaveBeenCalledWith(wideFile);

    restore();
  });
});
