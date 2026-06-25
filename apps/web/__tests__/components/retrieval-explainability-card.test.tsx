import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  RetrievalExplainabilityCard,
  getDominantFactor,
  type RetrievalBasis,
} from '@/components/memory/RetrievalExplainabilityCard';

const MEM_ID = 'mem-xyz-001';

describe('getDominantFactor', () => {
  it('returns recency when it has the highest level', () => {
    const basis: RetrievalBasis = { recency: 'high', relevance: 'medium', diversity: 'low' };
    expect(getDominantFactor(basis)).toBe('recency');
  });

  it('returns relevance when it has the highest level', () => {
    const basis: RetrievalBasis = { recency: 'low', relevance: 'high', diversity: 'medium' };
    expect(getDominantFactor(basis)).toBe('relevance');
  });

  it('returns diversity when it has the highest level', () => {
    const basis: RetrievalBasis = { recency: 'medium', relevance: 'low', diversity: 'high' };
    expect(getDominantFactor(basis)).toBe('diversity');
  });

  it('prefers recency over relevance and diversity on tie', () => {
    const basis: RetrievalBasis = { recency: 'high', relevance: 'high', diversity: 'high' };
    expect(getDominantFactor(basis)).toBe('recency');
  });
});

describe('RetrievalExplainabilityCard', () => {
  it('renders the dominant factor badge for recency', () => {
    const basis: RetrievalBasis = { recency: 'high', relevance: 'low', diversity: 'low' };
    render(<RetrievalExplainabilityCard memoryId={MEM_ID} basis={basis} />);
    const badge = screen.getByTestId(`explainability-badge-${MEM_ID}`);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Recency');
  });

  it('renders the dominant factor badge for relevance', () => {
    const basis: RetrievalBasis = { recency: 'low', relevance: 'high', diversity: 'low' };
    render(<RetrievalExplainabilityCard memoryId={MEM_ID} basis={basis} />);
    const badge = screen.getByTestId(`explainability-badge-${MEM_ID}`);
    expect(badge).toHaveTextContent('Relevance');
  });

  it('renders the dominant factor badge for diversity', () => {
    const basis: RetrievalBasis = { recency: 'low', relevance: 'low', diversity: 'high' };
    render(<RetrievalExplainabilityCard memoryId={MEM_ID} basis={basis} />);
    const badge = screen.getByTestId(`explainability-badge-${MEM_ID}`);
    expect(badge).toHaveTextContent('Diversity');
  });

  it('renders a tooltip element with explanatory text for recency', () => {
    const basis: RetrievalBasis = { recency: 'high', relevance: 'low', diversity: 'low' };
    render(<RetrievalExplainabilityCard memoryId={MEM_ID} basis={basis} />);
    const tooltip = screen.getByTestId(`explainability-tooltip-${MEM_ID}`);
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('recently mentioned or updated');
  });

  it('renders a tooltip element with explanatory text for relevance', () => {
    const basis: RetrievalBasis = { recency: 'low', relevance: 'high', diversity: 'low' };
    render(<RetrievalExplainabilityCard memoryId={MEM_ID} basis={basis} />);
    const tooltip = screen.getByTestId(`explainability-tooltip-${MEM_ID}`);
    expect(tooltip).toHaveTextContent('conversation context');
  });

  it('renders a tooltip element with explanatory text for diversity', () => {
    const basis: RetrievalBasis = { recency: 'low', relevance: 'low', diversity: 'high' };
    render(<RetrievalExplainabilityCard memoryId={MEM_ID} basis={basis} />);
    const tooltip = screen.getByTestId(`explainability-tooltip-${MEM_ID}`);
    expect(tooltip).toHaveTextContent('variety');
  });

  it('renders the outer wrapper with correct testId', () => {
    const basis: RetrievalBasis = { recency: 'medium', relevance: 'low', diversity: 'low' };
    render(<RetrievalExplainabilityCard memoryId={MEM_ID} basis={basis} />);
    expect(screen.getByTestId(`explainability-card-${MEM_ID}`)).toBeInTheDocument();
  });

  it('includes the correct emoji for the dominant factor', () => {
    const recencyBasis: RetrievalBasis = { recency: 'high', relevance: 'low', diversity: 'low' };
    const { rerender } = render(
      <RetrievalExplainabilityCard memoryId={MEM_ID} basis={recencyBasis} />
    );
    expect(screen.getByTestId(`explainability-badge-${MEM_ID}`)).toHaveTextContent('🕐');

    const relevanceBasis: RetrievalBasis = { recency: 'low', relevance: 'high', diversity: 'low' };
    rerender(<RetrievalExplainabilityCard memoryId={MEM_ID} basis={relevanceBasis} />);
    expect(screen.getByTestId(`explainability-badge-${MEM_ID}`)).toHaveTextContent('⭐');

    const diversityBasis: RetrievalBasis = { recency: 'low', relevance: 'low', diversity: 'high' };
    rerender(<RetrievalExplainabilityCard memoryId={MEM_ID} basis={diversityBasis} />);
    expect(screen.getByTestId(`explainability-badge-${MEM_ID}`)).toHaveTextContent('🌀');
  });

  it('applies sky color class for recency dominant factor', () => {
    const basis: RetrievalBasis = { recency: 'high', relevance: 'low', diversity: 'low' };
    render(<RetrievalExplainabilityCard memoryId={MEM_ID} basis={basis} />);
    expect(screen.getByTestId(`explainability-badge-${MEM_ID}`).className).toContain('sky');
  });

  it('applies amber color class for relevance dominant factor', () => {
    const basis: RetrievalBasis = { recency: 'low', relevance: 'high', diversity: 'low' };
    render(<RetrievalExplainabilityCard memoryId={MEM_ID} basis={basis} />);
    expect(screen.getByTestId(`explainability-badge-${MEM_ID}`).className).toContain('amber');
  });

  it('applies violet color class for diversity dominant factor', () => {
    const basis: RetrievalBasis = { recency: 'low', relevance: 'low', diversity: 'high' };
    render(<RetrievalExplainabilityCard memoryId={MEM_ID} basis={basis} />);
    expect(screen.getByTestId(`explainability-badge-${MEM_ID}`).className).toContain('violet');
  });
});
