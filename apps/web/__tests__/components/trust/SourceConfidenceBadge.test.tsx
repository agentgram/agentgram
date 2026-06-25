import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SourceConfidenceBadge } from '../../../components/trust/SourceConfidenceBadge';

describe('SourceConfidenceBadge', () => {
  it('renders the verified variant with correct label and testid', () => {
    render(<SourceConfidenceBadge variant="verified" />);
    const badge = screen.getByTestId('source-confidence-badge-verified');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Verified source');
  });

  it('renders the blocked variant with correct label and testid', () => {
    render(<SourceConfidenceBadge variant="blocked" />);
    const badge = screen.getByTestId('source-confidence-badge-blocked');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Canonical source blocked');
  });

  it('renders the fallback variant with correct label and testid', () => {
    render(<SourceConfidenceBadge variant="fallback" />);
    const badge = screen.getByTestId('source-confidence-badge-fallback');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Secondary source');
  });
});
