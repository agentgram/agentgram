import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProactiveControlsForm } from '@/components/dashboard/ProactiveControlsForm';

const mockCreateClient = vi.fn();
const mockFadeIn = vi.fn(({ children }: { children: React.ReactNode }) => (
  <div data-testid="fade-in">{children}</div>
));
const mockAgentMemoryTrustForm = vi.fn(
  ({ settings }: { settings: unknown }) => (
    <div data-testid="agent-memory-trust-form">{JSON.stringify(settings)}</div>
  )
);
const mockAgentLorebookForm = vi.fn(({ settings }: { settings: unknown }) => (
  <div data-testid="agent-lorebook-form">{JSON.stringify(settings)}</div>
));
const mockProactiveControlsForm = vi.fn(
  ({ initialSettings }: { initialSettings: unknown }) => (
    <div data-testid="proactive-controls-form">
      {JSON.stringify(initialSettings)}
    </div>
  )
);
const mockAgentDiaryForm = vi.fn(({ settings }: { settings: unknown }) => (
  <div data-testid="agent-diary-form">{JSON.stringify(settings)}</div>
));
const mockAgentPinnedFactsCard = vi.fn(
  ({ settings }: { settings: unknown }) => (
    <div data-testid="agent-pinned-facts-card">{JSON.stringify(settings)}</div>
  )
);

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}));

vi.mock('@/components/dashboard', () => ({
  FadeIn: mockFadeIn,
  AgentDiaryForm: mockAgentDiaryForm,
  AgentLorebookForm: mockAgentLorebookForm,
  AgentMemoryTrustForm: mockAgentMemoryTrustForm,
  AgentPinnedFactsCard: mockAgentPinnedFactsCard,
  ProactiveControlsForm: mockProactiveControlsForm,
}));

function createSettingsPageClient() {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-1', email: 'dev@example.com' } },
      }),
    },
    from: vi.fn((table: string) => {
      if (table === 'developer_members') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { developer_id: 'dev-1' },
              }),
            }),
          }),
        };
      }

      if (table === 'developers') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  metadata: {
                    proactiveControls: {
                      optIn: false,
                      dailyLimit: 2,
                      weeklyLimit: 8,
                      quietHoursEnabled: true,
                      quietHoursStart: '23:00',
                      quietHoursEnd: '06:30',
                      tonePreset: 'brief',
                    },
                  },
                },
              }),
            }),
          }),
        };
      }

      if (table === 'agents') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'agent-1',
                    name: 'sage-bot',
                    display_name: 'Sage Bot',
                    description: 'Keeps release notes precise.',
                    metadata: {
                      lorebook: {
                        updatedAt: '2026-05-09T03:00:00.000Z',
                        people: [
                          {
                            id: 'person-1',
                            name: 'Mina Park',
                            role: 'Launch producer',
                            details: 'Keeps launch comms calm and timestamped.',
                          },
                        ],
                        places: [],
                        rules: [
                          {
                            id: 'rule-1',
                            title: 'Never fake a ship date',
                            details:
                              'If timing is uncertain, give the next checkpoint instead.',
                          },
                        ],
                      },
                    },
                  },
                ],
              }),
            }),
          }),
        };
      }

      if (table === 'agent_personas') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [
                  {
                    agent_id: 'agent-1',
                    name: 'Release Sage',
                    backstory: 'Trust-first release engineer.',
                  },
                ],
              }),
            }),
          }),
        };
      }

      if (table === 'agent_memories') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'memory-1',
                    agent_id: 'agent-1',
                    key: 'pinned_backstory',
                    value: 'Keeps release notes precise and audit-ready.',
                    category: 'profile_fact',
                    created_at: '2026-05-04T10:00:00.000Z',
                    updated_at: '2026-05-05T10:30:00.000Z',
                  },
                ],
              }),
            }),
          }),
        };
      }

      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
            }),
          }),
        }),
      };
    }),
  };
}

