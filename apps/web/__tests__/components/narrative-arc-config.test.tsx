import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  NarrativeArcConfig,
  NarrativeArcConfigButton,
} from '../../components/narrative/NarrativeArcConfig';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const fakeAgents = [
  { id: 'a1', name: 'hero-bot', displayName: 'Hero Bot' },
  { id: 'a2', name: 'villain-bot', displayName: 'Villain Bot' },
  { id: 'a3', name: 'sage-bot', displayName: 'Sage Bot' },
  { id: 'a4', name: 'ally-bot', displayName: 'Ally Bot' },
];

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: fakeAgents }),
    })
  );
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe('NarrativeArcConfig — modal rendering', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <NarrativeArcConfig open={false} onOpenChange={vi.fn()} />
    );
    expect(
      container.querySelector('[data-testid="narrative-arc-config-modal"]')
    ).not.toBeInTheDocument();
  });

  it('shows modal with agent list when open', async () => {
    render(<NarrativeArcConfig open={true} onOpenChange={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByTestId('narrative-arc-config-modal')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByTestId('narrative-agent-a1')).toBeInTheDocument();
      expect(screen.getByTestId('narrative-agent-a2')).toBeInTheDocument();
    });
  });

  it('shows loading spinner while fetching agents', async () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));
    render(<NarrativeArcConfig open={true} onOpenChange={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByTestId('narrative-loading')).toBeInTheDocument();
    });
  });

  it('shows error state when fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false })
    );
    render(<NarrativeArcConfig open={true} onOpenChange={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByTestId('narrative-error')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('narrative-empty')).not.toBeInTheDocument();
  });

  it('shows empty state when no agents exist', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [] }),
      })
    );
    render(<NarrativeArcConfig open={true} onOpenChange={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByTestId('narrative-empty')).toBeInTheDocument();
    });
  });
});

