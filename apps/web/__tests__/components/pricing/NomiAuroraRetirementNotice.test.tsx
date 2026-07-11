import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NomiAuroraRetirementNotice } from '@/components/pricing/NomiAuroraRetirementNotice';

describe('NomiAuroraRetirementNotice', () => {
  it('renders the Aurora retirement migration notice without crashing', () => {
    render(<NomiAuroraRetirementNotice />);
    expect(screen.getByTestId('nomi-aurora-retirement-notice')).toBeInTheDocument();
  });

  it('frames Aurora retirement as a pre-checkout migration notice', () => {
    render(<NomiAuroraRetirementNotice />);

    expect(screen.getByTestId('nomi-aurora-retirement-eyebrow')).toHaveTextContent(
      'Aurora retirement migration notice'
    );
    expect(screen.getByTestId('nomi-aurora-retirement-heading')).toHaveTextContent(
      'Explain model retirements before users lose trust'
    );
    expect(screen.getByTestId('nomi-aurora-retirement-proof-badge')).toHaveTextContent(
      'Notice first'
    );
  });

  it('shows retirement, memory migration, and crisis-support handoff steps', () => {
    render(<NomiAuroraRetirementNotice />);
    const steps = screen.getByTestId('nomi-aurora-retirement-steps');

    expect(steps.children).toHaveLength(3);
    expect(screen.getByTestId('nomi-aurora-retirement-model-notice')).toHaveTextContent(
      'Model retirement notice'
    );
    expect(screen.getByTestId('nomi-aurora-retirement-model-notice')).toHaveTextContent(
      'retiring Odyssey'
    );
    expect(screen.getByTestId('nomi-aurora-retirement-memory-checklist')).toHaveTextContent(
      'Memory migration checklist'
    );
    expect(screen.getByTestId('nomi-aurora-retirement-crisis-handoff')).toHaveTextContent(
      'Crisis-support handoff'
    );
  });

  it('keeps the user promise visible', () => {
    render(<NomiAuroraRetirementNotice />);
    const promise = screen.getByTestId('nomi-aurora-retirement-user-promise');

    expect(promise).toHaveTextContent('model retirement');
    expect(promise).toHaveTextContent('memory migration');
    expect(promise).toHaveTextContent('crisis-support routing');
    expect(promise).toHaveTextContent('No surprise retirements');
  });
});
