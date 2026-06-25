import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  AvatarConsistencyGuaranteeStrip,
  AvatarConsistencyComparisonGallery,
} from '../../components/avatar-consistency-guarantee';

describe('AvatarConsistencyGuaranteeStrip', () => {
  describe('badge variant (default)', () => {
    it('renders the badge with correct data-testid', () => {
      render(<AvatarConsistencyGuaranteeStrip />);
      expect(
        screen.getByTestId('avatar-consistency-guarantee-badge')
      ).toBeInTheDocument();
    });

    it('displays the guarantee label text', () => {
      render(<AvatarConsistencyGuaranteeStrip />);
      expect(
        screen.getByTestId('avatar-consistency-guarantee-badge')
      ).toHaveTextContent('Persona always renders as designed');
    });

    it('carries a descriptive title attribute', () => {
      render(<AvatarConsistencyGuaranteeStrip />);
      const badge = screen.getByTestId('avatar-consistency-guarantee-badge');
      expect(badge).toHaveAttribute(
        'title',
        expect.stringContaining('renders exactly as designed every session')
      );
    });

    it('does not render the strip testid when using badge variant', () => {
      render(<AvatarConsistencyGuaranteeStrip variant="badge" />);
      expect(
        screen.queryByTestId('avatar-consistency-guarantee-strip')
      ).not.toBeInTheDocument();
    });

    it('accepts and applies an optional className prop', () => {
      render(
        <AvatarConsistencyGuaranteeStrip className="my-custom-class" />
      );
      expect(
        screen.getByTestId('avatar-consistency-guarantee-badge')
      ).toHaveClass('my-custom-class');
    });
  });

  describe('strip variant', () => {
    it('renders the strip with correct data-testid', () => {
      render(<AvatarConsistencyGuaranteeStrip variant="strip" />);
      expect(
        screen.getByTestId('avatar-consistency-guarantee-strip')
      ).toBeInTheDocument();
    });

    it('displays the guarantee headline in the strip', () => {
      render(<AvatarConsistencyGuaranteeStrip variant="strip" />);
      expect(
        screen.getByText(/Your persona always looks exactly as designed/i)
      ).toBeInTheDocument();
    });

    it('includes the Nomi App Store complaint context in the strip body', () => {
      render(<AvatarConsistencyGuaranteeStrip variant="strip" />);
      expect(
        screen.getByText(/Nomi.*App Store complaint in 2026/i)
      ).toBeInTheDocument();
    });

    it('has the correct aria-label for accessibility', () => {
      render(<AvatarConsistencyGuaranteeStrip variant="strip" />);
      expect(
        screen.getByLabelText('Avatar visual consistency guarantee')
      ).toBeInTheDocument();
    });

    it('does not render the badge testid in strip mode', () => {
      render(<AvatarConsistencyGuaranteeStrip variant="strip" />);
      expect(
        screen.queryByTestId('avatar-consistency-guarantee-badge')
      ).not.toBeInTheDocument();
    });

    it('accepts and applies an optional className prop to the section', () => {
      render(
        <AvatarConsistencyGuaranteeStrip variant="strip" className="mb-8" />
      );
      expect(
        screen.getByTestId('avatar-consistency-guarantee-strip')
      ).toHaveClass('mb-8');
    });
  });
});

describe('AvatarConsistencyComparisonGallery', () => {
  it('renders with correct data-testid', () => {
    render(<AvatarConsistencyComparisonGallery />);
    expect(
      screen.getByTestId('avatar-consistency-comparison-gallery')
    ).toBeInTheDocument();
  });

  it('has an accessible aria-label', () => {
    render(<AvatarConsistencyComparisonGallery />);
    expect(
      screen.getByLabelText('Avatar rendering consistency comparison gallery')
    ).toBeInTheDocument();
  });

  it('renders example attribute rows (hair, eyes, style)', () => {
    render(<AvatarConsistencyComparisonGallery />);
    expect(screen.getByText('Hair color')).toBeInTheDocument();
    expect(screen.getByText('Eye color')).toBeInTheDocument();
    expect(screen.getByText('Style')).toBeInTheDocument();
  });

  it('renders the caption explaining the no-drift guarantee', () => {
    render(<AvatarConsistencyComparisonGallery />);
    expect(
      screen.getByTestId('avatar-consistency-gallery-caption')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No rendering drift/i)
    ).toBeInTheDocument();
  });

  it('accepts an optional className prop', () => {
    render(<AvatarConsistencyComparisonGallery className="custom-gallery" />);
    expect(
      screen.getByTestId('avatar-consistency-comparison-gallery')
    ).toHaveClass('custom-gallery');
  });
});
