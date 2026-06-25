import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CompanionRelationshipHealthPanel } from '@/components/companion-relationship-health-panel';

const BASE_PROPS = {
  agentId: 'agent-abc',
  frequencyScore: 75,
  memoryDepth: 8,
  milestoneCount: 3,
  lastActiveAt: new Date().toISOString(),
};

describe('CompanionRelationshipHealthPanel', () => {
  it('renders the panel container', () => {
    render(<CompanionRelationshipHealthPanel {...BASE_PROPS} />);
    expect(screen.getByTestId('companion-relationship-health-panel')).toBeInTheDocument();
  });

  it('renders the Relationship Health heading', () => {
    render(<CompanionRelationshipHealthPanel {...BASE_PROPS} />);
    expect(screen.getByText('Relationship Health')).toBeInTheDocument();
  });

  it('shows the frequency score badge with score and label', () => {
    render(<CompanionRelationshipHealthPanel {...BASE_PROPS} frequencyScore={75} />);
    const badge = screen.getByTestId('companion-health-score-badge');
    expect(badge).toHaveTextContent('75/100');
    expect(badge).toHaveTextContent('Strong');
  });

  it('labels score <40 as Early', () => {
    render(<CompanionRelationshipHealthPanel {...BASE_PROPS} frequencyScore={20} />);
    expect(screen.getByTestId('companion-health-score-badge')).toHaveTextContent('Early');
  });

  it('labels score 40-70 as Growing', () => {
    render(<CompanionRelationshipHealthPanel {...BASE_PROPS} frequencyScore={55} />);
    expect(screen.getByTestId('companion-health-score-badge')).toHaveTextContent('Growing');
  });

  it('labels score >70 as Strong', () => {
    render(<CompanionRelationshipHealthPanel {...BASE_PROPS} frequencyScore={85} />);
    expect(screen.getByTestId('companion-health-score-badge')).toHaveTextContent('Strong');
  });

  it('clamps score above 100 to 100', () => {
    render(<CompanionRelationshipHealthPanel {...BASE_PROPS} frequencyScore={150} />);
    expect(screen.getByTestId('companion-health-score-badge')).toHaveTextContent('100/100');
  });

  it('clamps score below 0 to 0', () => {
    render(<CompanionRelationshipHealthPanel {...BASE_PROPS} frequencyScore={-10} />);
    expect(screen.getByTestId('companion-health-score-badge')).toHaveTextContent('0/100');
  });

  it('renders memory depth count', () => {
    render(<CompanionRelationshipHealthPanel {...BASE_PROPS} memoryDepth={8} />);
    expect(screen.getByTestId('companion-health-memory-depth')).toHaveTextContent('8 facts');
  });

  it('uses singular "fact" for memoryDepth of 1', () => {
    render(<CompanionRelationshipHealthPanel {...BASE_PROPS} memoryDepth={1} />);
    expect(screen.getByTestId('companion-health-memory-depth')).toHaveTextContent('1 fact');
  });

  it('renders milestone count', () => {
    render(<CompanionRelationshipHealthPanel {...BASE_PROPS} milestoneCount={3} />);
    expect(screen.getByTestId('companion-health-milestone-count')).toHaveTextContent('3');
  });

  it('renders last active as "Just now" for very recent date', () => {
    render(
      <CompanionRelationshipHealthPanel
        {...BASE_PROPS}
        lastActiveAt={new Date(Date.now() - 5 * 60 * 1000).toISOString()}
      />
    );
    expect(screen.getByTestId('companion-health-last-active')).toHaveTextContent('Just now');
  });

  it('renders last active as "Today" for same-day date', () => {
    render(
      <CompanionRelationshipHealthPanel
        {...BASE_PROPS}
        lastActiveAt={new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()}
      />
    );
    expect(screen.getByTestId('companion-health-last-active')).toHaveTextContent('Today');
  });

  it('renders last active relative label for older dates', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    render(
      <CompanionRelationshipHealthPanel
        {...BASE_PROPS}
        lastActiveAt={threeDaysAgo}
      />
    );
    expect(screen.getByTestId('companion-health-last-active')).toHaveTextContent('3 days ago');
  });

  it('renders score bar track', () => {
    render(<CompanionRelationshipHealthPanel {...BASE_PROPS} />);
    expect(screen.getByTestId('companion-health-score-bar-track')).toBeInTheDocument();
  });

  it('renders score bar fill with correct width style', () => {
    render(<CompanionRelationshipHealthPanel {...BASE_PROPS} frequencyScore={60} />);
    const fill = screen.getByTestId('companion-health-score-bar-fill');
    expect(fill).toHaveStyle({ width: '60%' });
  });
});
