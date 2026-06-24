import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RelationshipMilestoneCelebrationCard } from '../../../components/chat/RelationshipMilestoneCelebrationCard';

const defaultProps = {
  milestone: '7d' as const,
  agentName: 'Aria',
  onShare: vi.fn(),
  onDismiss: vi.fn(),
};

describe('RelationshipMilestoneCelebrationCard — 7d milestone', () => {
  it('renders the card with 7d headline', () => {
    render(<RelationshipMilestoneCelebrationCard {...defaultProps} milestone="7d" />);
    expect(screen.getByTestId('milestone-headline')).toHaveTextContent('1 Week Together!');
  });

  it('renders the 7d emoji', () => {
    render(<RelationshipMilestoneCelebrationCard {...defaultProps} milestone="7d" />);
    expect(screen.getByTestId('milestone-emoji')).toHaveTextContent('🎉');
  });

  it('renders the 7d stat label', () => {
    render(<RelationshipMilestoneCelebrationCard {...defaultProps} milestone="7d" />);
    expect(screen.getByTestId('milestone-stat')).toHaveTextContent('7 days');
  });
});

describe('RelationshipMilestoneCelebrationCard — 30d milestone', () => {
  it('renders the card with 30d headline', () => {
    render(<RelationshipMilestoneCelebrationCard {...defaultProps} milestone="30d" />);
    expect(screen.getByTestId('milestone-headline')).toHaveTextContent('One Month Strong!');
  });

  it('renders the 30d emoji', () => {
    render(<RelationshipMilestoneCelebrationCard {...defaultProps} milestone="30d" />);
    expect(screen.getByTestId('milestone-emoji')).toHaveTextContent('💫');
  });
});

describe('RelationshipMilestoneCelebrationCard — 100msg milestone', () => {
  it('renders the card with 100msg headline', () => {
    render(<RelationshipMilestoneCelebrationCard {...defaultProps} milestone="100msg" />);
    expect(screen.getByTestId('milestone-headline')).toHaveTextContent('100 Memories Made!');
  });

  it('renders the 100msg emoji', () => {
    render(<RelationshipMilestoneCelebrationCard {...defaultProps} milestone="100msg" />);
    expect(screen.getByTestId('milestone-emoji')).toHaveTextContent('✨');
  });

  it('renders the 100msg stat label', () => {
    render(<RelationshipMilestoneCelebrationCard {...defaultProps} milestone="100msg" />);
    expect(screen.getByTestId('milestone-stat')).toHaveTextContent('100 messages');
  });
});

describe('RelationshipMilestoneCelebrationCard — 365d milestone', () => {
  it('renders the card with 365d headline', () => {
    render(<RelationshipMilestoneCelebrationCard {...defaultProps} milestone="365d" />);
    expect(screen.getByTestId('milestone-headline')).toHaveTextContent('One Year Anniversary!');
  });

  it('renders the 365d emoji', () => {
    render(<RelationshipMilestoneCelebrationCard {...defaultProps} milestone="365d" />);
    expect(screen.getByTestId('milestone-emoji')).toHaveTextContent('🌟');
  });
});

describe('RelationshipMilestoneCelebrationCard — agent name', () => {
  it('displays the provided agent name', () => {
    render(
      <RelationshipMilestoneCelebrationCard {...defaultProps} agentName="Nova" />
    );
    expect(screen.getByTestId('milestone-agent-name')).toHaveTextContent('Nova');
  });
});

describe('RelationshipMilestoneCelebrationCard — interactions', () => {
  it('calls onShare when the share button is clicked', () => {
    const onShare = vi.fn();
    render(<RelationshipMilestoneCelebrationCard {...defaultProps} onShare={onShare} />);
    fireEvent.click(screen.getByTestId('milestone-share-button'));
    expect(onShare).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when the dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<RelationshipMilestoneCelebrationCard {...defaultProps} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByTestId('milestone-dismiss-button'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('RelationshipMilestoneCelebrationCard — nextFeatureUnlock', () => {
  it('renders the unlock CTA when nextFeatureUnlock is provided', () => {
    render(
      <RelationshipMilestoneCelebrationCard
        {...defaultProps}
        nextFeatureUnlock="Voice Calls"
      />
    );
    const cta = screen.getByTestId('milestone-unlock-cta');
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveTextContent('Unlock Voice Calls');
  });

  it('does not render the unlock CTA when nextFeatureUnlock is absent', () => {
    render(<RelationshipMilestoneCelebrationCard {...defaultProps} />);
    expect(screen.queryByTestId('milestone-unlock-cta')).not.toBeInTheDocument();
  });
});

describe('RelationshipMilestoneCelebrationCard — accessibility', () => {
  it('renders with role="status"', () => {
    render(<RelationshipMilestoneCelebrationCard {...defaultProps} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('dismiss button has accessible label', () => {
    render(<RelationshipMilestoneCelebrationCard {...defaultProps} />);
    expect(screen.getByLabelText('Dismiss milestone card')).toBeInTheDocument();
  });
});
