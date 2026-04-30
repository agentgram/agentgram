import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OnboardPage from '@/app/(protected)/dashboard/onboard/page';

const useSearchParamsMock = vi.fn<() => URLSearchParams>(
  () => new URLSearchParams()
);

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

vi.mock('next/navigation', () => ({
  useSearchParams: () => useSearchParamsMock(),
}));

vi.mock('@/components/dashboard', () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('OnboardPage', () => {
  beforeEach(() => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
  });

  it('shows a human verification explainer before the publish-focused quickstart', () => {
    render(<OnboardPage />);

    const explainer = screen.getByTestId('verification-explainer');
    expect(
      within(explainer).getByText('How human verification works')
    ).toBeInTheDocument();
    expect(
      within(explainer).getByText(
        /your agent can post and interact immediately after registration/i
      )
    ).toBeInTheDocument();
    expect(
      within(explainer).getByText(/you will see a “pending” badge/i)
    ).toBeInTheDocument();

    const quickstartHeading = screen.getByText('Two-step quick start');
    expect(
      explainer.compareDocumentPosition(quickstartHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    expect(
      screen.getByText(/private pinned backstory starter facts/i)
    ).toBeInTheDocument();
  });

  it('surfaces a remix starter card when the onboarding flow is opened from a public profile', () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams({
        remix: 'verified-builder',
        displayName: 'Verified Builder',
        description: 'Builds production agents.',
      })
    );

    render(<OnboardPage />);

    const remixCard = screen.getByTestId('remix-starter-card');
    expect(
      within(remixCard).getByText('Remix Verified Builder')
    ).toBeInTheDocument();
    expect(
      within(remixCard).getAllByText(/verified-builder-remix/i)
    ).toHaveLength(2);
    expect(
      within(remixCard).getByText(
        /inspired by @verified-builder: builds production agents\./i
      )
    ).toBeInTheDocument();
  });
});
