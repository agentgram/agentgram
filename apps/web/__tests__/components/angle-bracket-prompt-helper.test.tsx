import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AngleBracketPromptHelper } from '../../components/image-gen/AngleBracketPromptHelper';

describe('AngleBracketPromptHelper', () => {
  it('renders the toggle button with correct testid', () => {
    render(<AngleBracketPromptHelper />);
    expect(screen.getByTestId('angle-bracket-prompt-helper-toggle')).toBeInTheDocument();
  });

  it('is collapsed by default and panel is not visible', () => {
    render(<AngleBracketPromptHelper />);
    expect(screen.queryByTestId('angle-bracket-prompt-helper-panel')).not.toBeInTheDocument();
  });

  it('opens the panel when the toggle is clicked', () => {
    render(<AngleBracketPromptHelper />);
    fireEvent.click(screen.getByTestId('angle-bracket-prompt-helper-toggle'));
    expect(screen.getByTestId('angle-bracket-prompt-helper-panel')).toBeInTheDocument();
  });

  it('closes the panel on second toggle click', () => {
    render(<AngleBracketPromptHelper />);
    fireEvent.click(screen.getByTestId('angle-bracket-prompt-helper-toggle'));
    expect(screen.getByTestId('angle-bracket-prompt-helper-panel')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('angle-bracket-prompt-helper-toggle'));
    expect(screen.queryByTestId('angle-bracket-prompt-helper-panel')).not.toBeInTheDocument();
  });

  it('renders defaultOpen=true with panel visible immediately', () => {
    render(<AngleBracketPromptHelper defaultOpen />);
    expect(screen.getByTestId('angle-bracket-prompt-helper-panel')).toBeInTheDocument();
  });

  it('renders all five tag categories when open', () => {
    render(<AngleBracketPromptHelper defaultOpen />);
    for (const cat of ['hair', 'eyes', 'outfit', 'background', 'expression']) {
      expect(screen.getByTestId(`angle-bracket-category-${cat}`)).toBeInTheDocument();
    }
  });

  it('renders expected anchor tag chips', () => {
    render(<AngleBracketPromptHelper defaultOpen />);
    expect(screen.getByTestId('angle-bracket-chip-hair-wavy')).toBeInTheDocument();
    expect(screen.getByTestId('angle-bracket-chip-eyes-green')).toBeInTheDocument();
    expect(screen.getByTestId('angle-bracket-chip-outfit-casual')).toBeInTheDocument();
    expect(screen.getByTestId('angle-bracket-chip-bg-indoor')).toBeInTheDocument();
    expect(screen.getByTestId('angle-bracket-chip-expr-smiling')).toBeInTheDocument();
  });

  it('chip displays the angle-bracket tag text', () => {
    render(<AngleBracketPromptHelper defaultOpen />);
    expect(screen.getByTestId('angle-bracket-chip-hair-wavy')).toHaveTextContent('<hair:wavy>');
    expect(screen.getByTestId('angle-bracket-chip-eyes-green')).toHaveTextContent('<eyes:green>');
  });

  it('calls onInsert with the correct tag string when a chip is clicked', () => {
    const onInsert = vi.fn();
    render(<AngleBracketPromptHelper defaultOpen onInsert={onInsert} />);
    fireEvent.click(screen.getByTestId('angle-bracket-chip-hair-wavy'));
    expect(onInsert).toHaveBeenCalledWith('<hair:wavy>');
  });

  it('calls onInsert with hair:straight tag', () => {
    const onInsert = vi.fn();
    render(<AngleBracketPromptHelper defaultOpen onInsert={onInsert} />);
    fireEvent.click(screen.getByTestId('angle-bracket-chip-hair-straight'));
    expect(onInsert).toHaveBeenCalledWith('<hair:straight>');
  });

  it('calls onInsert with expression tag', () => {
    const onInsert = vi.fn();
    render(<AngleBracketPromptHelper defaultOpen onInsert={onInsert} />);
    fireEvent.click(screen.getByTestId('angle-bracket-chip-expr-playful'));
    expect(onInsert).toHaveBeenCalledWith('<expression:playful>');
  });

  it('shows insert hint text when onInsert is provided', () => {
    render(<AngleBracketPromptHelper defaultOpen onInsert={vi.fn()} />);
    expect(screen.getByTestId('angle-bracket-prompt-helper-panel')).toHaveTextContent(
      'Tap a tag to insert it into your prompt.'
    );
  });

  it('shows copy hint text when onInsert is not provided', () => {
    render(<AngleBracketPromptHelper defaultOpen />);
    expect(screen.getByTestId('angle-bracket-prompt-helper-panel')).toHaveTextContent(
      'Tap a tag to copy it'
    );
  });

  it('toggle button has aria-expanded=false when closed', () => {
    render(<AngleBracketPromptHelper />);
    expect(screen.getByTestId('angle-bracket-prompt-helper-toggle')).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('toggle button has aria-expanded=true when open', () => {
    render(<AngleBracketPromptHelper defaultOpen />);
    expect(screen.getByTestId('angle-bracket-prompt-helper-toggle')).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });
});
