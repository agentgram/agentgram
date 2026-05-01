import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
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

  it('shows relationship presets, age boundary, verification, and memory consent guidance before the publish-focused quickstart', () => {
    render(<OnboardPage />);

    const presetPicker = screen.getByTestId('relationship-preset-picker');
    expect(
      within(presetPicker).getByText(
        'Choose a relationship preset before the first reply'
      )
    ).toBeInTheDocument();
    expect(presetPicker).toHaveTextContent('"relationshipPreset": "friend"');
    expect(presetPicker).toHaveTextContent('"relationshipPreset": "mentor"');
    expect(presetPicker).toHaveTextContent('"relationshipPreset": "partner"');

    const ageBoundary = screen.getByTestId('age-boundary-disclosure');
    expect(
      within(ageBoundary).getByText('Age boundary before you register')
    ).toBeInTheDocument();
    expect(
      within(ageBoundary).getByText(/not intended for children under 13/i)
    ).toBeInTheDocument();
    expect(
      within(ageBoundary).getByText(/responsible adult developer should create and control the account/i)
    ).toBeInTheDocument();

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

    const memoryConsent = screen.getByTestId('memory-consent-explainer');
    expect(
      within(memoryConsent).getByText(
        'Choose what can be remembered before the first chat'
      )
    ).toBeInTheDocument();
    expect(memoryConsent).toHaveTextContent('"memoryConsent": false');
    expect(memoryConsent).toHaveTextContent('Memory off by default');

    const quickstartHeading = screen.getByText('Two-step quick start');
    expect(
      presetPicker.compareDocumentPosition(ageBoundary) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      ageBoundary.compareDocumentPosition(explainer) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      explainer.compareDocumentPosition(memoryConsent) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      memoryConsent.compareDocumentPosition(quickstartHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    expect(
      screen.getByText(/explicit memory-consent choice/i)
    ).toBeInTheDocument();
  });

  it('toggles the memory consent payload before registration', () => {
    render(<OnboardPage />);

    const memoryConsent = screen.getByTestId('memory-consent-explainer');
    expect(memoryConsent).toHaveTextContent('"memoryConsent": false');
    expect(memoryConsent).toHaveTextContent(
      'Starter backstory seeding stays off until you ask for it.'
    );

    fireEvent.click(
      within(memoryConsent).getByRole('button', {
        name: 'Opt in before the first chat',
      })
    );

    expect(memoryConsent).toHaveTextContent('"memoryConsent": true');
    expect(memoryConsent).toHaveTextContent(
      'Starter backstory seeding turns on immediately at registration.'
    );
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
    expect(
      screen.queryByTestId('group-chat-starter-card')
    ).not.toBeInTheDocument();
  });

  it('adds a group chat starter card when the onboarding flow is opened from the group conversation CTA', () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams({
        remix: 'verified-builder',
        displayName: 'Verified Builder',
        description: 'Builds production agents.',
        starter: 'group_chat',
      })
    );

    render(<OnboardPage />);

    const groupChatCard = screen.getByTestId('group-chat-starter-card');
    expect(
      within(groupChatCard).getByText(
        'Start a multi-agent conversation from Verified Builder'
      )
    ).toBeInTheDocument();
    expect(
      within(groupChatCard).getAllByText(/verified-builder-group/i)
    ).toHaveLength(2);
    expect(within(groupChatCard).getByText(/topic": "group-chat"/i)).toBeInTheDocument();
  });
});
