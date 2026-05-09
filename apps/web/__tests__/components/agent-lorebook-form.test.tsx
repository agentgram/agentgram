import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AgentLorebookForm,
  type AgentLorebookSettings,
} from '@/components/dashboard/AgentLorebookForm';

function buildSettings(
  overrides: Partial<AgentLorebookSettings> = {}
): AgentLorebookSettings {
  return {
    agentId: 'agent-1',
    agentName: 'sage-bot',
    agentLabel: 'Sage Bot',
    personaName: 'Release Sage',
    initialLorebook: {
      people: [],
      places: [],
      rules: [],
    },
    ...overrides,
  };
}

describe('AgentLorebookForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves structured people, places, and rules', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            people: [
              {
                id: 'person-1',
                name: 'Mina Park',
                role: 'Launch producer',
                details: 'Keeps launch comms calm and timestamped.',
              },
            ],
            places: [
              {
                id: 'place-1',
                name: 'Night shift war room',
                details: 'Late-night release channel with terse updates.',
              },
            ],
            rules: [
              {
                id: 'rule-1',
                title: 'Never fake a ship date',
                details:
                  'If timing is uncertain, give the next checkpoint instead.',
              },
            ],
            updatedAt: '2026-05-09T03:00:00.000Z',
          },
        }),
      })
    );

    render(<AgentLorebookForm settings={buildSettings()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add person' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add place' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add rule' }));

    fireEvent.change(screen.getByLabelText(/person 1 name for sage bot/i), {
      target: { value: 'Mina Park' },
    });
    fireEvent.change(screen.getByLabelText(/person 1 role for sage bot/i), {
      target: { value: 'Launch producer' },
    });
    fireEvent.change(screen.getByLabelText(/person 1 details for sage bot/i), {
      target: { value: 'Keeps launch comms calm and timestamped.' },
    });

    fireEvent.change(screen.getByLabelText(/place 1 name for sage bot/i), {
      target: { value: 'Night shift war room' },
    });
    fireEvent.change(screen.getByLabelText(/place 1 details for sage bot/i), {
      target: { value: 'Late-night release channel with terse updates.' },
    });

    fireEvent.change(screen.getByLabelText(/rule 1 title for sage bot/i), {
      target: { value: 'Never fake a ship date' },
    });
    fireEvent.change(screen.getByLabelText(/rule 1 details for sage bot/i), {
      target: {
        value: 'If timing is uncertain, give the next checkpoint instead.',
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save lorebook' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    const request = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[1] as {
      body: string;
      method: string;
    };
    const payload = JSON.parse(request.body);

    expect(request.method).toBe('PUT');
    expect(payload.agentId).toBe('agent-1');
    expect(payload.lorebook.people[0]).toMatchObject({
      name: 'Mina Park',
      role: 'Launch producer',
      details: 'Keeps launch comms calm and timestamped.',
    });
    expect(payload.lorebook.places[0]).toMatchObject({
      name: 'Night shift war room',
      details: 'Late-night release channel with terse updates.',
    });
    expect(payload.lorebook.rules[0]).toMatchObject({
      title: 'Never fake a ship date',
      details: 'If timing is uncertain, give the next checkpoint instead.',
    });

    expect(
      await screen.findByText('Structured lorebook saved.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/3 structured lorebook entries/i)
    ).toBeInTheDocument();
  });

  it('skips the network call when nothing changed', async () => {
    vi.stubGlobal('fetch', vi.fn());

    render(
      <AgentLorebookForm
        settings={buildSettings({
          initialLorebook: {
            people: [
              {
                id: 'person-1',
                name: 'Mina Park',
                role: 'Launch producer',
                details: 'Keeps launch comms calm and timestamped.',
              },
            ],
            places: [],
            rules: [],
          },
        })}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save lorebook' }));

    expect(fetch).not.toHaveBeenCalled();
    expect(
      await screen.findByText('No lorebook changes to save.')
    ).toBeInTheDocument();
  });
});
