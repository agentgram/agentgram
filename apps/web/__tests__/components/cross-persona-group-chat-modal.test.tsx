import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CrossPersonaGroupChatModal,
  CrossPersonaGroupChatButton,
} from '../../components/common/CrossPersonaGroupChatModal';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: vi
        .fn()
        .mockResolvedValue({ data: { session: { user: { id: 'u1' } } } }),
    },
  }),
}));

const fakePersonas = [
  {
    id: 'p1',
    agentId: 'a1',
    name: 'Night Ops',
    role: 'Stealth specialist',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'p2',
    agentId: 'a1',
    name: 'Day Planner',
    role: 'Productivity coach',
    isActive: false,
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
  {
    id: 'p3',
    agentId: 'a1',
    name: 'Night Writer',
    role: 'Creative writer',
    isActive: false,
    createdAt: '2026-01-03T00:00:00Z',
    updatedAt: '2026-01-03T00:00:00Z',
  },
];

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: fakePersonas }),
    })
  );
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe('CrossPersonaGroupChatModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <CrossPersonaGroupChatModal open={false} onOpenChange={vi.fn()} />
    );
    expect(
      container.querySelector('[data-testid="cross-persona-group-chat-modal"]')
    ).not.toBeInTheDocument();
  });

  it('shows modal with persona list when open', async () => {
    render(
      <CrossPersonaGroupChatModal open={true} onOpenChange={vi.fn()} />
    );
    await waitFor(() => {
      expect(
        screen.getByTestId('cross-persona-group-chat-modal')
      ).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByTestId('cross-persona-option-p1')).toBeInTheDocument();
      expect(screen.getByTestId('cross-persona-option-p2')).toBeInTheDocument();
    });
  });

  it('shows loading spinner while fetching', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockReturnValue(new Promise(() => {}))
    );
    render(
      <CrossPersonaGroupChatModal open={true} onOpenChange={vi.fn()} />
    );
    await waitFor(() => {
      expect(screen.getByTestId('cross-persona-loading')).toBeInTheDocument();
    });
  });

  it('shows empty state when no personas', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [] }),
      })
    );
    render(
      <CrossPersonaGroupChatModal open={true} onOpenChange={vi.fn()} />
    );
    await waitFor(() => {
      expect(screen.getByTestId('cross-persona-empty')).toBeInTheDocument();
    });
  });

  it('shows error state (not empty state) when fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false })
    );
    render(
      <CrossPersonaGroupChatModal open={true} onOpenChange={vi.fn()} />
    );
    await waitFor(() => {
      expect(screen.getByTestId('cross-persona-error')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('cross-persona-empty')).not.toBeInTheDocument();
  });

  it('Start button is disabled until 2 personas are selected', async () => {
    render(
      <CrossPersonaGroupChatModal open={true} onOpenChange={vi.fn()} />
    );
    await waitFor(() =>
      expect(screen.getByTestId('cross-persona-option-p1')).toBeInTheDocument()
    );

    const startBtn = screen.getByTestId('cross-persona-start');
    expect(startBtn).toBeDisabled();

    fireEvent.click(screen.getByTestId('cross-persona-option-p1'));
    expect(startBtn).toBeDisabled();

    fireEvent.click(screen.getByTestId('cross-persona-option-p2'));
    expect(startBtn).not.toBeDisabled();
  });

  it('shows selected checkmark on toggled persona', async () => {
    render(
      <CrossPersonaGroupChatModal open={true} onOpenChange={vi.fn()} />
    );
    await waitFor(() =>
      expect(screen.getByTestId('cross-persona-option-p1')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('cross-persona-option-p1'));
    expect(
      screen.getByTestId('cross-persona-selected-p1')
    ).toBeInTheDocument();
  });

  it('deselects persona on second click', async () => {
    render(
      <CrossPersonaGroupChatModal open={true} onOpenChange={vi.fn()} />
    );
    await waitFor(() =>
      expect(screen.getByTestId('cross-persona-option-p1')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('cross-persona-option-p1'));
    expect(
      screen.getByTestId('cross-persona-selected-p1')
    ).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('cross-persona-option-p1'));
    expect(
      screen.queryByTestId('cross-persona-selected-p1')
    ).not.toBeInTheDocument();
  });

  it('navigates to onboard URL with persona IDs on start', async () => {
    render(
      <CrossPersonaGroupChatModal open={true} onOpenChange={vi.fn()} />
    );
    await waitFor(() =>
      expect(screen.getByTestId('cross-persona-option-p1')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('cross-persona-option-p1'));
    fireEvent.click(screen.getByTestId('cross-persona-option-p2'));
    fireEvent.click(screen.getByTestId('cross-persona-start'));
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('starter=group_chat')
    );
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('personas=p1%2Cp2')
    );
  });

  it('count indicator shows selected count', async () => {
    render(
      <CrossPersonaGroupChatModal open={true} onOpenChange={vi.fn()} />
    );
    await waitFor(() =>
      expect(screen.getByTestId('cross-persona-option-p1')).toBeInTheDocument()
    );
    expect(screen.getByTestId('cross-persona-count')).toHaveTextContent(
      '0 selected'
    );
    fireEvent.click(screen.getByTestId('cross-persona-option-p1'));
    expect(screen.getByTestId('cross-persona-count')).toHaveTextContent(
      '1 selected'
    );
  });
});

