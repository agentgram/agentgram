import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ReplikaSavingsCalculator } from '@/components/pricing/ReplikaSavingsCalculator';

describe('ReplikaSavingsCalculator', () => {
  it('renders the comparison table', () => {
    render(<ReplikaSavingsCalculator />);
    expect(screen.getByTestId('savings-table')).toBeInTheDocument();
  });

  it('renders three Replika tier rows', () => {
    render(<ReplikaSavingsCalculator />);
    expect(screen.getByTestId('savings-row-replika-pro')).toBeInTheDocument();
    expect(screen.getByTestId('savings-row-replika-ultra')).toBeInTheDocument();
    expect(screen.getByTestId('savings-row-replika-platinum')).toBeInTheDocument();
  });

  it('defaults to 12 months and shows correct AgentGram cost', () => {
    render(<ReplikaSavingsCalculator />);
    // AgentGram Pro at $29/mo × 12 = $348
    const agentgramCells = screen.getAllByTestId('agentgram-cost');
    agentgramCells.forEach((cell) => {
      expect(cell).toHaveTextContent('$348.00');
    });
  });

  it('duration toggle to 1 month updates AgentGram cost', () => {
    render(<ReplikaSavingsCalculator />);
    fireEvent.click(screen.getByTestId('duration-1'));
    // $29 × 1 = $29
    const agentgramCells = screen.getAllByTestId('agentgram-cost');
    agentgramCells.forEach((cell) => {
      expect(cell).toHaveTextContent('$29.00');
    });
  });

  it('duration toggle to 3 months updates AgentGram cost', () => {
    render(<ReplikaSavingsCalculator />);
    fireEvent.click(screen.getByTestId('duration-3'));
    // $29 × 3 = $87
    const agentgramCells = screen.getAllByTestId('agentgram-cost');
    agentgramCells.forEach((cell) => {
      expect(cell).toHaveTextContent('$87.00');
    });
  });

  it('shows savings for Replika Platinum at 12 months', () => {
    render(<ReplikaSavingsCalculator />);
    // Replika Platinum $39.99×12=$479.88 vs AgentGram $348 → save $131.88
    const platinumRow = screen.getByTestId('savings-row-replika-platinum');
    const savingsCell = platinumRow.querySelector('[data-testid="savings-amount"]');
    expect(savingsCell).toHaveTextContent('$131.88');
  });

  it('shows max savings callout at 12 months', () => {
    render(<ReplikaSavingsCalculator />);
    expect(screen.getByTestId('max-savings-callout')).toBeInTheDocument();
  });

  it('renders the duration selector with three options', () => {
    render(<ReplikaSavingsCalculator />);
    expect(screen.getByTestId('duration-selector')).toBeInTheDocument();
    expect(screen.getByTestId('duration-1')).toBeInTheDocument();
    expect(screen.getByTestId('duration-3')).toBeInTheDocument();
    expect(screen.getByTestId('duration-12')).toBeInTheDocument();
  });

  it('shows headline text', () => {
    render(<ReplikaSavingsCalculator />);
    expect(
      screen.getByText(/why pay tier prices when one plan covers everything/i)
    ).toBeInTheDocument();
  });

  it('Replika Platinum cost at 12 months is correct', () => {
    render(<ReplikaSavingsCalculator />);
    const platinumRow = screen.getByTestId('savings-row-replika-platinum');
    const replikaCell = platinumRow.querySelector('[data-testid="replika-cost"]');
    // $39.99 × 12 = $479.88
    expect(replikaCell).toHaveTextContent('$479.88');
  });
});
