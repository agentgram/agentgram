import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LorebookFactAutoSuggest } from '@/components/lorebook/LorebookFactAutoSuggest';

const DEFAULT_PROPS = {
  messageCount: 5,
  suggestedFact: 'Elara is the queen of the northern realm',
  onSave: vi.fn(),
  onDismiss: vi.fn(),
};

describe('LorebookFactAutoSuggest — visibility', () => {
  it('renders the chip when messageCount >= 5 and suggestedFact is provided', () => {
    render(<LorebookFactAutoSuggest {...DEFAULT_PROPS} />);
    expect(screen.getByTestId('lorebook-fact-auto-suggest')).toBeInTheDocument();
  });

  it('does not render when messageCount is below 5', () => {
    const { container } = render(
      <LorebookFactAutoSuggest {...DEFAULT_PROPS} messageCount={4} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('does not render when messageCount is 0', () => {
    const { container } = render(
      <LorebookFactAutoSuggest {...DEFAULT_PROPS} messageCount={0} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('does not render when suggestedFact is null', () => {
    const { container } = render(
      <LorebookFactAutoSuggest {...DEFAULT_PROPS} suggestedFact={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders when messageCount is exactly 5', () => {
    render(<LorebookFactAutoSuggest {...DEFAULT_PROPS} messageCount={5} />);
    expect(screen.getByTestId('lorebook-fact-auto-suggest')).toBeInTheDocument();
  });

  it('renders when messageCount is well above 5', () => {
    render(<LorebookFactAutoSuggest {...DEFAULT_PROPS} messageCount={20} />);
    expect(screen.getByTestId('lorebook-fact-auto-suggest')).toBeInTheDocument();
  });
});

describe('LorebookFactAutoSuggest — content', () => {
  it('shows "Save this detail?" prompt text', () => {
    render(<LorebookFactAutoSuggest {...DEFAULT_PROPS} />);
    expect(screen.getByText('Save this detail?')).toBeInTheDocument();
  });

  it('displays the suggested fact excerpt', () => {
    render(<LorebookFactAutoSuggest {...DEFAULT_PROPS} />);
    expect(screen.getByTestId('lorebook-fact-excerpt')).toBeInTheDocument();
    expect(screen.getByTestId('lorebook-fact-excerpt').textContent).toContain(
      'Elara is the queen'
    );
  });

  it('truncates long fact text with ellipsis', () => {
    const longFact = 'A'.repeat(60);
    render(<LorebookFactAutoSuggest {...DEFAULT_PROPS} suggestedFact={longFact} />);
    const excerpt = screen.getByTestId('lorebook-fact-excerpt').textContent ?? '';
    expect(excerpt).toContain('…');
    expect(excerpt.length).toBeLessThan(longFact.length + 5);
  });

  it('does not truncate short facts', () => {
    const shortFact = 'Elara';
    render(<LorebookFactAutoSuggest {...DEFAULT_PROPS} suggestedFact={shortFact} />);
    expect(screen.getByTestId('lorebook-fact-excerpt').textContent).toBe(shortFact);
  });
});

describe('LorebookFactAutoSuggest — interactions', () => {
  it('calls onSave when the save button is clicked', () => {
    const onSave = vi.fn();
    render(<LorebookFactAutoSuggest {...DEFAULT_PROPS} onSave={onSave} />);
    fireEvent.click(screen.getByTestId('lorebook-fact-save'));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when the dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<LorebookFactAutoSuggest {...DEFAULT_PROPS} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByTestId('lorebook-fact-dismiss'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not call onSave when dismiss is clicked', () => {
    const onSave = vi.fn();
    render(<LorebookFactAutoSuggest {...DEFAULT_PROPS} onSave={onSave} />);
    fireEvent.click(screen.getByTestId('lorebook-fact-dismiss'));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('does not call onDismiss when save is clicked', () => {
    const onDismiss = vi.fn();
    render(<LorebookFactAutoSuggest {...DEFAULT_PROPS} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByTestId('lorebook-fact-save'));
    expect(onDismiss).not.toHaveBeenCalled();
  });
});

describe('LorebookFactAutoSuggest — accessibility', () => {
  it('has an aria-live="polite" region for screen readers', () => {
    render(<LorebookFactAutoSuggest {...DEFAULT_PROPS} />);
    const chip = screen.getByTestId('lorebook-fact-auto-suggest');
    expect(chip).toHaveAttribute('aria-live', 'polite');
  });

  it('save button has an accessible label including the fact', () => {
    render(<LorebookFactAutoSuggest {...DEFAULT_PROPS} />);
    const saveBtn = screen.getByTestId('lorebook-fact-save');
    expect(saveBtn).toHaveAttribute('aria-label');
    expect(saveBtn.getAttribute('aria-label')).toContain(DEFAULT_PROPS.suggestedFact);
  });

  it('dismiss button has an accessible label', () => {
    render(<LorebookFactAutoSuggest {...DEFAULT_PROPS} />);
    const dismissBtn = screen.getByTestId('lorebook-fact-dismiss');
    expect(dismissBtn).toHaveAttribute('aria-label', 'Dismiss lorebook suggestion');
  });
});
