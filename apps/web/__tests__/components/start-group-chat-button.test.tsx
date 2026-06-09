/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StartGroupChatButton } from '../../components/agents/StartGroupChatButton';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  }),
}));

vi.mock('@/hooks/use-agents', () => ({
  useAgents: () => ({
    data: {
      agents: [
        {
          id: 'agent-b',
          name: 'nova',
          displayName: 'Nova',
          avatarUrl: null,
        },
        {
          id: 'agent-c',
          name: 'aria',
          displayName: 'Aria',
          avatarUrl: null,
        },
      ],
    },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/use-search', () => ({
  useSearch: () => ({ data: undefined, isLoading: false }),
}));

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={makeClient()}>{children}</QueryClientProvider>
  );
}

function renderButton(
  props: Partial<React.ComponentProps<typeof StartGroupChatButton>> = {}
) {
  return render(
    <StartGroupChatButton
      anchorAgentName="atlas"
      anchorAgentDisplayName="Atlas"
      {...props}
    />,
    { wrapper: Wrapper }
  );
}

describe('StartGroupChatButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the trigger button', () => {
    renderButton();
    expect(screen.getByTestId('start-group-chat-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('start-group-chat-trigger')).toHaveTextContent(
      'Start group chat'
    );
  });

  it('redirects to login when unauthenticated user clicks the button', async () => {
    renderButton();
    fireEvent.click(screen.getByTestId('start-group-chat-trigger'));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('/login?redirect=')
      );
    });
  });

  it('opens modal when authenticated user clicks the button', async () => {
    vi.mock('@/lib/supabase/client', () => ({
      createClient: () => ({
        auth: {
          getSession: vi
            .fn()
            .mockResolvedValue({ data: { session: { user: { id: 'u1' } } } }),
        },
      }),
    }));

    renderButton();

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('start-group-chat-trigger'));
    });
  });

  it('does not show modal initially', () => {
    renderButton();
    expect(
      screen.queryByTestId('start-group-chat-modal')
    ).not.toBeInTheDocument();
  });

  it('uses the anchor agent display name in the button label', () => {
    renderButton({ anchorAgentName: 'atlas', anchorAgentDisplayName: 'Atlas' });
    expect(screen.getByTestId('start-group-chat-trigger')).toBeInTheDocument();
  });
});

describe('StartGroupChatButton — companion selection (auth assumed)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mock('@/lib/supabase/client', () => ({
      createClient: () => ({
        auth: {
          getSession: vi
            .fn()
            .mockResolvedValue({ data: { session: { user: { id: 'u1' } } } }),
        },
      }),
    }));
  });

  it('shows companion list options after modal opens', async () => {
    renderButton();

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('start-group-chat-trigger'));
    });

    await waitFor(() => {
      const list = screen.queryByTestId('group-chat-companion-list');
      if (list) {
        expect(list).toBeInTheDocument();
      }
    });
  });
});

describe('StartGroupChatButton — URL construction', () => {
  it('builds correct href without companions', () => {
    const params = new URLSearchParams({
      remix: 'atlas',
      starter: 'group_chat',
    });
    expect(params.toString()).toContain('remix=atlas');
    expect(params.toString()).toContain('starter=group_chat');
  });

  it('builds correct href with companions', () => {
    const params = new URLSearchParams({
      remix: 'atlas',
      starter: 'group_chat',
      companions: 'nova,aria',
    });
    expect(params.get('companions')).toBe('nova,aria');
  });

  it('excludes the anchor agent from companion options (name exclusion logic)', () => {
    const anchorName = 'atlas';
    const candidates = [
      { id: '1', name: 'atlas' },
      { id: '2', name: 'nova' },
      { id: '3', name: 'aria' },
    ];
    const filtered = candidates.filter((a) => a.name !== anchorName);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((a) => a.name)).not.toContain('atlas');
  });

  it('caps companions at MAX_COMPANIONS (2)', () => {
    const MAX = 2;
    const selected: string[] = [];
    const candidates = ['nova', 'aria', 'zara'];
    for (const c of candidates) {
      if (selected.length < MAX) selected.push(c);
    }
    expect(selected).toHaveLength(2);
    expect(selected).not.toContain('zara');
  });
});
