import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NarrativeArcShareButton } from '@/components/NarrativeArcShareButton';

// ---------------------------------------------------------------------------
// Clipboard mock
// ---------------------------------------------------------------------------
const mockWriteText = vi.fn();

beforeEach(() => {
  mockWriteText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: mockWriteText },
    configurable: true,
    writable: true,
  });
  // Stable origin for URL assertions
  Object.defineProperty(window, 'location', {
    value: { origin: 'https://agentgram.co' },
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('NarrativeArcShareButton', () => {
  it('renders the share button', () => {
    render(<NarrativeArcShareButton arcId="arc-001" />);
    expect(screen.getByTestId('narrative-arc-share-button')).toBeInTheDocument();
  });

  it('shows "Share arc" label by default', () => {
    render(<NarrativeArcShareButton arcId="arc-001" />);
    expect(screen.getByTestId('narrative-arc-share-label')).toHaveTextContent('Share arc');
  });

  it('calls clipboard.writeText with correct URL on click', async () => {
    render(<NarrativeArcShareButton arcId="arc-001" />);
    fireEvent.click(screen.getByTestId('narrative-arc-share-button'));
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(
        'https://agentgram.co/arc/share?arcId=arc-001'
      );
    });
  });

  it('includes chapterIndex in the URL when provided', async () => {
    render(<NarrativeArcShareButton arcId="arc-002" chapterIndex={3} />);
    fireEvent.click(screen.getByTestId('narrative-arc-share-button'));
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(
        'https://agentgram.co/arc/share?arcId=arc-002&chapter=3'
      );
    });
  });

  it('does not include chapter param when chapterIndex is undefined', async () => {
    render(<NarrativeArcShareButton arcId="arc-003" />);
    fireEvent.click(screen.getByTestId('narrative-arc-share-button'));
    await waitFor(() => {
      const url = mockWriteText.mock.calls[0][0] as string;
      expect(url).not.toContain('chapter');
    });
  });

  it('shows "Link copied!" toast after successful copy', async () => {
    render(<NarrativeArcShareButton arcId="arc-001" />);
    fireEvent.click(screen.getByTestId('narrative-arc-share-button'));
    await waitFor(() => {
      expect(screen.getByTestId('narrative-arc-share-copied')).toHaveTextContent('Link copied!');
    });
  });

  it('reverts label back to "Share arc" after 2s', async () => {
    // Use real timers — wait for toast to appear, then wait >2s for revert.
    render(<NarrativeArcShareButton arcId="arc-001" />);

    fireEvent.click(screen.getByTestId('narrative-arc-share-button'));

    // Toast appears after clipboard resolves
    await waitFor(() => {
      expect(screen.getByTestId('narrative-arc-share-copied')).toBeInTheDocument();
    });

    // Label reverts after 2 s timeout fires
    await waitFor(
      () => {
        expect(screen.getByTestId('narrative-arc-share-label')).toHaveTextContent('Share arc');
      },
      { timeout: 3000 }
    );
  }, 6000);

  it('applies custom className to the button', () => {
    render(<NarrativeArcShareButton arcId="arc-001" className="custom-cls" />);
    expect(screen.getByTestId('narrative-arc-share-button')).toHaveClass('custom-cls');
  });

  it('does nothing when arcId is empty string', async () => {
    render(<NarrativeArcShareButton arcId="" />);
    fireEvent.click(screen.getByTestId('narrative-arc-share-button'));
    await act(async () => { await Promise.resolve(); });
    expect(mockWriteText).not.toHaveBeenCalled();
  });

  it('handles clipboard error gracefully without throwing', async () => {
    mockWriteText.mockRejectedValueOnce(new Error('Permission denied'));
    render(<NarrativeArcShareButton arcId="arc-err" />);
    // Should not throw
    await act(async () => {
      fireEvent.click(screen.getByTestId('narrative-arc-share-button'));
      await Promise.resolve();
    });
    // Label stays as "Share arc" (copy failed, no toast)
    expect(screen.queryByTestId('narrative-arc-share-copied')).not.toBeInTheDocument();
  });

  it('uses chapterIndex 0 correctly (not treated as falsy)', async () => {
    render(<NarrativeArcShareButton arcId="arc-zero" chapterIndex={0} />);
    fireEvent.click(screen.getByTestId('narrative-arc-share-button'));
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(
        'https://agentgram.co/arc/share?arcId=arc-zero&chapter=0'
      );
    });
  });
});
