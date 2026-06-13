import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import NoModelTrainingPledgeStrip from '../../components/home/NoModelTrainingPledgeStrip';

describe('NoModelTrainingPledgeStrip', () => {
  it('renders with correct test id', () => {
    render(<NoModelTrainingPledgeStrip />);
    expect(
      screen.getByTestId('home-no-model-training-pledge-strip')
    ).toBeInTheDocument();
  });

  it('displays no model training headline', () => {
    render(<NoModelTrainingPledgeStrip />);
    expect(
      screen.getByText(/Your chats never train our models — ever/i)
    ).toBeInTheDocument();
  });

  it('mentions Moltbook data-harvesting context', () => {
    render(<NoModelTrainingPledgeStrip />);
    expect(screen.getByText(/Moltbook/i)).toBeInTheDocument();
  });

  it('mentions explicit opt-in requirement', () => {
    render(<NoModelTrainingPledgeStrip />);
    expect(screen.getByText(/explicit opt-in/i)).toBeInTheDocument();
  });

  it('has aria-label for accessibility', () => {
    render(<NoModelTrainingPledgeStrip />);
    expect(
      screen.getByLabelText('No secret model training pledge')
    ).toBeInTheDocument();
  });
});
