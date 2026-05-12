import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AgentDiaryForm } from '@/components/dashboard/AgentDiaryForm';

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

function buildSettings(
  overrides: Partial<{
    agentId: string;
    agentLabel: string;
    developerPlan?: string;
    initialEntries: Array<{
      id: string;
      title?: string;
      content: string;
      publishedAt: string;
    }>;
  }> = {}
) {
  return {
    agentId: 'agent-1',
    agentLabel: 'Sage Bot',
    developerPlan: 'free',
    initialEntries: [],
    ...overrides,
  };
}

describe('AgentDiaryForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reveals the guided premium preset upsell after the first saved draft', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            {
              id: 'entry-1',
              title: 'Launch note',
              content: 'We shipped the preview and logged the next checkpoint.',
              publishedAt: '2026-05-13T01:00:00.000Z',
            },
          ],
        }),
      })
    );

    render(<AgentDiaryForm settings={buildSettings()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add reflection' }));
    fireEvent.change(screen.getByLabelText(/journal title 1 for sage bot/i), {
      target: { value: 'Launch note' },
    });
    fireEvent.change(
      screen.getByLabelText(/journal reflection 1 for sage bot/i),
      {
        target: {
          value: 'We shipped the preview and logged the next checkpoint.',
        },
      }
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save journal' }));

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
    expect(payload.entries[0]).toMatchObject({
      title: 'Launch note',
      content: 'We shipped the preview and logged the next checkpoint.',
    });

    expect(
      await screen.findByText('Profile journal updated.')
    ).toBeInTheDocument();

    const teaser = screen.getByTestId('journal-guided-template-upsell');
    expect(teaser).toHaveTextContent('Guided premium presets');
    expect(teaser).toHaveTextContent('First draft saved.');
    expect(teaser).toHaveTextContent('story and lorebook packs');
    expect(
      within(teaser).getByRole('link', { name: 'Compare Operator tiers' })
    ).toHaveAttribute('href', '/dashboard/billing');
    expect(
      screen.getByTestId('journal-guided-template-story-beat-pack')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('journal-guided-template-follow-up-sequence')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('journal-guided-template-lorebook-canon-pack')
    ).toBeInTheDocument();
  });

  it('hides the guided preset upsell for paid operator plans', () => {
    render(
      <AgentDiaryForm
        settings={buildSettings({
          developerPlan: 'starter',
          initialEntries: [
            {
              id: 'entry-1',
              title: 'Launch note',
              content: 'We shipped the preview and logged the next checkpoint.',
              publishedAt: '2026-05-13T01:00:00.000Z',
            },
          ],
        })}
      />
    );

    expect(
      screen.queryByTestId('journal-guided-template-upsell')
    ).not.toBeInTheDocument();
  });
});
