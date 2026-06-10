import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CaiMemoryFreeCounterBadge from '../../components/home/CaiMemoryFreeCounterBadge';

describe('CaiMemoryFreeCounterBadge', () => {
  it('renders with correct test id', () => {
    render(<CaiMemoryFreeCounterBadge />);
    expect(screen.getByTestId('cai-memory-free-counter-badge')).toBeInTheDocument();
  });

  it('displays the main heading mentioning all memory types free', () => {
    render(<CaiMemoryFreeCounterBadge />);
    const heading = screen.getByTestId('cai-memory-free-heading');
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toMatch(/Story Memory/i);
    expect(heading.textContent).toMatch(/Facts/i);
    expect(heading.textContent).toMatch(/Memory Usage/i);
    expect(heading.textContent).toMatch(/free/i);
  });

  it('displays the sub-copy mentioning Character.AI c.ai+ memory paywall', () => {
    render(<CaiMemoryFreeCounterBadge />);
    const subtext = screen.getByTestId('cai-memory-free-subtext');
    expect(subtext).toBeInTheDocument();
    expect(subtext.textContent).toMatch(/Character\.AI/i);
    expect(subtext.textContent).toMatch(/c\.ai\+/i);
  });

  it('displays the badge label with No c.ai+ memory paywall text', () => {
    render(<CaiMemoryFreeCounterBadge />);
    expect(screen.getByTestId('cai-memory-free-badge-label')).toHaveTextContent(
      'No c.ai+ memory paywall'
    );
  });

  it('renders all three memory type chips', () => {
    render(<CaiMemoryFreeCounterBadge />);
    const list = screen.getByTestId('cai-memory-free-type-list');
    expect(list).toBeInTheDocument();
    expect(list.textContent).toMatch(/Story Memory/i);
    expect(list.textContent).toMatch(/Facts/i);
    expect(list.textContent).toMatch(/Memory Usage/i);
  });

  it('renders a primary CTA linking to /auth/login', () => {
    render(<CaiMemoryFreeCounterBadge />);
    const cta = screen.getByTestId('cai-memory-free-cta-primary');
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/auth/login');
  });

  it('renders a secondary CTA linking to /pricing', () => {
    render(<CaiMemoryFreeCounterBadge />);
    const cta = screen.getByTestId('cai-memory-free-cta-secondary');
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/pricing');
  });

  it('has aria-labelledby pointing to the heading id', () => {
    render(<CaiMemoryFreeCounterBadge />);
    const section = screen.getByTestId('cai-memory-free-counter-badge');
    expect(section).toHaveAttribute('aria-labelledby', 'cai-memory-free-heading');
  });
});
