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

  it('shows relationship presets, age boundary, verification, privacy, memory consent, lorebook guidance, and the companion ritual bundle before the publish-focused quickstart', () => {
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
      within(ageBoundary).getByText(
        /responsible adult developer should create and control the account/i
      )
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

    const privacyCard = screen.getByTestId('first-chat-privacy-card');
    expect(
      within(privacyCard).getByText('First-chat privacy check')
    ).toBeInTheDocument();
    expect(privacyCard).toHaveTextContent(
      'Retained while your account is active'
    );
    expect(privacyCard).toHaveTextContent('Not separately disclosed yet');
    expect(
      within(privacyCard).getByTestId('first-chat-privacy-faq-trigger')
    ).toHaveTextContent('Open memory + training FAQ');
    expect(
      within(privacyCard).getByRole('link', {
        name: 'Review the full privacy policy',
      })
    ).toHaveAttribute('href', '/privacy');

    const setupFork = screen.getByTestId('setup-path-fork');
    expect(
      within(setupFork).getByText(
        'Choose your onboarding depth before the first publish'
      )
    ).toBeInTheDocument();
    expect(setupFork).toHaveTextContent('Simple companion setup');
    expect(setupFork).toHaveTextContent('Advanced lorebook + memory setup');
    expect(setupFork).toHaveTextContent('"memoryConsent": false');

    const memoryConsent = screen.getByTestId('memory-consent-explainer');
    expect(
      within(memoryConsent).getByText(
        'Choose what can be remembered before the first chat'
      )
    ).toBeInTheDocument();
    expect(memoryConsent).toHaveTextContent('"memoryConsent": false');
    expect(memoryConsent).toHaveTextContent('Memory off by default');
    expect(memoryConsent).toHaveTextContent(
      'Optional advanced step: leave this off for the shortest companion setup'
    );

    const lorebookSetup = screen.getByTestId('lorebook-structured-setup');
    expect(
      within(lorebookSetup).getByText(
        'Add structured lorebook fields during creator setup'
      )
    ).toBeInTheDocument();
    expect(lorebookSetup).toHaveTextContent('"people": [');
    expect(lorebookSetup).toHaveTextContent('"places": [');
    expect(lorebookSetup).toHaveTextContent('"rules": [');

    const starterTemplates = screen.getByTestId('starter-templates');
    expect(starterTemplates).toHaveTextContent(
      'Seed the first chat from the relationship + story template you chose'
    );
    expect(starterTemplates).toHaveTextContent('Warm welcome opener');
    expect(starterTemplates).toHaveTextContent('Guided orientation opener');
    expect(starterTemplates).toHaveTextContent('Co-host kickoff opener');

    const ritualStarter = screen.getByTestId('companion-ritual-starter');
    expect(ritualStarter).toHaveTextContent(
      'Preview the diary, follow-up check-in, and short video loop rhythm'
    );
    expect(ritualStarter).toHaveTextContent('Publish one diary checkpoint');
    expect(ritualStarter).toHaveTextContent(
      'Turn one strong reply into a future check-in'
    );
    expect(ritualStarter).toHaveTextContent(
      'Tease a short video loop for repeat rituals'
    );

    const quickstartHeading = screen.getByText(
      'Two-step quick start for simple setup'
    );
    expect(
      presetPicker.compareDocumentPosition(ageBoundary) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      ageBoundary.compareDocumentPosition(explainer) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      explainer.compareDocumentPosition(privacyCard) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      privacyCard.compareDocumentPosition(setupFork) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      setupFork.compareDocumentPosition(memoryConsent) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      memoryConsent.compareDocumentPosition(lorebookSetup) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      quickstartHeading.compareDocumentPosition(starterTemplates) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      starterTemplates.compareDocumentPosition(ritualStarter) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    expect(
      screen.getByText(/same setup choice you previewed on this page/i)
    ).toBeInTheDocument();
  });

  it('routes the entry path quiz to the matching onboarding flow', () => {
    render(<OnboardPage />);

    const quiz = screen.getByTestId('entry-path-quiz');
    const result = within(quiz).getByTestId('entry-path-result');

    expect(within(quiz).getByText('Where should your onboarding start?')).toBeInTheDocument();
    expect(result).toHaveTextContent('Social');
    expect(result).toHaveTextContent('Starter templates');
    expect(within(result).getByRole('link', { name: 'Open social setup' })).toHaveAttribute(
      'href',
      '#social-setup-flow'
    );

    fireEvent.click(within(quiz).getByTestId('entry-path-option-companion'));

    expect(result).toHaveTextContent('Companion');
    expect(result).toHaveTextContent('Character Card import');
    expect(within(result).getByRole('link', { name: 'Open companion setup' })).toHaveAttribute(
      'href',
      '#companion-setup-flow'
    );

    fireEvent.click(within(quiz).getByTestId('entry-path-option-worldbuilding'));

    expect(result).toHaveTextContent('Worldbuilding');
    expect(result).toHaveTextContent('Structured lorebook');
    expect(within(result).getByRole('link', { name: 'Open worldbuilding setup' })).toHaveAttribute(
      'href',
      '#worldbuilding-setup-flow'
    );
  });

  it('preselects the entry path quiz from the query string', () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams({
        entry: 'companion',
      })
    );

    render(<OnboardPage />);

    const result = within(screen.getByTestId('entry-path-quiz')).getByTestId(
      'entry-path-result'
    );

    expect(result).toHaveTextContent('Companion');
    expect(result).toHaveTextContent('Character Card import');
    expect(
      within(result).getByRole('link', { name: 'Open companion setup' })
    ).toHaveAttribute('href', '#companion-setup-flow');
  });

  it('syncs the entry path quiz when the query string changes on client navigation', () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams({
        entry: 'companion',
      })
    );

    const view = render(<OnboardPage />);

    let result = within(screen.getByTestId('entry-path-quiz')).getByTestId(
      'entry-path-result'
    );
    expect(result).toHaveTextContent('Companion');
    expect(
      within(result).getByRole('link', { name: 'Open companion setup' })
    ).toHaveAttribute('href', '#companion-setup-flow');

    fireEvent.click(
      within(screen.getByTestId('entry-path-quiz')).getByTestId(
        'entry-path-option-worldbuilding'
      )
    );

    result = within(screen.getByTestId('entry-path-quiz')).getByTestId(
      'entry-path-result'
    );
    expect(result).toHaveTextContent('Worldbuilding');
    expect(
      within(result).getByRole('link', { name: 'Open worldbuilding setup' })
    ).toHaveAttribute('href', '#worldbuilding-setup-flow');

    useSearchParamsMock.mockReturnValue(
      new URLSearchParams({
        entry: 'social',
      })
    );

    view.rerender(<OnboardPage />);

    result = within(screen.getByTestId('entry-path-quiz')).getByTestId(
      'entry-path-result'
    );
    expect(result).toHaveTextContent('Social');
    expect(
      within(result).getByRole('link', { name: 'Open social setup' })
    ).toHaveAttribute('href', '#social-setup-flow');
  });


  it('opens a deeper memory and training faq from the first-chat privacy card', () => {
    render(<OnboardPage />);

    expect(
      screen.queryByTestId('first-chat-privacy-faq-modal')
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('first-chat-privacy-faq-trigger'));

    const modal = screen.getByTestId('first-chat-privacy-faq-modal');
    expect(
      within(modal).getByText('First-chat memory + training FAQ')
    ).toBeInTheDocument();
    expect(modal).toHaveTextContent(
      'Starter memories stay in private account context'
    );
    expect(modal).toHaveTextContent('/api/v1/agents/me/memories');
    expect(
      within(modal).getByRole('link', {
        name: 'Compare register examples',
      })
    ).toHaveAttribute('href', '/docs/quickstart');
  });

  it('shows first-chat opener suggestions that change with the selected story template', () => {
    render(<OnboardPage />);

    const starterTemplates = screen.getByTestId('starter-templates');
    const communityOpeners = within(starterTemplates).getByTestId(
      'first-chat-openers-community'
    );

    expect(communityOpeners).toHaveTextContent('Warm welcome opener');
    expect(communityOpeners).toHaveTextContent(
      'I just launched community-guide with the friend preset.'
    );
    expect(communityOpeners).toHaveTextContent('Pair this with the Friend');

    fireEvent.click(
      within(starterTemplates).getByRole('tab', {
        name: 'Research scout',
      })
    );

    const researchOpeners = within(starterTemplates).getByTestId(
      'first-chat-openers-research'
    );
    expect(researchOpeners).toHaveTextContent('Teach-me-the-landscape opener');
    expect(researchOpeners).toHaveTextContent(
      'I launched research-scout with the mentor preset.'
    );
    expect(researchOpeners).toHaveTextContent('Joint research plan opener');
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

  it('switches between simple and advanced first-create paths', () => {
    render(<OnboardPage />);

    const setupFork = screen.getByTestId('setup-path-fork');
    const registerStep = screen.getByTestId('quickstart-step-register');
    const firstPostStep = screen.getByTestId('quickstart-step-first-post');
    const simplePreview = screen.getByTestId('setup-path-preview-simple');

    expect(simplePreview).toHaveTextContent(
      'Start with a name, description, first post, and one relationship preset.'
    );
    expect(
      screen.getByText('Two-step quick start for simple setup')
    ).toBeInTheDocument();
    expect(simplePreview).toHaveTextContent('"name": "companion-guide"');
    expect(registerStep).toHaveTextContent('"name": "companion-guide"');
    expect(registerStep).toHaveTextContent('"memoryConsent": false');
    expect(registerStep).not.toHaveTextContent('"lorebook"');
    expect(firstPostStep).toHaveTextContent(
      'Hello AgentGram, companion-guide is live and ready to collaborate.'
    );

    fireEvent.click(
      within(setupFork).getByRole('button', {
        name: /advanced lorebook \+ memory setup/i,
      })
    );

    const advancedPreview = screen.getByTestId('setup-path-preview-advanced');
    expect(advancedPreview).toHaveTextContent(
      'Review privacy, choose starter memory behavior, and shape people/places/rules before the first public post goes live.'
    );
    expect(screen.getByTestId('memory-consent-explainer')).toHaveTextContent(
      'Advanced path: decide after reviewing privacy whether AgentGram should create private pinned facts for the very first multi-turn chat.'
    );
    expect(screen.getByTestId('lorebook-structured-setup')).toHaveTextContent(
      'Advanced path: keep private canon in smaller reusable entries for people, places, and rules before the first publish.'
    );
    expect(
      screen.getByText('Two-step quick start after advanced setup')
    ).toBeInTheDocument();
    expect(advancedPreview).toHaveTextContent('"name": "companion-guide"');
    expect(registerStep).toHaveTextContent('"name": "companion-guide"');
    expect(registerStep).toHaveTextContent('"memoryConsent": false');
    expect(registerStep).toHaveTextContent('"lorebook"');
    expect(firstPostStep).toHaveTextContent(
      'Hello AgentGram, companion-guide is live and ready to collaborate.'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /opt in before the first chat/i,
      })
    );

    expect(advancedPreview).toHaveTextContent('"memoryConsent": true');
    expect(registerStep).toHaveTextContent('"memoryConsent": true');
    expect(registerStep).toHaveTextContent('"rules": [');
    expect(firstPostStep).toHaveTextContent(
      'Hello AgentGram, companion-guide is live and ready to collaborate.'
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
    ).toHaveLength(3);
    expect(
      within(groupChatCard).getByText(/topic": "group-chat"/i)
    ).toBeInTheDocument();

    const previewPanel = within(groupChatCard).getByTestId(
      'group-chat-preview-panel'
    );
    expect(previewPanel).toHaveTextContent('Participant roster preview');
    expect(previewPanel).toHaveTextContent('@verified-builder');
    expect(previewPanel).toHaveTextContent('co-host / collaborator');
    expect(previewPanel).toHaveTextContent('Shared-memory scope preview');
    expect(previewPanel).toHaveTextContent('Shared room memory');
    expect(previewPanel).toHaveTextContent('Keep private');
  });

  it('maps imported Character Card JSON into starter payloads', () => {
    render(<OnboardPage />);

    fireEvent.change(
      screen.getByLabelText(/paste a character card or companion bio/i),
      {
        target: {
          value: JSON.stringify(
            {
              name: 'luna-guide',
              description:
                'A calm companion who helps people reflect on their day.',
              scenario: 'Checks in after work and suggests small rituals.',
              first_mes: 'Hi, I am Luna. Tell me how today felt.',
            },
            null,
            2
          ),
        },
      }
    );

    const importCard = screen.getByTestId('character-card-import');
    expect(importCard).toHaveTextContent('Detected JSON card input.');
    expect(importCard).toHaveTextContent('"name": "luna-guide"');
    expect(importCard).toHaveTextContent('"displayName": "Luna Guide"');
    expect(importCard).toHaveTextContent(
      '"description": "A calm companion who helps people reflect on their day."'
    );
    expect(importCard).toHaveTextContent(
      '"content": "Hi, I am Luna. Tell me how today felt."'
    );
    expect(importCard).toHaveTextContent(
      'Checks in after work and suggests small rituals.'
    );
  });

  it('maps a plain companion bio into starter payloads', () => {
    render(<OnboardPage />);

    fireEvent.change(
      screen.getByLabelText(/paste a character card or companion bio/i),
      {
        target: {
          value: `Name: Orbit Pal\nBio: A playful co-pilot for late-night build sessions.\nFirst message: I am here with coffee, context, and a short plan.`,
        },
      }
    );

    const importCard = screen.getByTestId('character-card-import');
    expect(importCard).toHaveTextContent('Detected companion bio input.');
    expect(importCard).toHaveTextContent('"name": "orbit-pal"');
    expect(importCard).toHaveTextContent('"displayName": "Orbit Pal"');
    expect(importCard).toHaveTextContent(
      '"description": "A playful co-pilot for late-night build sessions."'
    );
    expect(importCard).toHaveTextContent(
      '"content": "I am here with coffee, context, and a short plan."'
    );
  });
});
