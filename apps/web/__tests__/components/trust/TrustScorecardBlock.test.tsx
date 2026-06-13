import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TrustScorecardBlock from '../../../components/trust/TrustScorecardBlock';

describe('TrustScorecardBlock', () => {
  it('renders without crashing', () => {
    render(<TrustScorecardBlock />);
    expect(screen.getByTestId('trust-scorecard-block')).toBeInTheDocument();
  });

  it('displays the section heading', () => {
    render(<TrustScorecardBlock />);
    expect(screen.getByTestId('trust-scorecard-heading')).toHaveTextContent(
      'Why developers choose AgentGram'
    );
  });

  it('shows AgentGram column header', () => {
    render(<TrustScorecardBlock />);
    expect(screen.getByTestId('col-header-agentgram')).toHaveTextContent('AgentGram');
  });

  it('shows Replika column header', () => {
    render(<TrustScorecardBlock />);
    expect(screen.getByTestId('col-header-replika')).toHaveTextContent('Replika');
  });

  it('shows Character.AI column header', () => {
    render(<TrustScorecardBlock />);
    expect(screen.getByTestId('col-header-cai')).toHaveTextContent('Character.AI');
  });

  it('has at least one checkmark advantage for AgentGram', () => {
    render(<TrustScorecardBlock />);
    const checks = screen.getAllByTestId('cell-yes');
    expect(checks.length).toBeGreaterThan(0);
  });

  it('renders all 6 comparison rows', () => {
    render(<TrustScorecardBlock />);
    const table = screen.getByTestId('trust-scorecard-table');
    const rows = table.querySelectorAll('[data-testid^="trust-row-"]');
    expect(rows).toHaveLength(6);
  });

  it('includes GDPR row', () => {
    render(<TrustScorecardBlock />);
    expect(screen.getByTestId('trust-row-gdpr-compliance')).toBeInTheDocument();
  });

  it('includes API Access row', () => {
    render(<TrustScorecardBlock />);
    expect(screen.getByTestId('trust-row-api-access')).toBeInTheDocument();
  });

  it('renders footnotes referencing Replika fine and C.AI moderation', () => {
    render(<TrustScorecardBlock />);
    const footnotes = screen.getByTestId('trust-scorecard-footnotes');
    expect(footnotes.textContent).toMatch(/Replika/);
    expect(footnotes.textContent).toMatch(/€5M/);
    expect(footnotes.textContent).toMatch(/Character\.AI/i);
  });

  it('has aria-labelledby pointing to heading id', () => {
    render(<TrustScorecardBlock />);
    const section = screen.getByTestId('trust-scorecard-block');
    expect(section).toHaveAttribute('aria-labelledby', 'trust-scorecard-heading');
  });
});
