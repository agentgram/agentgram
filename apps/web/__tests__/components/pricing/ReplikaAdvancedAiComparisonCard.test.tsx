import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReplikaAdvancedAiComparisonCard } from '@/components/pricing/ReplikaAdvancedAiComparisonCard';

describe('ReplikaAdvancedAiComparisonCard', () => {
  it('renders the comparison card without crashing', () => {
    render(<ReplikaAdvancedAiComparisonCard />);
    expect(screen.getByTestId('replika-advanced-ai-comparison-card')).toBeInTheDocument();
  });

  it('explains the Advanced AI mode preview before switching modes', () => {
    render(<ReplikaAdvancedAiComparisonCard />);
    expect(screen.getByTestId('advanced-ai-eyebrow')).toHaveTextContent('Advanced AI mode preview');
    expect(screen.getByTestId('advanced-ai-heading')).toHaveTextContent(
      'See what improves before you switch modes'
    );
  });

  it('shows the response and memory improvements AgentGram previews up front', () => {
    render(<ReplikaAdvancedAiComparisonCard />);
    const card = screen.getByTestId('replika-advanced-ai-comparison-card');
    expect(card).toHaveTextContent('response');
    expect(card).toHaveTextContent('memory');
    expect(card).toHaveTextContent('before checkout');
  });

  it('shows the decision path from standard chat to AgentGram preview', () => {
    render(<ReplikaAdvancedAiComparisonCard />);
    const steps = screen.getByTestId('advanced-ai-decision-steps');

    expect(steps).toHaveTextContent('Replika standard chat');
    expect(steps).toHaveTextContent('Advanced AI upgrade');
    expect(steps).toHaveTextContent('AgentGram preview');
  });

  it('renders all comparison rows', () => {
    render(<ReplikaAdvancedAiComparisonCard />);
    expect(screen.getByTestId('advanced-ai-response-depth')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-ai-memory-carryover')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-ai-switching-confidence')).toBeInTheDocument();
  });

  it('compares Replika Advanced AI against AgentGram in each row', () => {
    render(<ReplikaAdvancedAiComparisonCard />);
    expect(screen.getAllByText('Replika Advanced AI')).toHaveLength(3);
    expect(screen.getAllByText('AgentGram')).toHaveLength(3);
  });
});
