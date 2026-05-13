import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreateClient = vi.fn();
const mockFadeIn = vi.fn(
  ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'fade-in' }, children)
);
const mockManageSubscriptionButton = vi.fn(() =>
  React.createElement('button', { type: 'button' }, 'Manage subscription')
);

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}));

vi.mock('@/components/dashboard', () => ({
  FadeIn: mockFadeIn,
  ManageSubscriptionButton: mockManageSubscriptionButton,
}));

function createBillingPageClient({
  plan = 'free',
  subscriptionStatus = 'none',
  agents = [
    {
      id: 'agent-1',
      name: 'sage-bot',
      display_name: 'Sage Bot',
      metadata: {
        profileDiary: {
          entries: [
            {
              id: 'entry-1',
              content: 'One',
              publishedAt: '2026-05-13T01:00:00.000Z',
            },
            {
              id: 'entry-2',
              content: 'Two',
              publishedAt: '2026-05-12T01:00:00.000Z',
            },
            {
              id: 'entry-3',
              content: 'Three',
              publishedAt: '2026-05-11T01:00:00.000Z',
            },
            {
              id: 'entry-4',
              content: 'Four',
              publishedAt: '2026-05-10T01:00:00.000Z',
            },
          ],
        },
        lorebook: {
          people: [
            { id: 'person-1', name: 'Mina' },
            { id: 'person-2', name: 'Jin' },
            { id: 'person-3', name: 'Ari' },
          ],
          places: [
            { id: 'place-1', name: 'Harbor' },
            { id: 'place-2', name: 'Studio' },
          ],
          rules: [{ id: 'rule-1', title: 'Stay honest' }],
        },
      },
    },
  ],
} = {}) {
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
                  id: 'dev-1',
                  plan,
                  subscription_status: subscriptionStatus,
                  payment_customer_id: null,
                  current_period_end: null,
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
                data: agents,
              }),
            }),
          }),
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    }),
  };
}

describe('BillingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockResolvedValue(createBillingPageClient());
  });

  it('shows free-vs-paid memory comparison details before journal and lorebook caps are hit', async () => {
    const { default: BillingPage } = await import(
      '@/app/(protected)/dashboard/billing/page'
    );

    render(await BillingPage());

    expect(
      screen.getByText('Memory workspace compare')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'See the free memory caps and paid Operator upsides before your journal or lorebook setup runs out of room.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('4 / 6 used on Sage Bot')).toBeInTheDocument();
    expect(screen.getByText('6 / 18 used on Sage Bot')).toBeInTheDocument();
    expect(screen.getByText('6 saved entries per agent before the Journal tab fills up.')).toBeInTheDocument();
    expect(
      screen.getByText(
        /guided story beats, follow-up sequences, and lorebook-canon packs/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /memory policy, permission scope, and work proof/i
      )
    ).toBeInTheDocument();
    expect(screen.getByText('1,000 API requests/day')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Manual memory trust edits, journal saves, and lorebook slots'
      )
    ).toBeInTheDocument();
  });

  it('falls back to an empty-usage preview when no agents have saved memory yet', async () => {
    mockCreateClient.mockResolvedValue(
      createBillingPageClient({
        agents: [],
      })
    );

    const { default: BillingPage } = await import(
      '@/app/(protected)/dashboard/billing/page'
    );

    render(await BillingPage());

    expect(screen.getAllByText('No saved memory usage yet.')).toHaveLength(2);
  });
});
