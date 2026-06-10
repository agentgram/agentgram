import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import NoChatIsolationBadge from '../../components/home/NoChatIsolationBadge';

describe('NoChatIsolationBadge', () => {
  it('renders with correct test id', () => {
    render(<NoChatIsolationBadge />);
    expect(screen.getByTestId('no-chat-isolation-badge')).toBeInTheDocument();
  });

  it('displays the main heading', () => {
    render(<NoChatIsolationBadge />);
    expect(screen.getByTestId('no-chat-isolation-heading')).toHaveTextContent(
      'Chat freely — no forced Stories mode restrictions'
    );
  });

  it('displays the sub-copy mentioning Character.AI', () => {
    render(<NoChatIsolationBadge />);
    expect(screen.getByTestId('no-chat-isolation-subtext')).toHaveTextContent(
      /Unlike Character\.AI/i
    );
  });

  it('displays the badge label with No forced Stories mode text', () => {
    render(<NoChatIsolationBadge />);
    expect(screen.getByTestId('no-chat-isolation-badge-label')).toHaveTextContent(
      'No forced Stories mode'
    );
  });

  it('renders a primary CTA linking to /auth/login', () => {
    render(<NoChatIsolationBadge />);
    const cta = screen.getByTestId('no-chat-isolation-cta-primary');
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/auth/login');
  });

  it('renders a secondary CTA linking to /pricing', () => {
    render(<NoChatIsolationBadge />);
    const cta = screen.getByTestId('no-chat-isolation-cta-secondary');
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/pricing');
  });

  it('has aria-labelledby pointing to the heading id', () => {
    render(<NoChatIsolationBadge />);
    const section = screen.getByTestId('no-chat-isolation-badge');
    expect(section).toHaveAttribute('aria-labelledby', 'no-chat-isolation-heading');
  });
});
