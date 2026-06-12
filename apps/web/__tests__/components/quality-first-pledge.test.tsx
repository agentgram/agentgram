import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import QualityFirstPledgeStrip, {
  QualityFirstPledgeBadge,
} from '../../components/home/QualityFirstPledge';

describe('QualityFirstPledgeStrip', () => {
  it('renders with correct test id', () => {
    render(<QualityFirstPledgeStrip />);
    expect(
      screen.getByTestId('home-quality-first-pledge-strip')
    ).toBeInTheDocument();
  });

  it('displays quality-first headline', () => {
    render(<QualityFirstPledgeStrip />);
    expect(
      screen.getByText(/Quality-first — no silent regressions, ever/i)
    ).toBeInTheDocument();
  });

  it('mentions C.AI silent degradation context', () => {
    render(<QualityFirstPledgeStrip />);
    expect(screen.getByText(/C\.AI silently degraded/i)).toBeInTheDocument();
  });

  it('has aria-label for accessibility', () => {
    render(<QualityFirstPledgeStrip />);
    expect(
      screen.getByLabelText('Quality-first, no silent regressions pledge')
    ).toBeInTheDocument();
  });

  it('mentions zero silent quality degradations commitment', () => {
    render(<QualityFirstPledgeStrip />);
    expect(
      screen.getByText(/zero silent quality degradations/i)
    ).toBeInTheDocument();
  });
});

describe('QualityFirstPledgeBadge', () => {
  it('renders with correct test id', () => {
    render(<QualityFirstPledgeBadge />);
    expect(
      screen.getByTestId('quality-first-pledge-badge')
    ).toBeInTheDocument();
  });

  it('displays Quality-First Guaranteed label', () => {
    render(<QualityFirstPledgeBadge />);
    expect(screen.getByText(/Quality-First Guaranteed/i)).toBeInTheDocument();
  });

  it('displays no silent regressions headline', () => {
    render(<QualityFirstPledgeBadge />);
    expect(
      screen.getByText(/No silent quality regressions — ever/i)
    ).toBeInTheDocument();
  });

  it('mentions versioned capability changes', () => {
    render(<QualityFirstPledgeBadge />);
    expect(screen.getByText(/versioned and announced/i)).toBeInTheDocument();
  });

  it('has aria-label for accessibility', () => {
    render(<QualityFirstPledgeBadge />);
    expect(
      screen.getByLabelText('Quality-first pledge badge')
    ).toBeInTheDocument();
  });
});
