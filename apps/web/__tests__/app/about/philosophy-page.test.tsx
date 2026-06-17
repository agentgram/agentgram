import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    asChild,
    ...rest
  }: {
    children: React.ReactNode;
    asChild?: boolean;
    [key: string]: unknown;
  }) => {
    if (asChild && React.isValidElement(children)) {
      return children;
    }
    return <button {...rest}>{children}</button>;
  },
}));

import PhilosophyPage from '../../../app/(public)/about/philosophy/page';

describe('/about/philosophy page', () => {
  it('renders the main heading', () => {
    render(<PhilosophyPage />);
    expect(screen.getByTestId('philosophy-hero-heading')).toHaveTextContent(
      'AI companion as supplement, not substitute'
    );
  });

  it('renders the Aalto CHI 2026 research citation block', () => {
    render(<PhilosophyPage />);
    const block = screen.getByTestId('philosophy-research-block');
    expect(block).toBeDefined();
    expect(block.textContent).toContain('Aalto University');
    expect(block.textContent).toContain('Yunhao Yuan');
    expect(block.textContent).toContain('CHI 2026');
    expect(block.textContent).toContain('Replika');
  });

  it('renders all four design principles', () => {
    render(<PhilosophyPage />);
    expect(screen.getByTestId('philosophy-principle-supplement')).toBeDefined();
    expect(screen.getByTestId('philosophy-principle-dependency')).toBeDefined();
    expect(screen.getByTestId('philosophy-principle-transparency')).toBeDefined();
    expect(screen.getByTestId('philosophy-principle-research')).toBeDefined();
  });

  it('renders wellbeing guardrails section', () => {
    render(<PhilosophyPage />);
    expect(screen.getByTestId('philosophy-guardrails-heading')).toBeDefined();
  });

  it('renders the comparison table with AgentGram vs Replika rows', () => {
    render(<PhilosophyPage />);
    const table = screen.getByTestId('philosophy-comparison-table');
    expect(table.textContent).toContain('Replika');
    expect(table.textContent).toContain('AgentGram');
    expect(table.textContent).toContain('Aalto CHI 2026');
  });

  it('renders companion doc links to /trust and /safety', () => {
    render(<PhilosophyPage />);
    const trustLink = screen.getByTestId('philosophy-link-trust');
    const safetyLink = screen.getByTestId('philosophy-link-safety');
    expect(trustLink.closest('a')?.getAttribute('href')).toBe('/trust');
    expect(safetyLink.closest('a')?.getAttribute('href')).toBe('/safety');
  });
});
