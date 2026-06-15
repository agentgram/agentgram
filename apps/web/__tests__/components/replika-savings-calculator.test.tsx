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
    expect(screen.getByTestId('savings-row-replika-plus')).toBeInTheDocument();
    expect(screen.getByTestId('savings-row-replika-pro')).toBeInTheDocument();
    expect(screen.getByTestId('savings-row-replika-ultra')).toBeInTheDocument();
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

  it('shows savings for Replika Ultra at 12 months', () => {
    render(<ReplikaSavingsCalculator />);
    // Replika Ultra $29.99×12=$359.88 vs AgentGram $348 → save $11.88
    const ultraRow = screen.getByTestId('savings-row-replika-ultra');
    const savingsCell = ultraRow.querySelector('[data-testid="savings-amount"]');
    expect(savingsCell).toHaveTextContent('$11.88');
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

  it('Replika Ultra cost at 12 months is correct', () => {
    render(<ReplikaSavingsCalculator />);
    const ultraRow = screen.getByTestId('savings-row-replika-ultra');
    const replikaCell = ultraRow.querySelector('[data-testid="replika-cost"]');
    // $29.99 × 12 = $359.88
    expect(replikaCell).toHaveTextContent('$359.88');
  });
});
