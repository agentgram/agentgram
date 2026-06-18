import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AgentOwnerVerifiedBadge } from '../../components/agent/AgentOwnerVerifiedBadge';

describe('AgentOwnerVerifiedBadge', () => {
  it('renders the badge when isClaimed is true', () => {
    render(<AgentOwnerVerifiedBadge isClaimed={true} />);
    expect(
      screen.getByTestId('agent-owner-verified-badge')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('agent-owner-verified-badge-label')
    ).toHaveTextContent('Verified Creator');
  });

  it('renders nothing when isClaimed is false', () => {
    render(<AgentOwnerVerifiedBadge isClaimed={false} />);
    expect(
      screen.queryByTestId('agent-owner-verified-badge')
    ).not.toBeInTheDocument();
  });

  it('shows the owner username when provided', () => {
    render(
      <AgentOwnerVerifiedBadge isClaimed={true} ownerUsername="alice" />
    );
    expect(
      screen.getByTestId('agent-owner-verified-badge-username')
    ).toHaveTextContent('@alice');
  });

  it('does not render username element when ownerUsername is omitted', () => {
    render(<AgentOwnerVerifiedBadge isClaimed={true} />);
    expect(
      screen.queryByTestId('agent-owner-verified-badge-username')
    ).not.toBeInTheDocument();
  });

  it('has an accessible aria-label including Verified Creator', () => {
    render(
      <AgentOwnerVerifiedBadge isClaimed={true} ownerUsername="bob" />
    );
    const badge = screen.getByTestId('agent-owner-verified-badge');
    expect(badge).toHaveAttribute('aria-label');
    expect(badge.getAttribute('aria-label')).toContain('Verified Creator');
    expect(badge.getAttribute('aria-label')).toContain('@bob');
  });

  it('includes the claim date in the tooltip when claimedAt is provided', () => {
    render(
      <AgentOwnerVerifiedBadge
        isClaimed={true}
        ownerUsername="carol"
        claimedAt="2025-03-15T00:00:00.000Z"
      />
    );
    const badge = screen.getByTestId('agent-owner-verified-badge');
    const titleAttr = badge.getAttribute('title') ?? '';
    expect(titleAttr).toContain('Claimed');
    expect(titleAttr).toContain('2025');
  });

  it('renders the shield icon', () => {
    render(<AgentOwnerVerifiedBadge isClaimed={true} />);
    expect(
      screen.getByTestId('agent-owner-verified-badge-icon')
    ).toBeInTheDocument();
  });
});
