import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CrisisOverlay } from '../../components/common/CrisisOverlay';

describe('CrisisOverlay', () => {
  it('renders crisis resources when open', () => {
    render(<CrisisOverlay open={true} onClose={vi.fn()} />);

    expect(screen.getByTestId('crisis-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('crisis-resource-988')).toBeInTheDocument();
    expect(screen.getByTestId('crisis-resource-741741')).toBeInTheDocument();
    expect(
      screen.getByTestId('crisis-resource-findahelpline')
    ).toBeInTheDocument();
  });

  it('shows 988 as the Suicide Prevention Lifeline number', () => {
    render(<CrisisOverlay open={true} onClose={vi.fn()} />);

    const resource = screen.getByTestId('crisis-resource-988');
    expect(resource).toHaveAttribute('href', 'tel:988');
    expect(resource).toHaveTextContent('988');
    expect(resource).toHaveTextContent('National Suicide Prevention Lifeline');
  });

  it('shows 741741 as the Crisis Text Line number', () => {
    render(<CrisisOverlay open={true} onClose={vi.fn()} />);

    const resource = screen.getByTestId('crisis-resource-741741');
    expect(resource).toHaveTextContent('741741');
    expect(resource).toHaveTextContent('HOME');
    expect(resource).toHaveTextContent('Crisis Text Line');
  });

  it('links to findahelpline.com', () => {
    render(<CrisisOverlay open={true} onClose={vi.fn()} />);

    const resource = screen.getByTestId('crisis-resource-findahelpline');
    expect(resource).toHaveAttribute('href', 'https://findahelpline.com');
    expect(resource).toHaveTextContent('findahelpline.com');
  });

  it('calls onClose when the dismiss button is clicked', () => {
    const onClose = vi.fn();
    render(<CrisisOverlay open={true} onClose={onClose} />);

    fireEvent.click(screen.getByTestId('crisis-overlay-dismiss'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not render the overlay when closed', () => {
    render(<CrisisOverlay open={false} onClose={vi.fn()} />);

    expect(screen.queryByTestId('crisis-overlay')).not.toBeInTheDocument();
  });
});
