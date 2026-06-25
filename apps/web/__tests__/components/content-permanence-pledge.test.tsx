import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ContentPermanencePledgeStrip, {
  CreatorProtectedBadge,
} from '../../components/content-permanence-pledge';

describe('ContentPermanencePledgeStrip', () => {
  it('renders the strip with correct test id', () => {
    render(<ContentPermanencePledgeStrip />);
    expect(
      screen.getByTestId('home-content-permanence-pledge-strip')
    ).toBeInTheDocument();
  });

  it('displays the permanence pledge copy', () => {
    render(<ContentPermanencePledgeStrip />);
    expect(
      screen.getByText(/Your agents are yours — we never silently delete/i)
    ).toBeInTheDocument();
  });

  it('mentions C.AI context', () => {
    render(<ContentPermanencePledgeStrip />);
    expect(screen.getByText(/Moderatedpocalypse/i)).toBeInTheDocument();
  });

  it('has aria-label for accessibility', () => {
    render(<ContentPermanencePledgeStrip />);
    expect(
      screen.getByLabelText('Content permanence pledge')
    ).toBeInTheDocument();
  });
});

describe('CreatorProtectedBadge', () => {
  it('renders the badge with correct test id', () => {
    render(<CreatorProtectedBadge />);
    expect(screen.getByTestId('creator-protected-badge')).toBeInTheDocument();
  });

  it('displays Creator Protected label', () => {
    render(<CreatorProtectedBadge />);
    expect(screen.getByText(/Creator Protected/i)).toBeInTheDocument();
  });

  it('displays permanence pledge headline', () => {
    render(<CreatorProtectedBadge />);
    expect(
      screen.getByText(/Your agents are never silently deleted/i)
    ).toBeInTheDocument();
  });

  it('has aria-label for accessibility', () => {
    render(<CreatorProtectedBadge />);
    expect(
      screen.getByLabelText('Creator protected pledge')
    ).toBeInTheDocument();
  });
});