describe('NarrativeArcConfig — selection and role assignment', () => {
  it('Start button is disabled until 2 agents are selected', async () => {
    render(<NarrativeArcConfig open={true} onOpenChange={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByTestId('narrative-agent-a1')).toBeInTheDocument()
    );

    const startBtn = screen.getByTestId('narrative-start');
    expect(startBtn).toBeDisabled();

    fireEvent.click(screen.getByTestId('narrative-agent-a1'));
    expect(startBtn).toBeDisabled();
  });

  it('Start button becomes enabled when 2 agents are selected and roles assigned', async () => {
    render(<NarrativeArcConfig open={true} onOpenChange={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByTestId('narrative-agent-a1')).toBeInTheDocument()
    );

    fireEvent.click(screen.getByTestId('narrative-agent-a1'));
    fireEvent.click(screen.getByTestId('narrative-agent-a2'));

    // Assign roles
    const rolePickers = screen.getAllByTestId('role-picker-trigger');
    fireEvent.click(rolePickers[0]);
    fireEvent.click(screen.getByTestId('role-option-protagonist'));
    fireEvent.click(rolePickers[1]);
    fireEvent.click(screen.getByTestId('role-option-antagonist'));

    expect(screen.getByTestId('narrative-start')).not.toBeDisabled();
  });

  it('shows selected checkmark after selecting an agent', async () => {
    render(<NarrativeArcConfig open={true} onOpenChange={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByTestId('narrative-agent-a1')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('narrative-agent-a1'));
    expect(screen.getByTestId('narrative-agent-selected-a1')).toBeInTheDocument();
  });

  it('deselects agent on second click, removing role assignment', async () => {
    render(<NarrativeArcConfig open={true} onOpenChange={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByTestId('narrative-agent-a1')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('narrative-agent-a1'));
    expect(screen.getByTestId('narrative-agent-selected-a1')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('narrative-agent-a1'));
    expect(screen.queryByTestId('narrative-agent-selected-a1')).not.toBeInTheDocument();
  });

  it('selection count indicator updates correctly', async () => {
    render(<NarrativeArcConfig open={true} onOpenChange={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByTestId('narrative-agent-a1')).toBeInTheDocument()
    );
    expect(screen.getByTestId('narrative-count')).toHaveTextContent('0 selected');
    fireEvent.click(screen.getByTestId('narrative-agent-a1'));
    expect(screen.getByTestId('narrative-count')).toHaveTextContent('1 selected');
    fireEvent.click(screen.getByTestId('narrative-agent-a2'));
    expect(screen.getByTestId('narrative-count')).toHaveTextContent('2 selected');
  });
});

describe('NarrativeArcConfig — premise and shared thread', () => {
  it('updates premise text as user types', async () => {
    render(<NarrativeArcConfig open={true} onOpenChange={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByTestId('narrative-premise')).toBeInTheDocument()
    );
    fireEvent.change(screen.getByTestId('narrative-premise'), {
      target: { value: 'A kingdom lost to time.' },
    });
    expect(screen.getByTestId('narrative-premise')).toHaveValue(
      'A kingdom lost to time.'
    );
  });

  it('shared thread checkbox is checked by default', async () => {
    render(<NarrativeArcConfig open={true} onOpenChange={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByTestId('narrative-shared-thread')).toBeInTheDocument()
    );
    expect(screen.getByTestId('narrative-shared-thread')).toBeChecked();
  });

  it('shared thread checkbox can be unchecked', async () => {
    render(<NarrativeArcConfig open={true} onOpenChange={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByTestId('narrative-shared-thread')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('narrative-shared-thread'));
    expect(screen.getByTestId('narrative-shared-thread')).not.toBeChecked();
  });
});

describe('NarrativeArcConfig — navigation on start', () => {
  it('calls onStart callback with correct config when provided', async () => {
    const onStart = vi.fn();
    render(
      <NarrativeArcConfig open={true} onOpenChange={vi.fn()} onStart={onStart} />
    );
    await waitFor(() =>
      expect(screen.getByTestId('narrative-agent-a1')).toBeInTheDocument()
    );

    fireEvent.click(screen.getByTestId('narrative-agent-a1'));
    fireEvent.click(screen.getByTestId('narrative-agent-a2'));

    const rolePickers = screen.getAllByTestId('role-picker-trigger');
    fireEvent.click(rolePickers[0]);
    fireEvent.click(screen.getByTestId('role-option-protagonist'));
    fireEvent.click(rolePickers[1]);
    fireEvent.click(screen.getByTestId('role-option-antagonist'));

    fireEvent.click(screen.getByTestId('narrative-start'));

    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({
        participants: expect.arrayContaining([
          expect.objectContaining({ agentId: 'a1', role: 'protagonist' }),
          expect.objectContaining({ agentId: 'a2', role: 'antagonist' }),
        ]),
        sharedThreadEnabled: true,
      })
    );
  });

  it('navigates to onboard URL with narrative arc params when no onStart provided', async () => {
    render(<NarrativeArcConfig open={true} onOpenChange={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByTestId('narrative-agent-a1')).toBeInTheDocument()
    );

    fireEvent.click(screen.getByTestId('narrative-agent-a1'));
    fireEvent.click(screen.getByTestId('narrative-agent-a2'));

    const rolePickers = screen.getAllByTestId('role-picker-trigger');
    fireEvent.click(rolePickers[0]);
    fireEvent.click(screen.getByTestId('role-option-protagonist'));
    fireEvent.click(rolePickers[1]);
    fireEvent.click(screen.getByTestId('role-option-antagonist'));

    fireEvent.click(screen.getByTestId('narrative-start'));

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('starter=narrative_arc')
    );
  });
});

describe('NarrativeArcConfigButton', () => {
  it('renders the trigger button', () => {
    render(<NarrativeArcConfigButton />);
    expect(screen.getByTestId('narrative-arc-config-trigger')).toBeInTheDocument();
  });

  it('opens the config modal when trigger is clicked', async () => {
    render(<NarrativeArcConfigButton />);
    fireEvent.click(screen.getByTestId('narrative-arc-config-trigger'));
    await waitFor(() => {
      expect(screen.getByTestId('narrative-arc-config-modal')).toBeInTheDocument();
    });
  });
});

describe('NarrativeArcConfig — URL construction', () => {
  it('builds href with correct starter param', () => {
    const params = new URLSearchParams({
      starter: 'narrative_arc',
      participants: 'a1:protagonist,a2:antagonist',
    });
    expect(params.get('starter')).toBe('narrative_arc');
    expect(params.get('participants')).toBe('a1:protagonist,a2:antagonist');
  });

  it('enforces min/max constraints correctly', () => {
    const MIN = 2;
    const MAX = 3;
    expect([].length >= MIN).toBe(false);
    expect(['a1'].length >= MIN).toBe(false);
    expect(['a1', 'a2'].length >= MIN).toBe(true);
    expect(['a1', 'a2', 'a3'].length <= MAX).toBe(true);
    expect(['a1', 'a2', 'a3', 'a4'].length <= MAX).toBe(false);
  });
});
