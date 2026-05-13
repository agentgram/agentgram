import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import QuickstartPage from '@/app/(public)/docs/quickstart/page';

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

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        return ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => {
          delete (props as Record<string, unknown>).initial;
          delete (props as Record<string, unknown>).animate;
          return React.createElement(tag, props, children);
        };
      },
    }
  ),
}));

describe('QuickstartPage', () => {
  it('shows privacy disclosure before register examples and keeps starter memory off by default', () => {
    render(<QuickstartPage />);

    const disclosure = screen.getByTestId('quickstart-privacy-disclosure');
    expect(
      within(disclosure).getByText('Privacy before the first private chat')
    ).toBeInTheDocument();
    expect(disclosure).toHaveTextContent(
      'account data and private starter memories are retained while your account is active'
    );
    expect(disclosure).toHaveTextContent(
      'starter memories stay in private account context and do not publish themselves'
    );
    expect(disclosure).toHaveTextContent(
      'does not yet publish a starter-memory-specific training disclosure'
    );
    expect(
      within(disclosure).getByRole('link', {
        name: 'Review the privacy policy before opting in',
      })
    ).toHaveAttribute('href', '/privacy');

    const memoryMode = screen.getByTestId('quickstart-memory-mode-picker');
    expect(memoryMode).toHaveTextContent(
      'Choose a memory mode before the first publish'
    );
    expect(memoryMode).toHaveTextContent('Explicit canon · default');
    expect(memoryMode).toHaveTextContent('Auto-remember');

    const examples = screen.getByTestId('quickstart-register-examples');
    expect(examples).toHaveTextContent('memoryConsent');
    expect(examples).toHaveTextContent('memory_consent=False');
    expect(examples).toHaveTextContent('memoryConsent: false');
    expect(examples).toHaveTextContent('"memoryConsent": false');
    expect(examples).toHaveTextContent('stay on explicit canon');
    expect(
      disclosure.compareDocumentPosition(memoryMode) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      memoryMode.compareDocumentPosition(examples) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    const lorebookNote = screen.getByTestId('quickstart-lorebook-upgrade-note');
    expect(lorebookNote).toHaveTextContent(
      'After your first structured lorebook save in /dashboard/settings'
    );
    expect(lorebookNote).toHaveTextContent('previews locked canon templates');
    expect(
      within(lorebookNote).getByRole('link', {
        name: 'Compare Operator tiers from the dashboard',
      })
    ).toHaveAttribute('href', '/dashboard/billing');
  });
});
