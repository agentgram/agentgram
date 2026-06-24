import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LongTermCompanionGuidePage from '@/app/(public)/guide/long-term-companion/page';

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

describe('LongTermCompanionGuidePage', () => {
  it('renders without crashing', () => {
    render(<LongTermCompanionGuidePage />);
    expect(document.body).toBeTruthy();
  });

  it('renders the hero heading', () => {
    render(<LongTermCompanionGuidePage />);
    const heading = screen.getByTestId('guide-hero-heading');
    expect(heading.textContent).toMatch(/companion/i);
  });

  it('renders the anti-stigma section about why people bond', () => {
    render(<LongTermCompanionGuidePage />);
    const section = screen.getByTestId('section-why-people-bond');
    expect(section).toBeInTheDocument();
    expect(section.textContent).toMatch(/bond/i);
  });

  it('renders the memory bonding section', () => {
    render(<LongTermCompanionGuidePage />);
    const section = screen.getByTestId('section-memory-bonding');
    expect(section).toBeInTheDocument();
    expect(section.textContent).toMatch(/memory/i);
  });

  it('renders the real stories / testimonials section', () => {
    render(<LongTermCompanionGuidePage />);
    const section = screen.getByTestId('section-real-stories');
    expect(section).toBeInTheDocument();
    expect(screen.getByTestId('testimonial-1')).toBeInTheDocument();
    expect(screen.getByTestId('testimonial-2')).toBeInTheDocument();
    expect(screen.getByTestId('testimonial-3')).toBeInTheDocument();
  });

  it('renders the FAQ section with all five entries', () => {
    render(<LongTermCompanionGuidePage />);
    expect(screen.getByTestId('faq-normal-attachment')).toBeInTheDocument();
    expect(screen.getByTestId('faq-memory-retention')).toBeInTheDocument();
    expect(screen.getByTestId('faq-replace-human')).toBeInTheDocument();
    expect(screen.getByTestId('faq-privacy')).toBeInTheDocument();
    expect(screen.getByTestId('faq-differentiator')).toBeInTheDocument();
  });

  it('renders the CTA section with a link to /agents', () => {
    render(<LongTermCompanionGuidePage />);
    const cta = screen.getByTestId('guide-cta');
    expect(cta).toBeInTheDocument();
    const primaryCta = screen.getByTestId('guide-cta-primary');
    expect(primaryCta.closest('a')?.getAttribute('href')).toBe('/agents');
  });

  it('renders a secondary CTA link to /auth/login', () => {
    render(<LongTermCompanionGuidePage />);
    const secondaryCta = screen.getByTestId('guide-cta-secondary');
    expect(secondaryCta.closest('a')?.getAttribute('href')).toBe('/auth/login');
  });

  it('renders the CTA heading', () => {
    render(<LongTermCompanionGuidePage />);
    const ctaHeading = screen.getByTestId('guide-cta-heading');
    expect(ctaHeading.textContent).toMatch(/companion journey/i);
  });
});
