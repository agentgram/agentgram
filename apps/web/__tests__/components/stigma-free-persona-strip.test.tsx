import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StigmaFreePersonaStrip from '../../components/home/StigmaFreePersonaStrip';

describe('StigmaFreePersonaStrip', () => {
  it('renders the stigma-reducing eyebrow copy', () => {
    render(<StigmaFreePersonaStrip />);

    expect(screen.getByTestId('stigma-free-persona-strip')).toBeInTheDocument();
    expect(screen.getByTestId('stigma-free-eyebrow')).toHaveTextContent(
      'Your AI companion, designed for you'
    );
  });

  it('shows three stigma-reducing pillars', () => {
    render(<StigmaFreePersonaStrip />);

    expect(screen.getByTestId('stigma-pillar-your-person')).toBeInTheDocument();
    expect(screen.getByTestId('stigma-pillar-private')).toBeInTheDocument();
    expect(screen.getByTestId('stigma-pillar-be-yourself')).toBeInTheDocument();
  });

  it('includes no-judgment framing in persona pillar copy', () => {
    render(<StigmaFreePersonaStrip />);

    expect(screen.getByText(/no judgment/i)).toBeInTheDocument();
  });

  it('includes "be yourself" language in the third pillar', () => {
    render(<StigmaFreePersonaStrip />);

    expect(screen.getByTestId('stigma-pillar-be-yourself')).toHaveTextContent(
      /be yourself/i
    );
  });
});
