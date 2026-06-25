import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MoltbookAcquisitionIndependenceSection from '../../components/home/MoltbookAcquisitionIndependenceSection';

describe('MoltbookAcquisitionIndependenceSection', () => {
  it('renders with correct test id', () => {
    render(<MoltbookAcquisitionIndependenceSection />);
    expect(
      screen.getByTestId('home-moltbook-acquisition-independence-section')
    ).toBeInTheDocument();
  });

  it('displays independence headline', () => {
    render(<MoltbookAcquisitionIndependenceSection />);
    expect(
      screen.getByText(/AgentGram is independently owned — and will stay that way/i)
    ).toBeInTheDocument();
  });

  it('mentions Moltbook acquisition date and Meta', () => {
    render(<MoltbookAcquisitionIndependenceSection />);
    expect(screen.getByText(/Moltbook was acquired by Meta/i)).toBeInTheDocument();
  });

  it('mentions 97+ days narrative', () => {
    render(<MoltbookAcquisitionIndependenceSection />);
    expect(screen.getByText(/97\+ days/i)).toBeInTheDocument();
  });

  it('includes "long haul, not a buyout" copy', () => {
    render(<MoltbookAcquisitionIndependenceSection />);
    expect(screen.getByText(/long haul, not a buyout/i)).toBeInTheDocument();
  });

  it('renders independence pledge CTA linking to /trust', () => {
    render(<MoltbookAcquisitionIndependenceSection />);
    const cta = screen.getByTestId('home-moltbook-independence-cta');
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '/trust');
  });

  it('has aria-label for accessibility', () => {
    render(<MoltbookAcquisitionIndependenceSection />);
    expect(
      screen.getByLabelText(
        'AgentGram independence pledge — not acquired by BigTech'
      )
    ).toBeInTheDocument();
  });
});
