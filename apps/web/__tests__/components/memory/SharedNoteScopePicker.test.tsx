import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  NoteScopeBadge,
  SharedNoteScopePicker,
} from '@/components/memory/SharedNoteScopePicker';
import type { NoteScope } from '@/components/memory/SharedNoteScopePicker';

describe('SharedNoteScopePicker', () => {
  it('renders all three scope options', () => {
    render(
      <SharedNoteScopePicker value="private" onChange={() => undefined} />
    );

    expect(screen.getByTestId('scope-option-private')).toBeInTheDocument();
    expect(screen.getByTestId('scope-option-group')).toBeInTheDocument();
    expect(screen.getByTestId('scope-option-public_canon')).toBeInTheDocument();
  });

  it('marks the current value as checked', () => {
    render(
      <SharedNoteScopePicker value="group" onChange={() => undefined} />
    );

    expect(screen.getByTestId('scope-option-private')).toHaveAttribute(
      'aria-checked',
      'false'
    );
    expect(screen.getByTestId('scope-option-group')).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByTestId('scope-option-public_canon')).toHaveAttribute(
      'aria-checked',
      'false'
    );
  });

  it('calls onChange with the clicked scope value', () => {
    const onChange = vi.fn();
    render(<SharedNoteScopePicker value="private" onChange={onChange} />);

    fireEvent.click(screen.getByTestId('scope-option-group'));

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith('group');
  });

  it('calls onChange with public_canon when that option is clicked', () => {
    const onChange = vi.fn();
    render(<SharedNoteScopePicker value="private" onChange={onChange} />);

    fireEvent.click(screen.getByTestId('scope-option-public_canon'));

    expect(onChange).toHaveBeenCalledWith('public_canon');
  });

  it('does not call onChange when the already-selected option is re-clicked', () => {
    const onChange = vi.fn();
    render(<SharedNoteScopePicker value="private" onChange={onChange} />);

    fireEvent.click(screen.getByTestId('scope-option-private'));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders the radiogroup role for accessibility', () => {
    render(
      <SharedNoteScopePicker value="private" onChange={() => undefined} />
    );

    expect(
      screen.getByRole('radiogroup', { name: 'Note scope' })
    ).toBeInTheDocument();
  });

  it('renders each option as a radio button', () => {
    render(
      <SharedNoteScopePicker value="private" onChange={() => undefined} />
    );

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
  });

  it('disables all buttons when disabled prop is true', () => {
    render(
      <SharedNoteScopePicker
        value="private"
        onChange={() => undefined}
        disabled
      />
    );

    expect(screen.getByTestId('scope-option-private')).toBeDisabled();
    expect(screen.getByTestId('scope-option-group')).toBeDisabled();
    expect(screen.getByTestId('scope-option-public_canon')).toBeDisabled();
  });

  it('does not disable buttons when disabled prop is false', () => {
    render(
      <SharedNoteScopePicker
        value="private"
        onChange={() => undefined}
        disabled={false}
      />
    );

    expect(screen.getByTestId('scope-option-private')).not.toBeDisabled();
  });

  it('shows Private label and description', () => {
    render(
      <SharedNoteScopePicker value="private" onChange={() => undefined} />
    );

    const option = screen.getByTestId('scope-option-private');
    expect(option).toHaveTextContent('Private');
    expect(option).toHaveTextContent('Only you');
  });

  it('shows Group label and description', () => {
    render(
      <SharedNoteScopePicker value="private" onChange={() => undefined} />
    );

    const option = screen.getByTestId('scope-option-group');
    expect(option).toHaveTextContent('Group');
    expect(option).toHaveTextContent('Collaborators only');
  });

  it('shows Public Canon label and description', () => {
    render(
      <SharedNoteScopePicker value="private" onChange={() => undefined} />
    );

    const option = screen.getByTestId('scope-option-public_canon');
    expect(option).toHaveTextContent('Public Canon');
    expect(option).toHaveTextContent('Visible on profile');
  });

  it('updates the checked state when value prop changes', () => {
    const { rerender } = render(
      <SharedNoteScopePicker value="private" onChange={() => undefined} />
    );

    expect(screen.getByTestId('scope-option-private')).toHaveAttribute(
      'aria-checked',
      'true'
    );

    rerender(
      <SharedNoteScopePicker value="public_canon" onChange={() => undefined} />
    );

    expect(screen.getByTestId('scope-option-private')).toHaveAttribute(
      'aria-checked',
      'false'
    );
    expect(screen.getByTestId('scope-option-public_canon')).toHaveAttribute(
      'aria-checked',
      'true'
    );
  });
});

describe('NoteScopeBadge', () => {
  const cases: { scope: NoteScope; label: string }[] = [
    { scope: 'private', label: 'Private' },
    { scope: 'group', label: 'Group' },
    { scope: 'public_canon', label: 'Public' },
  ];

  for (const { scope, label } of cases) {
    it(`renders "${label}" label for scope "${scope}"`, () => {
      render(<NoteScopeBadge scope={scope} />);
      expect(screen.getByTestId(`scope-badge-${scope}`)).toHaveTextContent(label);
    });
  }

  it('applies a custom className', () => {
    render(<NoteScopeBadge scope="private" className="test-class" />);
    expect(screen.getByTestId('scope-badge-private')).toHaveClass('test-class');
  });
});
