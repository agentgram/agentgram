import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MemoryModeDisclosureCard from '@/components/memory/MemoryModeDisclosureCard';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('MemoryModeDisclosureCard', () => {
  it('renders the root container with correct testid', () => {
    render(<MemoryModeDisclosureCard />);
    expect(screen.getByTestId('memory-mode-disclosure-card')).toBeInTheDocument();
  });

  it('renders the heading', () => {
    render(<MemoryModeDisclosureCard />);
    expect(screen.getByTestId('memory-disclosure-heading')).toHaveTextContent(
      'Retrievable vs Persistent Memory'
    );
  });

  it('renders the eyebrow label', () => {
    render(<MemoryModeDisclosureCard />);
    expect(screen.getByTestId('memory-disclosure-eyebrow')).toHaveTextContent(
      'How memory works'
    );
  });

  it('renders the two-column comparison', () => {
    render(<MemoryModeDisclosureCard />);
    expect(screen.getByTestId('memory-disclosure-comparison')).toBeInTheDocument();
    expect(screen.getByTestId('memory-disclosure-free-column')).toBeInTheDocument();
    expect(screen.getByTestId('memory-disclosure-premium-column')).toBeInTheDocument();
  });

  it('labels free column as Retrievable Memory', () => {
    render(<MemoryModeDisclosureCard />);
    expect(screen.getByTestId('memory-disclosure-free-label')).toHaveTextContent(
      'Retrievable Memory'
    );
  });

  it('labels premium column as Persistent Memory', () => {
    render(<MemoryModeDisclosureCard />);
    expect(screen.getByTestId('memory-disclosure-premium-label')).toHaveTextContent(
      'Persistent Memory'
    );
  });

  it('shows free features in the free column', () => {
    render(<MemoryModeDisclosureCard />);
    const col = screen.getByTestId('memory-disclosure-free-column');
    expect(col).toHaveTextContent('Context from the last 5–10 messages');
    expect(col).toHaveTextContent('Facts may fade after inactivity');
  });

  it('shows premium features in the premium column', () => {
    render(<MemoryModeDisclosureCard />);
    const col = screen.getByTestId('memory-disclosure-premium-column');
    expect(col).toHaveTextContent('Pinned facts — durable across all sessions');
    expect(col).toHaveTextContent('Cross-device and cross-agent continuity');
  });

  it('renders the ultra tier note', () => {
    render(<MemoryModeDisclosureCard />);
    expect(screen.getByTestId('memory-disclosure-ultra-note')).toHaveTextContent(
      'paid Ultra tier'
    );
  });

  it('renders the upgrade CTA linking to /pricing', () => {
    render(<MemoryModeDisclosureCard />);
    const cta = screen.getByTestId('memory-disclosure-upgrade-cta');
    expect(cta).toHaveAttribute('href', '/pricing');
    expect(cta).toHaveTextContent('이어하기+기억 제어');
  });

  it('does not render continue button when onContinue is not provided', () => {
    render(<MemoryModeDisclosureCard />);
    expect(screen.queryByTestId('memory-disclosure-continue-btn')).not.toBeInTheDocument();
  });

  it('renders continue button and fires callback when onContinue is provided', () => {
    const onContinue = vi.fn();
    render(<MemoryModeDisclosureCard onContinue={onContinue} />);
    const btn = screen.getByTestId('memory-disclosure-continue-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it('applies custom className to root', () => {
    render(<MemoryModeDisclosureCard className="custom-test-class" />);
    const root = screen.getByTestId('memory-mode-disclosure-card');
    expect(root.className).toContain('custom-test-class');
  });

  it('has accessible region role with heading', () => {
    render(<MemoryModeDisclosureCard />);
    const region = screen.getByRole('region', { name: 'Retrievable vs Persistent Memory' });
    expect(region).toBeInTheDocument();
  });

  describe('isPremium gate', () => {
    it('hides upgrade CTA when isPremium=true', () => {
      render(<MemoryModeDisclosureCard isPremium />);
      expect(screen.queryByTestId('memory-disclosure-upgrade-cta')).not.toBeInTheDocument();
    });

    it('shows active badge when isPremium=true', () => {
      render(<MemoryModeDisclosureCard isPremium />);
      expect(screen.getByTestId('memory-disclosure-premium-active')).toBeInTheDocument();
      expect(screen.getByTestId('memory-disclosure-premium-active')).toHaveTextContent(
        'Persistent Memory Active'
      );
    });

    it('shows upgrade CTA when isPremium=false (default)', () => {
      render(<MemoryModeDisclosureCard />);
      expect(screen.getByTestId('memory-disclosure-upgrade-cta')).toBeInTheDocument();
    });

    it('does not show active badge when isPremium=false (default)', () => {
      render(<MemoryModeDisclosureCard />);
      expect(screen.queryByTestId('memory-disclosure-premium-active')).not.toBeInTheDocument();
    });

    it('still renders comparison columns and features when isPremium=true', () => {
      render(<MemoryModeDisclosureCard isPremium />);
      expect(screen.getByTestId('memory-disclosure-free-column')).toBeInTheDocument();
      expect(screen.getByTestId('memory-disclosure-premium-column')).toBeInTheDocument();
    });

    it('still renders onContinue button alongside active badge when isPremium=true', () => {
      const onContinue = vi.fn();
      render(<MemoryModeDisclosureCard isPremium onContinue={onContinue} />);
      expect(screen.getByTestId('memory-disclosure-premium-active')).toBeInTheDocument();
      expect(screen.getByTestId('memory-disclosure-continue-btn')).toBeInTheDocument();
    });
  });
});
