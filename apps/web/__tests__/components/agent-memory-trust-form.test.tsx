import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AgentMemoryTrustForm,
  type AgentMemoryTrustSettings,
} from '@/components/dashboard/AgentMemoryTrustForm';

function buildSettings(
  overrides: Partial<AgentMemoryTrustSettings> = {}
): AgentMemoryTrustSettings {
  return {
    agentId: 'agent-1',
    agentName: 'sage-bot',
    agentLabel: 'Sage Bot',
    personaName: 'Release Sage',
    initialSnapshot: {
      displayName: 'Sage Bot',
      description: 'Keeps release notes precise.',
      backstory: 'Started as a release engineer with a trust-first playbook.',
    },
    ...overrides,
  };
}

describe('AgentMemoryTrustForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves edits, renders a digest, and supports rollback', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              snapshot: {
                displayName: 'Sage Ops',
                description: 'Keeps release notes precise and audit-ready.',
                backstory:
                  'Started as a release engineer and now guards memory trust.',
              },
              rollbackSnapshot: {
                displayName: 'Sage Bot',
                description: 'Keeps release notes precise.',
                backstory:
                  'Started as a release engineer with a trust-first playbook.',
              },
              digest: {
                summary: '3 trust-facing memory fields changed. Review before continuing.',
                recordedAt: '2026-04-30T10:00:00.000Z',
                changedFields: [
                  {
                    key: 'displayName',
                    label: 'Display name',
                    trustNote:
                      'Other developers and tools will see a new identity label first.',
                    changeType: 'updated',
                    previousValue: 'Sage Bot',
                    nextValue: 'Sage Ops',
                  },
                  {
                    key: 'description',
                    label: 'Profile summary',
                    trustNote:
                      'The public summary that frames this agent for readers has changed.',
                    changeType: 'updated',
                    previousValue: 'Keeps release notes precise.',
                    nextValue: 'Keeps release notes precise and audit-ready.',
                  },
                  {
                    key: 'backstory',
                    label: 'Active backstory',
                    trustNote:
                      'Future conversations can anchor on a different private pinned backstory.',
                    changeType: 'updated',
                    previousValue:
                      'Started as a release engineer with a trust-first playbook.',
                    nextValue:
                      'Started as a release engineer and now guards memory trust.',
                  },
                ],
              },
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              snapshot: {
                displayName: 'Sage Bot',
                description: 'Keeps release notes precise.',
                backstory:
                  'Started as a release engineer with a trust-first playbook.',
              },
              rollbackSnapshot: {
                displayName: 'Sage Ops',
                description: 'Keeps release notes precise and audit-ready.',
                backstory:
                  'Started as a release engineer and now guards memory trust.',
              },
              digest: {
                summary: '1 trust-facing memory field changed. Review before continuing.',
                recordedAt: '2026-04-30T10:05:00.000Z',
                changedFields: [
                  {
                    key: 'displayName',
                    label: 'Display name',
                    trustNote:
                      'Other developers and tools will see a new identity label first.',
                    changeType: 'updated',
                    previousValue: 'Sage Ops',
                    nextValue: 'Sage Bot',
                  },
                ],
              },
            },
          }),
        })
    );

    render(<AgentMemoryTrustForm settings={buildSettings()} />);

    fireEvent.change(screen.getByLabelText(/display name for sage bot/i), {
      target: { value: 'Sage Ops' },
    });
    fireEvent.change(screen.getByLabelText(/profile summary for sage bot/i), {
      target: { value: 'Keeps release notes precise and audit-ready.' },
    });
    fireEvent.change(screen.getByLabelText(/active backstory for sage bot/i), {
      target: {
        value: 'Started as a release engineer and now guards memory trust.',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save profile memory' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/v1/developers/me/agent-memory-trust',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            agentId: 'agent-1',
            displayName: 'Sage Ops',
            description: 'Keeps release notes precise and audit-ready.',
            backstory:
              'Started as a release engineer and now guards memory trust.',
          }),
        })
      );
    });

    expect(
      await screen.findByText('Profile memory settings saved.')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('memory-digest-agent-1')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /roll back previous snapshot/i })
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /roll back previous snapshot/i })
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenLastCalledWith(
        '/api/v1/developers/me/agent-memory-trust',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            agentId: 'agent-1',
            displayName: 'Sage Bot',
            description: 'Keeps release notes precise.',
            backstory:
              'Started as a release engineer with a trust-first playbook.',
          }),
        })
      );
    });

    expect(
      await screen.findByText('Previous profile memory snapshot restored.')
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/display name for sage bot/i)).toHaveValue(
      'Sage Bot'
    );
  });

  it('skips the network call when nothing changed', async () => {
    vi.stubGlobal('fetch', vi.fn());

    render(<AgentMemoryTrustForm settings={buildSettings()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Save profile memory' }));

    expect(fetch).not.toHaveBeenCalled();
    expect(
      await screen.findByText('No new profile memory changes to save.')
    ).toBeInTheDocument();
  });
});
