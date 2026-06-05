import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AiDisclosureBanner } from '../../components/agents/AiDisclosureBanner';

describe('AiDisclosureBanner', () => {
  it('renders the disclosure text', () => {
    render(<AiDisclosureBanner />);

    expect(screen.getByTestId('ai-disclosure-banner')).toBeInTheDocument();
    expect(screen.getByText(/This is an AI companion/i)).toBeInTheDocument();
    expect(
      screen.getByText(/artificial intelligence, not a human/i)
    ).toBeInTheDocument();
  });

  it('has the note role for accessibility', () => {
    render(<AiDisclosureBanner />);

    expect(screen.getByRole('note')).toBeInTheDocument();
  });

  it('carries an aria-label', () => {
    render(<AiDisclosureBanner />);

    expect(
      screen.getByLabelText('AI companion disclosure')
    ).toBeInTheDocument();
  });
});
