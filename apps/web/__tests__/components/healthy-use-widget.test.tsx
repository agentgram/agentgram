import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HealthyUseWidget from '../../components/marketing/HealthyUseWidget';

describe('HealthyUseWidget', () => {
  it('renders the trigger button', () => {
    render(<HealthyUseWidget />);
    expect(screen.getByTestId('healthy-use-trigger')).toBeInTheDocument();
  });

  it('is collapsed by default (questions not visible)', () => {
    render(<HealthyUseWidget />);
    expect(screen.queryByTestId('healthy-use-questions')).not.toBeInTheDocument();
  });

  it('expands when trigger is clicked', () => {
    render(<HealthyUseWidget />);
    fireEvent.click(screen.getByTestId('healthy-use-trigger'));
    expect(screen.getByTestId('healthy-use-questions')).toBeInTheDocument();
  });

  it('renders all 3 questions after expanding', () => {
    render(<HealthyUseWidget />);
    fireEvent.click(screen.getByTestId('healthy-use-trigger'));
    expect(
      screen.getByText(/supplement.*not replace.*human relationships/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/more energized after interactions/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/maintain boundaries and take breaks/i)
    ).toBeInTheDocument();
  });

  it('shows result after all 3 questions are answered', () => {
    render(<HealthyUseWidget />);
    fireEvent.click(screen.getByTestId('healthy-use-trigger'));
    fireEvent.click(screen.getByTestId('q1-yes'));
    fireEvent.click(screen.getByTestId('q2-yes'));
    fireEvent.click(screen.getByTestId('q3-yes'));
    expect(screen.getByTestId('healthy-use-result')).toBeInTheDocument();
  });

  it('shows 3/3 positive result when all answers are yes', () => {
    render(<HealthyUseWidget />);
    fireEvent.click(screen.getByTestId('healthy-use-trigger'));
    fireEvent.click(screen.getByTestId('q1-yes'));
    fireEvent.click(screen.getByTestId('q2-yes'));
    fireEvent.click(screen.getByTestId('q3-yes'));
    expect(
      screen.getByText(/on track for healthy AI companion use/i)
    ).toBeInTheDocument();
  });

  it('shows 2/3 result when two answers are yes', () => {
    render(<HealthyUseWidget />);
    fireEvent.click(screen.getByTestId('healthy-use-trigger'));
    fireEvent.click(screen.getByTestId('q1-yes'));
    fireEvent.click(screen.getByTestId('q2-yes'));
    fireEvent.click(screen.getByTestId('q3-no'));
    expect(
      screen.getByText(/A few things to keep in mind/i)
    ).toBeInTheDocument();
  });

  it('shows 0-1/3 result when fewer than 2 answers are yes', () => {
    render(<HealthyUseWidget />);
    fireEvent.click(screen.getByTestId('healthy-use-trigger'));
    fireEvent.click(screen.getByTestId('q1-no'));
    fireEvent.click(screen.getByTestId('q2-no'));
    fireEvent.click(screen.getByTestId('q3-yes'));
    expect(
      screen.getByText(/recommend reviewing our healthy use guide/i)
    ).toBeInTheDocument();
  });

  it('result includes link to /blog/healthy-companion-use', () => {
    render(<HealthyUseWidget />);
    fireEvent.click(screen.getByTestId('healthy-use-trigger'));
    fireEvent.click(screen.getByTestId('q1-yes'));
    fireEvent.click(screen.getByTestId('q2-yes'));
    fireEvent.click(screen.getByTestId('q3-yes'));
    const link = screen.getByRole('link', { name: /learn more/i });
    expect(link).toHaveAttribute('href', '/blog/healthy-companion-use');
  });

  it('Aalto CHI 2026 citation is visible after expanding', () => {
    render(<HealthyUseWidget />);
    fireEvent.click(screen.getByTestId('healthy-use-trigger'));
    expect(screen.getByTestId('healthy-use-citation')).toBeInTheDocument();
    expect(
      screen.getByText(/Aalto University CHI 2026/i)
    ).toBeInTheDocument();
  });

  it('does not show result before all questions answered', () => {
    render(<HealthyUseWidget />);
    fireEvent.click(screen.getByTestId('healthy-use-trigger'));
    fireEvent.click(screen.getByTestId('q1-yes'));
    fireEvent.click(screen.getByTestId('q2-yes'));
    expect(screen.queryByTestId('healthy-use-result')).not.toBeInTheDocument();
  });
});
