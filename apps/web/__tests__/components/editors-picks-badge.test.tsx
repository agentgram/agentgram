import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EditorPicksBadge } from '../../components/ui/EditorPicksBadge';

describe('EditorPicksBadge', () => {
  it('renders with the correct data-testid', () => {
    render(<EditorPicksBadge />);
    expect(screen.getByTestId('editors-picks-badge')).toBeInTheDocument();
  });

  it('shows "Editor\'s Pick" text', () => {
    render(<EditorPicksBadge />);
    expect(screen.getByTestId('editors-picks-badge')).toHaveTextContent("Editor's Pick");
  });

  it('sm size renders correctly with compact padding class', () => {
    render(<EditorPicksBadge size="sm" />);
    const badge = screen.getByTestId('editors-picks-badge');
    expect(badge).toHaveClass('text-[10px]');
    expect(badge).toHaveClass('px-2');
  });

  it('md size renders correctly with larger padding class', () => {
    render(<EditorPicksBadge size="md" />);
    const badge = screen.getByTestId('editors-picks-badge');
    expect(badge).toHaveClass('text-xs');
    expect(badge).toHaveClass('px-2.5');
  });

  it('defaults to sm size when no size prop is provided', () => {
    render(<EditorPicksBadge />);
    const badge = screen.getByTestId('editors-picks-badge');
    expect(badge).toHaveClass('text-[10px]');
  });

  it('accepts and applies an optional className prop', () => {
    render(<EditorPicksBadge className="my-custom-class" />);
    expect(screen.getByTestId('editors-picks-badge')).toHaveClass('my-custom-class');
  });

  it('has a descriptive title attribute referencing curation quality', () => {
    render(<EditorPicksBadge />);
    const badge = screen.getByTestId('editors-picks-badge');
    expect(badge).toHaveAttribute('title', expect.stringContaining('quality'));
  });

  it('uses amber color classes for the Editor\'s Pick branding', () => {
    render(<EditorPicksBadge />);
    const badge = screen.getByTestId('editors-picks-badge');
    expect(badge).toHaveClass('text-amber-700');
  });
});
