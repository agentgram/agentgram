import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MoltbookProvenanceTooltip } from '@/components/trust/MoltbookProvenanceTooltip';

describe('MoltbookProvenanceTooltip', () => {
  const defaultProps = {
    verifiedCount: 1247,
    lastSyncedAt: '2026-06-25 02:00 UTC',
  };

  it('renders the trigger button', () => {
    render(<MoltbookProvenanceTooltip {...defaultProps} />);
    expect(screen.getByTestId('moltbook-provenance-trigger')).toBeInTheDocument();
  });

  it('displays the formatted verified count in the trigger', () => {
    render(<MoltbookProvenanceTooltip {...defaultProps} />);
    expect(screen.getByTestId('moltbook-provenance-trigger').textContent).toMatch(
      /1,247 verified/
    );
  });

  it('popover is hidden before trigger click', () => {
    render(<MoltbookProvenanceTooltip {...defaultProps} />);
    expect(screen.queryByTestId('moltbook-provenance-popover')).not.toBeInTheDocument();
  });

  it('opens popover on trigger click', () => {
    render(<MoltbookProvenanceTooltip {...defaultProps} />);
    fireEvent.click(screen.getByTestId('moltbook-provenance-trigger'));
    expect(screen.getByTestId('moltbook-provenance-popover')).toBeInTheDocument();
  });

  it('closes popover on second trigger click', () => {
    render(<MoltbookProvenanceTooltip {...defaultProps} />);
    fireEvent.click(screen.getByTestId('moltbook-provenance-trigger'));
    fireEvent.click(screen.getByTestId('moltbook-provenance-trigger'));
    expect(screen.queryByTestId('moltbook-provenance-popover')).not.toBeInTheDocument();
  });

  it('shows human-verified definition in popover', () => {
    render(<MoltbookProvenanceTooltip {...defaultProps} />);
    fireEvent.click(screen.getByTestId('moltbook-provenance-trigger'));
    expect(screen.getByTestId('provenance-definition')).toBeInTheDocument();
    expect(screen.getByTestId('provenance-definition').textContent).toMatch(
      /human-verified/i
    );
  });

  it('shows last sync time in popover', () => {
    render(<MoltbookProvenanceTooltip {...defaultProps} />);
    fireEvent.click(screen.getByTestId('moltbook-provenance-trigger'));
    expect(screen.getByTestId('provenance-sync-info').textContent).toMatch(
      /2026-06-25 02:00 UTC/
    );
  });

  it('shows count variance explanation in popover', () => {
    render(<MoltbookProvenanceTooltip {...defaultProps} />);
    fireEvent.click(screen.getByTestId('moltbook-provenance-trigger'));
    expect(screen.getByTestId('provenance-variance-explanation')).toBeInTheDocument();
    expect(
      screen.getByTestId('provenance-variance-explanation').textContent
    ).toMatch(/count change/i);
  });

  it('trigger has correct aria-expanded when open', () => {
    render(<MoltbookProvenanceTooltip {...defaultProps} />);
    const trigger = screen.getByTestId('moltbook-provenance-trigger');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('accepts and renders different verifiedCount values', () => {
    render(
      <MoltbookProvenanceTooltip verifiedCount={500} lastSyncedAt="2026-01-01 00:00 UTC" />
    );
    expect(screen.getByTestId('moltbook-provenance-trigger').textContent).toMatch(/500 verified/);
  });
});
