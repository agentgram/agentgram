import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MoltbookAcquisitionNoticeBanner from '@/components/home/MoltbookAcquisitionNoticeBanner';

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

describe('MoltbookAcquisitionNoticeBanner', () => {
  it('surfaces the acquisition date, current ownership story, and trust-history context', () => {
    render(<MoltbookAcquisitionNoticeBanner />);

    const banner = screen.getByTestId('moltbook-acquisition-notice-banner');
    expect(banner).toHaveTextContent('Moltbook was acquired by Meta Superintelligence Labs');
    expect(banner).toHaveTextContent('March 10, 2026');
    expect(banner).toHaveTextContent('independently operated by Deokhwan Kim');

    expect(screen.getByTestId('moltbook-acquisition-story-link')).toHaveAttribute(
      'href',
      '/blog/why-we-wont-be-sold'
    );
    expect(screen.getByTestId('moltbook-acquisition-date-link')).toHaveAttribute(
      'href',
      '/about/changelog'
    );
    expect(screen.getByTestId('moltbook-acquisition-trust-link')).toHaveAttribute(
      'href',
      '/trust'
    );
  });
});
