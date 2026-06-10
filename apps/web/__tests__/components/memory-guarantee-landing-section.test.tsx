import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryGuaranteeLandingSection } from '@/components/memory-guarantee-landing-section';

describe('MemoryGuaranteeLandingSection', () => {
  it('renders the section with correct test id', () => {
    render(<MemoryGuaranteeLandingSection />);
    expect(
      screen.getByTestId('memory-guarantee-landing-section')
    ).toBeInTheDocument();
  });

  it('has aria-labelledby for accessibility', () => {
    render(<MemoryGuaranteeLandingSection />);
    const section = screen.getByTestId('memory-guarantee-landing-section');
    expect(section).toHaveAttribute('aria-labelledby', 'memory-guarantee-heading');
  });

  it('renders the main heading', () => {
    render(<MemoryGuaranteeLandingSection />);
    expect(screen.getByTestId('memory-guarantee-heading')).toHaveTextContent(
      /Your memories. Your agents. Forever./i
    );
  });

  it('renders the trio grid container', () => {
    render(<MemoryGuaranteeLandingSection />);
    expect(screen.getByTestId('memory-guarantee-trio')).toBeInTheDocument();
  });

  it('renders the memory stability card', () => {
    render(<MemoryGuaranteeLandingSection />);
    expect(
      screen.getByTestId('memory-guarantee-card-stability')
    ).toBeInTheDocument();
  });

  it('renders the character backup card', () => {
    render(<MemoryGuaranteeLandingSection />);
    expect(
      screen.getByTestId('memory-guarantee-card-backup')
    ).toBeInTheDocument();
  });

  it('renders the CreatorProtectedBadge', () => {
    render(<MemoryGuaranteeLandingSection />);
    expect(screen.getByTestId('creator-protected-badge')).toBeInTheDocument();
  });

  it('renders the MemoryStabilityPledge badge inside the stability card', () => {
    render(<MemoryGuaranteeLandingSection />);
    expect(
      screen.getByTestId('memory-stability-pledge-badge')
    ).toBeInTheDocument();
  });

  it('renders the AgentBackupCTA inside the backup card', () => {
    render(<MemoryGuaranteeLandingSection />);
    expect(screen.getByTestId('agent-backup-cta')).toBeInTheDocument();
  });

  it('renders the upgrade CTA section', () => {
    render(<MemoryGuaranteeLandingSection />);
    expect(screen.getByTestId('memory-guarantee-cta')).toBeInTheDocument();
  });

  it('upgrade CTA button links to /pricing', () => {
    render(<MemoryGuaranteeLandingSection />);
    const upgradeLink = screen.getByRole('link', {
      name: /upgrade for guaranteed memory/i,
    });
    expect(upgradeLink).toHaveAttribute('href', '/pricing');
  });

  it('export button links to /dashboard/data-export', () => {
    render(<MemoryGuaranteeLandingSection />);
    const exportLink = screen.getByRole('link', {
      name: /export companion now/i,
    });
    expect(exportLink).toHaveAttribute('href', '/dashboard/data-export');
  });

  it('pricing link in footer text links to /pricing', () => {
    render(<MemoryGuaranteeLandingSection />);
    expect(
      screen.getByTestId('memory-guarantee-pricing-link')
    ).toHaveAttribute('href', '/pricing');
  });

  it('mentions Replika 2.0 amnesia wave in competitive context', () => {
    render(<MemoryGuaranteeLandingSection />);
    expect(screen.getAllByText(/Replika 2\.0/i).length).toBeGreaterThan(0);
  });

  it('mentions C.AI Moderatedpocalypse in competitive context', () => {
    render(<MemoryGuaranteeLandingSection />);
    expect(screen.getByText(/C\.AI/i)).toBeInTheDocument();
  });
});
