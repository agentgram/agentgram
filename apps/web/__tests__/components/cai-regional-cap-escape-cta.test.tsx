import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CAIRegionalCapEscapeCTA from '../../components/home/CAIRegionalCapEscapeCTA';

describe('CAIRegionalCapEscapeCTA', () => {
  it('renders with the correct data-testid', () => {
    render(<CAIRegionalCapEscapeCTA />);
    expect(screen.getByTestId('cai-regional-cap-escape-cta')).toBeInTheDocument();
  });

  it('displays heading with no message caps and unlimited replies copy', () => {
    render(<CAIRegionalCapEscapeCTA />);
    const heading = screen.getByTestId('cai-regional-cap-escape-heading');
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toMatch(/No message caps/i);
    expect(heading.textContent).toMatch(/unlimited replies/i);
    expect(heading.textContent).toMatch(/all regions/i);
  });

  it('displays subtext mentioning Character.AI 400 messages/day cap and global expansion', () => {
    render(<CAIRegionalCapEscapeCTA />);
    const subtext = screen.getByTestId('cai-regional-cap-escape-subtext');
    expect(subtext).toBeInTheDocument();
    expect(subtext.textContent).toMatch(/Character\.AI/i);
    expect(subtext.textContent).toMatch(/400/i);
    expect(subtext.textContent).toMatch(/globally/i);
  });

  it('displays the badge label with no 400-msg/day cap text', () => {
    render(<CAIRegionalCapEscapeCTA />);
    const badge = screen.getByTestId('cai-regional-cap-escape-badge-label');
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toMatch(/400/i);
    expect(badge.textContent).toMatch(/cap/i);
  });

  it('renders a primary CTA linking to /auth/login', () => {
    render(<CAIRegionalCapEscapeCTA />);
    const cta = screen.getByTestId('cai-regional-cap-escape-cta-primary');
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/auth/login');
  });

  it('renders a secondary CTA linking to /pricing', () => {
    render(<CAIRegionalCapEscapeCTA />);
    const cta = screen.getByTestId('cai-regional-cap-escape-cta-secondary');
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/pricing');
  });

  it('has aria-labelledby pointing to the heading id', () => {
    render(<CAIRegionalCapEscapeCTA />);
    const section = screen.getByTestId('cai-regional-cap-escape-cta');
    expect(section).toHaveAttribute(
      'aria-labelledby',
      'cai-regional-cap-escape-heading'
    );
  });
});
