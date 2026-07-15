import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReplikaUpdateChangeExplainerStrip } from '@/components/pricing/ReplikaUpdateChangeExplainerStrip';

describe('ReplikaUpdateChangeExplainerStrip', () => {
  it('renders the update-change explainer strip without crashing', () => {
    render(<ReplikaUpdateChangeExplainerStrip />);
    expect(screen.getByTestId('replika-update-change-explainer-strip')).toBeInTheDocument();
  });

  it('explains update changes before users bounce', () => {
    render(<ReplikaUpdateChangeExplainerStrip />);

    expect(screen.getByTestId('update-change-eyebrow')).toHaveTextContent(
      'Update-change explainer'
    );
    expect(screen.getByTestId('update-change-heading')).toHaveTextContent(
      'Show what changed before users bounce'
    );
    expect(screen.getByTestId('update-change-memo-badge')).toHaveTextContent('Memo first');
  });

  it('shows plan differences, memory changes, and voice changes', () => {
    render(<ReplikaUpdateChangeExplainerStrip />);

    expect(screen.getByTestId('update-change-plan-differences')).toHaveTextContent(
      'Plan changes'
    );
    expect(screen.getByTestId('update-change-plan-differences')).toHaveTextContent(
      'Plan differences'
    );
    expect(screen.getByTestId('update-change-memory-changes')).toHaveTextContent(
      'Memory changes'
    );
    expect(screen.getByTestId('update-change-voice-changes')).toHaveTextContent(
      'Voice changes'
    );
  });

  it('keeps the before and after memo visible', () => {
    render(<ReplikaUpdateChangeExplainerStrip />);

    const memo = screen.getByTestId('update-change-before-after-memo');
    expect(memo).toHaveTextContent('Before/after memo');
    expect(memo).toHaveTextContent('current plan benefits');
    expect(memo).toHaveTextContent('voice readiness');
  });
});
