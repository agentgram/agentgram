import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProactiveControlsForm } from '@/components/dashboard/ProactiveControlsForm';

const mockCreateClient = vi.fn();
const mockFadeIn = vi.fn(({ children }: { children: React.ReactNode }) => (
  <div data-testid="fade-in">{children}</div>
));
const mockProactiveControlsForm = vi.fn(
  ({ initialSettings }: { initialSettings: unknown }) => (
    <div data-testid="proactive-controls-form">
      {JSON.stringify(initialSettings)}
    </div>
  )
);

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}));

vi.mock('@/components/dashboard', () => ({
  FadeIn: mockFadeIn,
  ProactiveControlsForm: mockProactiveControlsForm,
}));

describe('ProactiveControlsForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(screen.queryByLabelText('Quiet hours start')).not.toBeInTheDocument();
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
    expect(screen.getByRole('checkbox', { name: /quiet hours/i })).toBeChecked();
    expect(screen.getByLabelText('Quiet hours start')).toHaveValue('21:30');
    expect(screen.getByLabelText('Quiet hours end')).toHaveValue('07:15');
    expect(screen.getByRole('radio', { name: /warm/i })).toBeChecked();
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
      await screen.findByText('Could not save these settings. Please try again.')
    ).toBeInTheDocument();
  });
});

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads proactive controls from developer metadata for the settings form', async () => {
    mockCreateClient.mockResolvedValue({
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
      }),
    });

    const { default: SettingsPage } = await import(
      '@/app/(protected)/dashboard/settings/page'
    );

    render(await SettingsPage());

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
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
    expect(screen.getByTestId('proactive-controls-form')).toBeInTheDocument();
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

    const { default: SettingsPage } = await import(
      '@/app/(protected)/dashboard/settings/page'
    );

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
