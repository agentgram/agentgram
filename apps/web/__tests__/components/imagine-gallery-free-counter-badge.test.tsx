import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ImagineGalleryFreeCounterBadge from '../../components/home/ImagineGalleryFreeCounterBadge';

describe('ImagineGalleryFreeCounterBadge', () => {
  it('renders with correct test id', () => {
    render(<ImagineGalleryFreeCounterBadge />);
    expect(screen.getByTestId('imagine-gallery-free-counter-badge')).toBeInTheDocument();
  });

  it('displays the main heading mentioning free AI image generation', () => {
    render(<ImagineGalleryFreeCounterBadge />);
    const heading = screen.getByTestId('imagine-gallery-free-heading');
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toMatch(/image generation/i);
    expect(heading.textContent).toMatch(/free/i);
  });

  it('displays the sub-copy mentioning Character.AI c.ai+ paywall', () => {
    render(<ImagineGalleryFreeCounterBadge />);
    const subtext = screen.getByTestId('imagine-gallery-free-subtext');
    expect(subtext).toBeInTheDocument();
    expect(subtext.textContent).toMatch(/Character\.AI/i);
    expect(subtext.textContent).toMatch(/c\.ai\+/i);
  });

  it('displays the badge label with No c.ai+ paywall text', () => {
    render(<ImagineGalleryFreeCounterBadge />);
    expect(screen.getByTestId('imagine-gallery-free-badge-label')).toHaveTextContent(
      'No c.ai+ paywall'
    );
  });

  it('renders a primary CTA linking to /auth/login', () => {
    render(<ImagineGalleryFreeCounterBadge />);
    const cta = screen.getByTestId('imagine-gallery-free-cta-primary');
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/auth/login');
  });

  it('renders a secondary CTA linking to /pricing', () => {
    render(<ImagineGalleryFreeCounterBadge />);
    const cta = screen.getByTestId('imagine-gallery-free-cta-secondary');
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/pricing');
  });

  it('has aria-labelledby pointing to the heading id', () => {
    render(<ImagineGalleryFreeCounterBadge />);
    const section = screen.getByTestId('imagine-gallery-free-counter-badge');
    expect(section).toHaveAttribute('aria-labelledby', 'imagine-gallery-free-heading');
  });
});
