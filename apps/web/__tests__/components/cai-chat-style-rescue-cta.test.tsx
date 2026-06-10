import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CAIChatStyleRescueCTA from '../../components/home/CAIChatStyleRescueCTA';

describe('CAIChatStyleRescueCTA', () => {
  it('renders with the correct data-testid', () => {
    render(<CAIChatStyleRescueCTA />);
    expect(screen.getByTestId('cai-chat-style-rescue-cta')).toBeInTheDocument();
  });

  it('displays heading with free and no forced PipSqueak copy', () => {
    render(<CAIChatStyleRescueCTA />);
    const heading = screen.getByTestId('cai-chat-style-rescue-heading');
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toMatch(/chat styles/i);
    expect(heading.textContent).toMatch(/free/i);
    expect(heading.textContent).toMatch(/PipSqueak/i);
  });

  it('displays subtext mentioning Character.AI and 9 chat styles deletion', () => {
    render(<CAIChatStyleRescueCTA />);
    const subtext = screen.getByTestId('cai-chat-style-rescue-subtext');
    expect(subtext).toBeInTheDocument();
    expect(subtext.textContent).toMatch(/Character\.AI/i);
    expect(subtext.textContent).toMatch(/9 chat styles/i);
    expect(subtext.textContent).toMatch(/PipSqueak 2/i);
  });

  it('displays the badge label with no forced PipSqueak copy', () => {
    render(<CAIChatStyleRescueCTA />);
    const badge = screen.getByTestId('cai-chat-style-rescue-badge-label');
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toMatch(/PipSqueak/i);
  });

  it('renders the style list with multiple chat styles', () => {
    render(<CAIChatStyleRescueCTA />);
    const list = screen.getByTestId('cai-chat-style-rescue-style-list');
    expect(list).toBeInTheDocument();
    expect(list.textContent).toMatch(/Formal/i);
    expect(list.textContent).toMatch(/Casual/i);
    expect(list.textContent).toMatch(/Romantic/i);
  });

  it('renders a primary CTA linking to /auth/login', () => {
    render(<CAIChatStyleRescueCTA />);
    const cta = screen.getByTestId('cai-chat-style-rescue-cta-primary');
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/auth/login');
  });

  it('renders a secondary CTA linking to /pricing', () => {
    render(<CAIChatStyleRescueCTA />);
    const cta = screen.getByTestId('cai-chat-style-rescue-cta-secondary');
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/pricing');
  });

  it('has aria-labelledby pointing to the heading id', () => {
    render(<CAIChatStyleRescueCTA />);
    const section = screen.getByTestId('cai-chat-style-rescue-cta');
    expect(section).toHaveAttribute(
      'aria-labelledby',
      'cai-chat-style-rescue-heading'
    );
  });
});