describe('ProactiveControlsForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockResolvedValue(createSettingsPageClient());
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            optIn: false,
            dailyLimit: 7,
            weeklyLimit: 21,
            quietHoursEnabled: true,
            quietHoursStart: '21:30',
            quietHoursEnd: '07:15',
            tonePreset: 'warm',
            updatedAt: '2026-04-26T00:00:00.000Z',
          },
        }),
      })
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows caps and quiet hours controls and saves through the API', async () => {
    render(
      <ProactiveControlsForm
        initialSettings={{
          optIn: false,
          dailyLimit: 2,
          weeklyLimit: 8,
          quietHoursEnabled: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          tonePreset: 'neutral',
        }}
      />
    );

    expect(
      screen.getByRole('checkbox', { name: /enable proactive outreach/i })
    ).not.toBeChecked();
    expect(screen.getByLabelText('Daily outreach cap')).toHaveValue(2);
    expect(screen.getByLabelText('Weekly outreach cap')).toHaveValue(8);
    expect(
      screen.getByRole('checkbox', { name: /quiet hours/i })
    ).not.toBeChecked();
    expect(
      screen.queryByLabelText('Quiet hours start')
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Quiet hours end')).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /neutral/i })).toBeChecked();

    fireEvent.change(screen.getByLabelText('Daily outreach cap'), {
      target: { value: '7' },
    });
    fireEvent.change(screen.getByLabelText('Weekly outreach cap'), {
      target: { value: '21' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: /quiet hours/i }));
    fireEvent.change(screen.getByLabelText('Quiet hours start'), {
      target: { value: '21:30' },
    });
    fireEvent.change(screen.getByLabelText('Quiet hours end'), {
      target: { value: '07:15' },
    });
    fireEvent.click(screen.getByRole('radio', { name: /warm/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Save controls' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/v1/developers/me/proactive-controls',
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            optIn: false,
            dailyLimit: 7,
            weeklyLimit: 21,
            quietHoursEnabled: true,
            quietHoursStart: '21:30',
            quietHoursEnd: '07:15',
            tonePreset: 'warm',
          }),
        })
      );
    });

    expect(
      await screen.findByText('Proactive outreach preferences saved.')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Daily outreach cap')).toHaveValue(7);
    expect(screen.getByLabelText('Weekly outreach cap')).toHaveValue(21);
    expect(
      screen.getByRole('checkbox', { name: /quiet hours/i })
    ).toBeChecked();
    expect(screen.getByLabelText('Quiet hours start')).toHaveValue('21:30');
    expect(screen.getByLabelText('Quiet hours end')).toHaveValue('07:15');
    expect(screen.getByRole('radio', { name: /warm/i })).toBeChecked();
  });

  it('shows last send and next eligible window status', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-26T20:15:00.000Z'));

    render(
      <ProactiveControlsForm
        initialSettings={{
          optIn: true,
          dailyLimit: 2,
          weeklyLimit: 8,
          quietHoursEnabled: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          tonePreset: 'neutral',
          lastAutoMessageAt: '2026-04-27T01:30:00.000Z',
        }}
      />
    );

    expect(screen.getByTestId('proactive-last-auto-message')).toHaveTextContent(
      'Apr 27, 2026, 10:30 AM KST'
    );
    expect(
      screen.getByTestId('proactive-next-eligible-send')
    ).toHaveTextContent('Apr 27, 2026, 8:00 AM KST');
    expect(
      screen.getByTestId('proactive-pre-send-banner-title')
    ).toHaveTextContent('Next proactive send waits for the reset window');
    expect(
      screen.getByTestId('proactive-pre-send-banner-body')
    ).toHaveTextContent(
      'Quiet hours push the next eligible send to Apr 27, 2026, 8:00 AM KST.'
    );
    expect(
      screen.getByTestId('proactive-pre-send-banner-body')
    ).toHaveTextContent('2/day and 8/week caps');
  });

  it('shows an opt-in gate banner before proactive outreach is enabled', () => {
    render(
      <ProactiveControlsForm
        initialSettings={{
          optIn: false,
          dailyLimit: 3,
          weeklyLimit: 9,
          quietHoursEnabled: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          tonePreset: 'neutral',
        }}
      />
    );

    expect(
      screen.getByTestId('proactive-pre-send-banner-title')
    ).toHaveTextContent('Proactive send blocked until opt-in');
    expect(
      screen.getByTestId('proactive-pre-send-banner-body')
    ).toHaveTextContent(
      'Turn on proactive outreach before AgentGram sends the next message.'
    );
    expect(
      screen.getByTestId('proactive-pre-send-banner-body')
    ).toHaveTextContent('3/day and 9/week caps');
  });

  it('does not show reset-window copy when quiet hours are configured but currently inactive', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-27T04:00:00.000Z'));

    render(
      <ProactiveControlsForm
        initialSettings={{
          optIn: true,
          dailyLimit: 2,
          weeklyLimit: 8,
          quietHoursEnabled: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          tonePreset: 'neutral',
        }}
      />
    );

    expect(
      screen.getByTestId('proactive-pre-send-banner-title')
    ).toHaveTextContent('Next proactive send is available once caps allow');
    expect(
      screen.getByTestId('proactive-pre-send-banner-body')
    ).toHaveTextContent(
      'AgentGram can send again as early as Apr 27, 2026, 1:00 PM KST.'
    );
    expect(
      screen.getByTestId('proactive-pre-send-banner-body')
    ).toHaveTextContent('2/day and 8/week');
    expect(
      screen.getByTestId('proactive-pre-send-banner-body')
    ).not.toHaveTextContent('Quiet hours push');
  });

  it('shows an error when the save request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ success: false }),
      })
    );

    render(
      <ProactiveControlsForm
        initialSettings={{
          optIn: false,
          dailyLimit: 2,
          weeklyLimit: 8,
          quietHoursEnabled: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          tonePreset: 'neutral',
        }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save controls' }));

    expect(
      await screen.findByText(
        'Could not save these settings. Please try again.'
      )
    ).toBeInTheDocument();
  });
});

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockResolvedValue(createSettingsPageClient());
  });

  it('loads proactive controls from developer metadata for the settings form', async () => {
    const { default: SettingsPage } =
      await import('@/app/(protected)/dashboard/settings/page');

    render(await SettingsPage());

    expect(
      screen.getByRole('heading', { name: 'Settings' })
    ).toBeInTheDocument();
    expect(mockProactiveControlsForm).toHaveBeenCalledWith(
      {
        initialSettings: {
          optIn: false,
          dailyLimit: 2,
          weeklyLimit: 8,
          quietHoursEnabled: true,
          quietHoursStart: '23:00',
          quietHoursEnd: '06:30',
          tonePreset: 'brief',
          updatedAt: undefined,
        },
      },
      undefined
    );
    expect(mockAgentMemoryTrustForm).toHaveBeenCalledWith(
      {
        settings: {
          agentId: 'agent-1',
          agentName: 'sage-bot',
          agentLabel: 'Sage Bot',
          personaName: 'Release Sage',
          initialSnapshot: {
            displayName: 'Sage Bot',
            description: 'Keeps release notes precise.',
            backstory: 'Trust-first release engineer.',
          },
        },
      },
      undefined
    );
    expect(mockAgentPinnedFactsCard).toHaveBeenCalledWith(
      {
        settings: {
          agentId: 'agent-1',
          agentLabel: 'Sage Bot',
          facts: [
            {
              id: 'memory-1',
              key: 'pinned_backstory',
              value: 'Keeps release notes precise and audit-ready.',
              category: 'profile_fact',
              updatedAt: '2026-05-05T10:30:00.000Z',
              originLabel: 'Registration description seed',
              originSnippet: 'Keeps release notes precise.',
            },
          ],
        },
      },
      undefined
    );
    expect(mockAgentLorebookForm).toHaveBeenCalledWith(
      {
        settings: {
          agentId: 'agent-1',
          agentName: 'sage-bot',
          agentLabel: 'Sage Bot',
          personaName: 'Release Sage',
          initialLorebook: {
            updatedAt: '2026-05-09T03:00:00.000Z',
            people: [
              {
                id: 'person-1',
                name: 'Mina Park',
                role: 'Launch producer',
                details: 'Keeps launch comms calm and timestamped.',
              },
            ],
            places: [],
            rules: [
              {
                id: 'rule-1',
                title: 'Never fake a ship date',
                details:
                  'If timing is uncertain, give the next checkpoint instead.',
              },
            ],
          },
        },
      },
      undefined
    );
    expect(mockAgentDiaryForm).toHaveBeenCalledWith(
      {
        settings: {
          agentId: 'agent-1',
          agentLabel: 'Sage Bot',
          initialEntries: [],
        },
      },
      undefined
    );
    expect(screen.getByTestId('proactive-controls-form')).toBeInTheDocument();
    expect(screen.getByTestId('agent-memory-trust-form')).toBeInTheDocument();
    expect(screen.getByTestId('agent-pinned-facts-card')).toBeInTheDocument();
    expect(screen.getByTestId('agent-lorebook-form')).toBeInTheDocument();
    expect(screen.getByTestId('agent-diary-form')).toBeInTheDocument();
  });

  it('renders the unavailable state when the user has no developer membership', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'dev@example.com' } },
        }),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
            }),
          }),
        }),
      })),
    });

    const { default: SettingsPage } =
      await import('@/app/(protected)/dashboard/settings/page');

    render(await SettingsPage());

    expect(
      screen.getByRole('heading', { name: 'Settings Unavailable' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Please complete your developer profile first.')
    ).toBeInTheDocument();
    expect(mockProactiveControlsForm).not.toHaveBeenCalled();
  });
});
