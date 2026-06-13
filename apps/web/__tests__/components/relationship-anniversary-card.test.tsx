import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  RelationshipAnniversaryCard,
  getMilestone,
} from '../../components/chat/RelationshipAnniversaryCard';

describe('getMilestone', () => {
  it('returns null for days < 7', () => {
    expect(getMilestone(0)).toBeNull();
    expect(getMilestone(6)).toBeNull();
  });

  it('returns 7 for days 7-29', () => {
    expect(getMilestone(7)).toBe(7);
    expect(getMilestone(29)).toBe(7);
  });

  it('returns 30 for days 30-99', () => {
    expect(getMilestone(30)).toBe(30);
    expect(getMilestone(99)).toBe(30);
  });

  it('returns 100 for days >= 100', () => {
    expect(getMilestone(100)).toBe(100);
    expect(getMilestone(365)).toBe(100);
  });
});

describe('RelationshipAnniversaryCard', () => {
  const onDismiss = vi.fn();

  it('renders nothing when dayCount is below 7', () => {
    const { container } = render(
      <RelationshipAnniversaryCard dayCount={5} agentName="Aria" onDismiss={onDismiss} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders 7-day milestone card with correct heading and emoji', () => {
    render(
      <RelationshipAnniversaryCard dayCount={7} agentName="Aria" onDismiss={onDismiss} />
    );
    expect(screen.getByTestId('anniversary-heading')).toHaveTextContent('7 days together!');
    expect(screen.getByTestId('anniversary-emoji')).toHaveTextContent('🎉');
  });

  it('renders 30-day milestone card with correct heading and emoji', () => {
    render(
      <RelationshipAnniversaryCard dayCount={30} agentName="Bono" onDismiss={onDismiss} />
    );
    expect(screen.getByTestId('anniversary-heading')).toHaveTextContent('1 month milestone!');
    expect(screen.getByTestId('anniversary-emoji')).toHaveTextContent('💫');
  });

  it('renders 100-day milestone card with correct heading and emoji', () => {
    render(
      <RelationshipAnniversaryCard dayCount={100} agentName="Cleo" onDismiss={onDismiss} />
    );
    expect(screen.getByTestId('anniversary-heading')).toHaveTextContent('100 days!');
    expect(screen.getByTestId('anniversary-emoji')).toHaveTextContent('🌟');
  });

  it('shows streak badge with exact dayCount', () => {
    render(
      <RelationshipAnniversaryCard dayCount={42} agentName="Dex" onDismiss={onDismiss} />
    );
    expect(screen.getByTestId('anniversary-streak-badge')).toHaveTextContent('42 days');
  });

  it('includes agentName in subtext', () => {
    render(
      <RelationshipAnniversaryCard dayCount={7} agentName="Elara" onDismiss={onDismiss} />
    );
    expect(screen.getByTestId('anniversary-subtext')).toHaveTextContent('Elara');
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const handleDismiss = vi.fn();
    render(
      <RelationshipAnniversaryCard dayCount={30} agentName="Aria" onDismiss={handleDismiss} />
    );
    fireEvent.click(screen.getByTestId('anniversary-dismiss-button'));
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders the root element with correct role', () => {
    render(
      <RelationshipAnniversaryCard dayCount={100} agentName="Gaia" onDismiss={onDismiss} />
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('uses 30-day milestone for days between 30 and 99', () => {
    render(
      <RelationshipAnniversaryCard dayCount={55} agentName="Iris" onDismiss={onDismiss} />
    );
    expect(screen.getByTestId('anniversary-heading')).toHaveTextContent('1 month milestone!');
    expect(screen.getByTestId('anniversary-streak-badge')).toHaveTextContent('55 days');
  });
});