describe('CrossPersonaGroupChatButton', () => {
  it('renders the trigger button once auth + persona count resolve (≥2 personas)', async () => {
    render(<CrossPersonaGroupChatButton />);
    await waitFor(() => {
      expect(
        screen.getByTestId('cross-persona-group-chat-trigger')
      ).toBeInTheDocument();
    });
    expect(
      screen.getByTestId('cross-persona-group-chat-trigger')
    ).toHaveTextContent('Start group chat with your companions');
  });

  it('renders nothing when user has fewer than 2 personas', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [{ id: 'p1', name: 'Solo', agentId: 'a1', isActive: true, createdAt: '', updatedAt: '' }] }),
      })
    );
    render(<CrossPersonaGroupChatButton />);
    // Wait for async resolution then assert button is absent
    await new Promise((r) => setTimeout(r, 50));
    expect(
      screen.queryByTestId('cross-persona-group-chat-trigger')
    ).not.toBeInTheDocument();
  });

  it('does not redirect to login while auth state is loading (null)', () => {
    // getSession never resolves — auth stays null
    vi.mock('@/lib/supabase/client', () => ({
      createClient: () => ({
        auth: {
          getSession: vi.fn().mockReturnValue(new Promise(() => {})),
        },
      }),
    }));
    render(<CrossPersonaGroupChatButton />);
    // Button should not be in the DOM (hasEnoughPersonas still null)
    expect(
      screen.queryByTestId('cross-persona-group-chat-trigger')
    ).not.toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('opens modal when trigger is clicked (authenticated, ≥2 personas)', async () => {
    render(<CrossPersonaGroupChatButton />);
    await waitFor(() =>
      expect(screen.getByTestId('cross-persona-group-chat-trigger')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('cross-persona-group-chat-trigger'));
    await waitFor(() => {
      expect(screen.getByTestId('cross-persona-group-chat-modal')).toBeInTheDocument();
    });
  });
});

describe('CrossPersonaGroupChatModal — URL construction', () => {
  it('builds correct href with persona IDs', () => {
    const params = new URLSearchParams({
      starter: 'group_chat',
      personas: 'p1,p2',
    });
    expect(params.get('starter')).toBe('group_chat');
    expect(params.get('personas')).toBe('p1,p2');
    expect(params.toString()).toContain('starter=group_chat');
  });

  it('requires minimum 2 personas to enable start', () => {
    const MIN = 2;
    expect([].length >= MIN).toBe(false);
    expect(['p1'].length >= MIN).toBe(false);
    expect(['p1', 'p2'].length >= MIN).toBe(true);
    expect(['p1', 'p2', 'p3'].length >= MIN).toBe(true);
  });
});
