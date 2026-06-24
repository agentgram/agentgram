import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CAILorebookEscapeCTA from '../../components/home/CAILorebookEscapeCTA';

describe('CAILorebookEscapeCTA', () => {
  it('renders with correct test id', () => {
    render(<CAILorebookEscapeCTA />);
    expect(screen.getByTestId('cai-lorebook-escape-cta')).toBeInTheDocument();
  });

  it('displays the main heading mentioning free Lorebook and worldbuilder', () => {
    render(<CAILorebookEscapeCTA />);
    const heading = screen.getByTestId('cai-lorebook-escape-heading');
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toMatch(/Lorebook/i);
    expect(heading.textContent).toMatch(/worldbuilder/i);
    expect(heading.textContent).toMatch(/free/i);
  });

  it('displays the sub-copy mentioning Character.AI c.ai+ paywall', () => {
    render(<CAILorebookEscapeCTA />);
    const subtext = screen.getByTestId('cai-lorebook-escape-subtext');
    expect(subtext).toBeInTheDocument();
    expect(subtext.textContent).toMatch(/Character\.AI/i);
    expect(subtext.textContent).toMatch(/c\.ai\+/i);
  });

  it('displays the badge label with No c.ai+ paywall text', () => {
    render(<CAILorebookEscapeCTA />);
    expect(screen.getByTestId('cai-lorebook-escape-badge-label')).toHaveTextContent(
      'No c.ai+ paywall'
    );
  });

  it('renders a primary CTA linking to /auth/login', () => {
    render(<CAILorebookEscapeCTA />);
    const cta = screen.getByTestId('cai-lorebook-escape-cta-primary');
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/auth/login');
  });

  it('renders a secondary CTA linking to /pricing', () => {
    render(<CAILorebookEscapeCTA />);
    const cta = screen.getByTestId('cai-lorebook-escape-cta-secondary');
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/pricing');
  });

  it('has aria-labelledby pointing to the heading id', () => {
    render(<CAILorebookEscapeCTA />);
    const section = screen.getByTestId('cai-lorebook-escape-cta');
    expect(section).toHaveAttribute('aria-labelledby', 'cai-lorebook-escape-heading');
  });
});
