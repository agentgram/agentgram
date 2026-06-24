import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ReplyQualityFeedback } from '../../../components/chat/ReplyQualityFeedback';

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const defaultProps = { messageId: 'msg-001', userId: 'user-123' };

beforeEach(() => {
  vi.clearAllMocks();
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({ received: true }) });
});

describe('ReplyQualityFeedback', () => {
  it('renders the trigger button when userId is provided', () => {
    render(<ReplyQualityFeedback {...defaultProps} />);
    expect(screen.getByTestId('reply-quality-trigger')).toBeInTheDocument();
  });

  it('returns null when userId is not provided', () => {
    const { container } = render(<ReplyQualityFeedback messageId="msg-001" userId={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when userId is undefined', () => {
    const { container } = render(<ReplyQualityFeedback messageId="msg-001" />);
    expect(container.firstChild).toBeNull();
  });

  it('opens the dropdown menu when trigger is clicked', () => {
    render(<ReplyQualityFeedback {...defaultProps} />);
    expect(screen.queryByTestId('reply-quality-menu')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('reply-quality-trigger'));
    expect(screen.getByTestId('reply-quality-menu')).toBeInTheDocument();
  });

  it('renders all 5 reason options in the dropdown', () => {
    render(<ReplyQualityFeedback {...defaultProps} />);
    fireEvent.click(screen.getByTestId('reply-quality-trigger'));
    expect(screen.getByTestId('reply-quality-option-repetitive')).toBeInTheDocument();
    expect(screen.getByTestId('reply-quality-option-off-topic')).toBeInTheDocument();
    expect(screen.getByTestId('reply-quality-option-missed-memory')).toBeInTheDocument();
    expect(screen.getByTestId('reply-quality-option-filtered')).toBeInTheDocument();
    expect(screen.getByTestId('reply-quality-option-other')).toBeInTheDocument();
  });

  it('calls POST /api/v1/feedback/reply-quality with correct body on option select', async () => {
    render(<ReplyQualityFeedback {...defaultProps} />);
    fireEvent.click(screen.getByTestId('reply-quality-trigger'));
    fireEvent.click(screen.getByTestId('reply-quality-option-repetitive'));
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/feedback/reply-quality',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ reason: 'repetitive', messageId: 'msg-001' }),
        })
      )
    );
  });

  it('closes the dropdown after selecting a reason', async () => {
    render(<ReplyQualityFeedback {...defaultProps} />);
    fireEvent.click(screen.getByTestId('reply-quality-trigger'));
    fireEvent.click(screen.getByTestId('reply-quality-option-missed-memory'));
    await waitFor(() =>
      expect(screen.queryByTestId('reply-quality-menu')).not.toBeInTheDocument()
    );
  });

  it('trigger has aria-label for accessibility', () => {
    render(<ReplyQualityFeedback {...defaultProps} />);
    expect(screen.getByTestId('reply-quality-trigger')).toHaveAttribute(
      'aria-label',
      'Report low-quality reply'
    );
  });

  it('closes the dropdown when clicking outside', () => {
    render(
      <div>
        <ReplyQualityFeedback {...defaultProps} />
        <button data-testid="outside">outside</button>
      </div>
    );
    fireEvent.click(screen.getByTestId('reply-quality-trigger'));
    expect(screen.getByTestId('reply-quality-menu')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByTestId('reply-quality-menu')).not.toBeInTheDocument();
  });
});
