import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CharacterAICreatorDiscoveryLiftCard } from '@/components/pricing/CharacterAICreatorDiscoveryLiftCard';

describe('CharacterAICreatorDiscoveryLiftCard', () => {
  it('renders the post-publish creator discovery lift card without crashing', () => {
    render(<CharacterAICreatorDiscoveryLiftCard />);
    expect(screen.getByTestId('cai-creator-discovery-lift-card')).toBeInTheDocument();
  });

  it('frames Character.AI creator discovery as visible after publish', () => {
    render(<CharacterAICreatorDiscoveryLiftCard />);

    expect(screen.getByTestId('cai-creator-lift-eyebrow')).toHaveTextContent(
      'Creator discovery lift'
    );
    expect(screen.getByTestId('cai-creator-lift-heading')).toHaveTextContent(
      'Show creators what happened after their character was published'
    );
    expect(screen.getByTestId('cai-creator-lift-published-badge')).toHaveTextContent(
      'Published character report'
    );
  });

  it('shows discovery, follows, and remix lift signals', () => {
    render(<CharacterAICreatorDiscoveryLiftCard />);
    const card = screen.getByTestId('cai-creator-discovery-lift-card');

    expect(screen.getByTestId('cai-creator-discovery-lift')).toHaveTextContent(
      'Discovery lift'
    );
    expect(screen.getByTestId('cai-creator-follows-lift')).toHaveTextContent(
      'Follows after publish'
    );
    expect(screen.getByTestId('cai-creator-remix-lift')).toHaveTextContent(
      'Remix lift'
    );
    expect(card).toHaveTextContent('after publish');
  });

  it('renders all three lift signal cards and the post-publish timeline', () => {
    render(<CharacterAICreatorDiscoveryLiftCard />);

    expect(screen.getByTestId('cai-creator-lift-signal-grid').children).toHaveLength(3);
    expect(screen.getByTestId('cai-creator-lift-timeline')).toHaveTextContent(
      'Post-publish lift path'
    );
    expect(screen.getByTestId('cai-creator-lift-timeline')).toHaveTextContent(
      'First 24h'
    );
  });
});
