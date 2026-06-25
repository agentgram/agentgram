import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRetrievalBasisBadge } from '@/components/memory/MemoryRetrievalBasisBadge';

const BASIS = { recency: 'high', relevance: 'medium', diversity: 'low' } as const;
const MEM_ID = 'mem-abc';

describe('MemoryRetrievalBasisBadge', () => {
  it('renders all three retrieval factors', () => {
    render(<MemoryRetrievalBasisBadge memoryId={MEM_ID} basis={BASIS} />);
    expect(screen.getByTestId(`retrieval-basis-recency-${MEM_ID}`)).toBeInTheDocument();
    expect(screen.getByTestId(`retrieval-basis-relevance-${MEM_ID}`)).toBeInTheDocument();
    expect(screen.getByTestId(`retrieval-basis-diversity-${MEM_ID}`)).toBeInTheDocument();
  });

  it('shows correct level text for each factor', () => {
    render(<MemoryRetrievalBasisBadge memoryId={MEM_ID} basis={BASIS} />);
    expect(screen.getByTestId(`retrieval-basis-recency-${MEM_ID}`)).toHaveTextContent('Recency');
    expect(screen.getByTestId(`retrieval-basis-recency-${MEM_ID}`)).toHaveTextContent('high');
    expect(screen.getByTestId(`retrieval-basis-relevance-${MEM_ID}`)).toHaveTextContent('Relevance');
    expect(screen.getByTestId(`retrieval-basis-relevance-${MEM_ID}`)).toHaveTextContent('medium');
    expect(screen.getByTestId(`retrieval-basis-diversity-${MEM_ID}`)).toHaveTextContent('Diversity');
    expect(screen.getByTestId(`retrieval-basis-diversity-${MEM_ID}`)).toHaveTextContent('low');
  });

  it('is collapsed by default (details element is not open)', () => {
    render(<MemoryRetrievalBasisBadge memoryId={MEM_ID} basis={BASIS} />);
    const details = screen.getByTestId(`retrieval-basis-${MEM_ID}`);
    expect((details as HTMLDetailsElement).open).toBe(false);
  });

  it('expands when the summary is clicked', () => {
    render(<MemoryRetrievalBasisBadge memoryId={MEM_ID} basis={BASIS} />);
    const summary = screen.getByTestId(`retrieval-basis-summary-${MEM_ID}`);
    fireEvent.click(summary);
    const details = screen.getByTestId(`retrieval-basis-${MEM_ID}`);
    expect((details as HTMLDetailsElement).open).toBe(true);
  });

  it('renders the summary text "Why was this recalled?"', () => {
    render(<MemoryRetrievalBasisBadge memoryId={MEM_ID} basis={BASIS} />);
    expect(screen.getByTestId(`retrieval-basis-summary-${MEM_ID}`)).toHaveTextContent(
      'Why was this recalled?'
    );
  });

  it('applies high (green) style class to recency pill when level is high', () => {
    render(<MemoryRetrievalBasisBadge memoryId={MEM_ID} basis={BASIS} />);
    const recencyPill = screen.getByTestId(`retrieval-basis-recency-${MEM_ID}`);
    expect(recencyPill.className).toContain('emerald');
  });

  it('applies medium (amber) style class to relevance pill when level is medium', () => {
    render(<MemoryRetrievalBasisBadge memoryId={MEM_ID} basis={BASIS} />);
    const relevancePill = screen.getByTestId(`retrieval-basis-relevance-${MEM_ID}`);
    expect(relevancePill.className).toContain('amber');
  });
});
