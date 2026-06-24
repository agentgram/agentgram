import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { ContinuityReceiptCard } from '@/components/continuity-receipt-card';

const TWENTY_FIVE_HOURS_AGO = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
const TWENTY_THREE_HOURS_AGO = new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString();

beforeEach(() => {
  sessionStorage.clear();
});

describe('ContinuityReceiptCard', () => {
  it('renders when the user has been away 24+ hours', () => {
    render(<ContinuityReceiptCard lastVisitedAt={TWENTY_FIVE_HOURS_AGO} memoryCount={12} />);
    expect(screen.getByTestId('continuity-receipt-card')).toBeInTheDocument();
  });

  it('does not render when gap is less than 24 hours', () => {
    render(<ContinuityReceiptCard lastVisitedAt={TWENTY_THREE_HOURS_AGO} memoryCount={5} />);
    expect(screen.queryByTestId('continuity-receipt-card')).not.toBeInTheDocument();
  });

  it('shows the memory count', () => {
    render(<ContinuityReceiptCard lastVisitedAt={TWENTY_FIVE_HOURS_AGO} memoryCount={7} />);
    expect(screen.getByTestId('continuity-receipt-memory-count')).toHaveTextContent(
      '7개의 기억이 유지되었습니다'
    );
  });

  it('shows "no changes" when recentChanges is not provided', () => {
    render(<ContinuityReceiptCard lastVisitedAt={TWENTY_FIVE_HOURS_AGO} />);
    expect(screen.getByTestId('continuity-receipt-changes')).toHaveTextContent('변경된 것 없음');
  });

  it('shows custom recentChanges when provided', () => {
    render(
      <ContinuityReceiptCard
        lastVisitedAt={TWENTY_FIVE_HOURS_AGO}
        recentChanges="프로필 페이지 업데이트"
      />
    );
    expect(screen.getByTestId('continuity-receipt-changes')).toHaveTextContent(
      '프로필 페이지 업데이트'
    );
  });

  it('shows no-update label when appUpdatedSince is false', () => {
    render(<ContinuityReceiptCard lastVisitedAt={TWENTY_FIVE_HOURS_AGO} appUpdatedSince={false} />);
    expect(screen.getByTestId('continuity-receipt-update-status')).toHaveTextContent(
      '마지막 방문 이후 앱 업데이트 없음'
    );
  });

  it('shows stability label when appUpdatedSince is true', () => {
    render(<ContinuityReceiptCard lastVisitedAt={TWENTY_FIVE_HOURS_AGO} appUpdatedSince={true} />);
    expect(screen.getByTestId('continuity-receipt-update-status')).toHaveTextContent(
      '업데이트 이후 메모리 안정'
    );
  });

  it('dismisses the card when the close button is clicked', () => {
    render(<ContinuityReceiptCard lastVisitedAt={TWENTY_FIVE_HOURS_AGO} memoryCount={3} />);
    expect(screen.getByTestId('continuity-receipt-card')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('continuity-receipt-dismiss'));
    expect(screen.queryByTestId('continuity-receipt-card')).not.toBeInTheDocument();
  });

  it('does not re-show after dismissal within the same session', () => {
    const { unmount } = render(
      <ContinuityReceiptCard lastVisitedAt={TWENTY_FIVE_HOURS_AGO} memoryCount={3} />
    );
    fireEvent.click(screen.getByTestId('continuity-receipt-dismiss'));
    unmount();

    render(<ContinuityReceiptCard lastVisitedAt={TWENTY_FIVE_HOURS_AGO} memoryCount={3} />);
    expect(screen.queryByTestId('continuity-receipt-card')).not.toBeInTheDocument();
  });

  it('accepts a Date object for lastVisitedAt', () => {
    const date = new Date(Date.now() - 26 * 60 * 60 * 1000);
    render(<ContinuityReceiptCard lastVisitedAt={date} memoryCount={0} />);
    expect(screen.getByTestId('continuity-receipt-card')).toBeInTheDocument();
  });
});
