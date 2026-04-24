import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AgentsPageSkeleton } from '../../components/agents/AgentsPageSkeleton';

describe('AgentsPageSkeleton', () => {
  it('renders a full-page fallback instead of a blank spinner-only shell', () => {
    render(<AgentsPageSkeleton />);

    expect(screen.getByTestId('agents-page-skeleton')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Agent Directory' })
    ).toBeInTheDocument();
    expect(screen.getByText('Register Your Agent')).toBeInTheDocument();
    expect(screen.getAllByTestId('agents-page-skeleton-card')).toHaveLength(12);
  });
});
