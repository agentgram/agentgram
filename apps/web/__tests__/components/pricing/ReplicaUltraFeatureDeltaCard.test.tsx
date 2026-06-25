import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReplicaUltraFeatureDeltaCard } from '@/components/pricing/ReplicaUltraFeatureDeltaCard';

describe('ReplicaUltraFeatureDeltaCard', () => {
  it('renders the card without crashing', () => {
    render(<ReplicaUltraFeatureDeltaCard />);
    expect(screen.getByTestId('replica-ultra-feature-delta-card')).toBeInTheDocument();
  });

  it('displays the heading', () => {
    render(<ReplicaUltraFeatureDeltaCard />);
    expect(screen.getByTestId('replica-delta-heading')).toBeInTheDocument();
    expect(screen.getByTestId('replica-delta-heading').textContent).toMatch(
      /AgentGram/
    );
  });

  it('shows the eyebrow label mentioning Replika Ultra vs AgentGram', () => {
    render(<ReplicaUltraFeatureDeltaCard />);
    expect(screen.getByTestId('replica-delta-eyebrow').textContent).toMatch(
      /Replika Ultra/i
    );
  });

  it('renders the comparison table', () => {
    render(<ReplicaUltraFeatureDeltaCard />);
    expect(screen.getByTestId('replica-delta-table')).toBeInTheDocument();
  });

  it('renders all 4 feature delta rows', () => {
    render(<ReplicaUltraFeatureDeltaCard />);
    const rows = screen.getAllByTestId('replica-delta-row');
    expect(rows).toHaveLength(4);
  });

  it('includes saved-message memory as a locked Replika feature', () => {
    render(<ReplicaUltraFeatureDeltaCard />);
    expect(screen.getByText('Saved-message memory')).toBeInTheDocument();
  });

  it('includes self-reflection as a locked Replika feature', () => {
    render(<ReplicaUltraFeatureDeltaCard />);
    expect(screen.getByText('Self-reflection responses')).toBeInTheDocument();
  });

  it('shows Replika Ultra price badge with $29.99/mo', () => {
    render(<ReplicaUltraFeatureDeltaCard />);
    expect(screen.getByTestId('replica-delta-price-badge-pro').textContent).toMatch(
      /\$29\.99\/mo/
    );
  });

  it('shows Replika Ultra annual price $119.99/yr', () => {
    render(<ReplicaUltraFeatureDeltaCard />);
    expect(screen.getByTestId('replica-delta-price-badge-pro').textContent).toMatch(
      /\$119\.99\/yr/
    );
  });

  it('shows AgentGram badge indicating all plans included', () => {
    render(<ReplicaUltraFeatureDeltaCard />);
    expect(screen.getByTestId('replica-delta-agentgram-badge').textContent).toMatch(
      /\$0/
    );
  });

  it('shows "All plans" availability for AgentGram in feature rows', () => {
    render(<ReplicaUltraFeatureDeltaCard />);
    const allPlansCells = screen.getAllByText('All plans');
    expect(allPlansCells.length).toBeGreaterThanOrEqual(4);
  });
});
