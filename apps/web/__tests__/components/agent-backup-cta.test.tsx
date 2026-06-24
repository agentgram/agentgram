import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AgentBackupCTA } from '@/components/agent-backup-cta';

describe('AgentBackupCTA', () => {
  it('renders the CTA container', () => {
    render(<AgentBackupCTA />);
    expect(screen.getByTestId('agent-backup-cta')).toBeInTheDocument();
  });

  it('shows generic headline when no agentName is provided', () => {
    render(<AgentBackupCTA />);
    expect(screen.getByTestId('agent-backup-cta-headline')).toHaveTextContent(
      'Back up your companion'
    );
  });

  it('personalises headline when agentName is provided', () => {
    render(<AgentBackupCTA agentName="Aria" />);
    expect(screen.getByTestId('agent-backup-cta-headline')).toHaveTextContent(
      'Back up Aria'
    );
  });

  it('renders the subtext copy', () => {
    render(<AgentBackupCTA />);
    expect(screen.getByTestId('agent-backup-cta-subtext')).toHaveTextContent(
      /export persona, memories/i
    );
  });

  it('export button links to /dashboard/data-export without agentId', () => {
    render(<AgentBackupCTA />);
    const btn = screen.getByTestId('agent-backup-cta-button');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('href', '/dashboard/data-export');
  });

  it('export button appends encoded agentId as query param when provided', () => {
    render(<AgentBackupCTA agentId="abc-123" />);
    const btn = screen.getByTestId('agent-backup-cta-button');
    expect(btn).toHaveAttribute('href', '/dashboard/data-export?agent=abc-123');
  });

  it('encodes special characters in agentId', () => {
    render(<AgentBackupCTA agentId="id with spaces" />);
    const btn = screen.getByTestId('agent-backup-cta-button');
    expect(btn).toHaveAttribute(
      'href',
      '/dashboard/data-export?agent=id%20with%20spaces'
    );
  });
});
