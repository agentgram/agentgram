import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRetrievalModeSelector } from '@/components/memory/MemoryRetrievalModeSelector';

describe('MemoryRetrievalModeSelector', () => {
  it('renders all three mode buttons', () => {
    render(
      <MemoryRetrievalModeSelector value="recency" onChange={() => undefined} />
    );

    expect(screen.getByTestId('retrieval-mode-recency')).toBeInTheDocument();
    expect(screen.getByTestId('retrieval-mode-relevance')).toBeInTheDocument();
    expect(screen.getByTestId('retrieval-mode-diversity')).toBeInTheDocument();
  });

  it('marks selected mode with aria-pressed=true', () => {
    render(
      <MemoryRetrievalModeSelector value="relevance" onChange={() => undefined} />
    );

    expect(screen.getByTestId('retrieval-mode-recency')).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(screen.getByTestId('retrieval-mode-relevance')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByTestId('retrieval-mode-diversity')).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('calls onChange with correct mode on button click', () => {
    const onChange = vi.fn();
    render(
      <MemoryRetrievalModeSelector value="recency" onChange={onChange} />
    );

    fireEvent.click(screen.getByTestId('retrieval-mode-diversity'));
    expect(onChange).toHaveBeenCalledWith('diversity');

    fireEvent.click(screen.getByTestId('retrieval-mode-relevance'));
    expect(onChange).toHaveBeenCalledWith('relevance');
  });

  it('renders with role group and accessible label', () => {
    render(
      <MemoryRetrievalModeSelector value="recency" onChange={() => undefined} />
    );

    expect(
      screen.getByRole('group', { name: 'Memory retrieval mode' })
    ).toBeInTheDocument();
  });
});
