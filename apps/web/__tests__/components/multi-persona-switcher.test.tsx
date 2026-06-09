import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MultiPersonaSwitcher } from '../../components/common/MultiPersonaSwitcher';

// --- Supabase client mock ---
const mockGetSession = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getSession: mockGetSession },
  }),
}));

// --- React Query mock ---
const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();
vi.mock('@tanstack/react-query', () => ({
  useQuery: (opts: { queryFn: () => unknown; enabled?: boolean }) =>
    mockUseQuery(opts),
  useMutation: (opts: unknown) => mockUseMutation(opts),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

// --- next/link mock ---
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
  }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
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
];

describe('MultiPersonaSwitcher', () => {
  const mutateMock = vi.fn();

  beforeEach(() => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } });
    mockUseQuery.mockReturnValue({ data: fakePersonas, isLoading: false });
    mockUseMutation.mockReturnValue({
      mutate: mutateMock,
      isPending: false,
      variables: undefined,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the trigger button when authenticated', async () => {
    render(<MultiPersonaSwitcher />);
    await waitFor(() => {
      expect(
        screen.getByTestId('persona-switcher-trigger')
      ).toBeInTheDocument();
    });
  });

  it('returns null when not authenticated', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    const { container } = render(<MultiPersonaSwitcher />);
    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });

  it('shows the active persona name in the trigger', async () => {
    render(<MultiPersonaSwitcher />);
    await waitFor(() => {
      expect(screen.getByTestId('active-persona-label')).toHaveTextContent(
        'Night Ops'
      );
    });
  });

  it('opens the panel when trigger is clicked', async () => {
    render(<MultiPersonaSwitcher />);
    await waitFor(() =>
      expect(screen.getByTestId('persona-switcher-trigger')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('persona-switcher-trigger'));
    expect(screen.getByTestId('persona-switcher-panel')).toBeInTheDocument();
  });

  it('lists all personas in the panel', async () => {
    render(<MultiPersonaSwitcher />);
    await waitFor(() =>
      expect(screen.getByTestId('persona-switcher-trigger')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('persona-switcher-trigger'));
    expect(screen.getByTestId('persona-item-p1')).toBeInTheDocument();
    expect(screen.getByTestId('persona-item-p2')).toBeInTheDocument();
  });

  it('shows active checkmark on the active persona', async () => {
    render(<MultiPersonaSwitcher />);
    await waitFor(() =>
      expect(screen.getByTestId('persona-switcher-trigger')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('persona-switcher-trigger'));
    expect(screen.getByTestId('persona-active-check-p1')).toBeInTheDocument();
    expect(
      screen.queryByTestId('persona-active-check-p2')
    ).not.toBeInTheDocument();
  });

  it('calls activate mutation when an inactive persona is clicked', async () => {
    render(<MultiPersonaSwitcher />);
    await waitFor(() =>
      expect(screen.getByTestId('persona-switcher-trigger')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('persona-switcher-trigger'));
    fireEvent.click(screen.getByTestId('persona-item-p2'));
    expect(mutateMock).toHaveBeenCalledWith('p2', expect.any(Object));
  });

  it('shows "Create new persona" CTA linking to dashboard/settings', async () => {
    render(<MultiPersonaSwitcher />);
    await waitFor(() =>
      expect(screen.getByTestId('persona-switcher-trigger')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('persona-switcher-trigger'));
    const cta = screen.getByTestId('create-persona-cta');
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/dashboard/settings');
  });

  it('shows loading spinner while fetching personas', async () => {
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: true });
    render(<MultiPersonaSwitcher />);
    await waitFor(() =>
      expect(screen.getByTestId('persona-switcher-trigger')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('persona-switcher-trigger'));
    expect(screen.getByTestId('persona-switcher-loading')).toBeInTheDocument();
  });

  it('shows empty state when no personas exist', async () => {
    mockUseQuery.mockReturnValue({ data: [], isLoading: false });
    render(<MultiPersonaSwitcher />);
    await waitFor(() =>
      expect(screen.getByTestId('persona-switcher-trigger')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('persona-switcher-trigger'));
    expect(screen.getByText('No personas yet')).toBeInTheDocument();
  });

  it('closes the panel when backdrop is clicked', async () => {
    render(<MultiPersonaSwitcher />);
    await waitFor(() =>
      expect(screen.getByTestId('persona-switcher-trigger')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('persona-switcher-trigger'));
    expect(screen.getByTestId('persona-switcher-panel')).toBeInTheDocument();
    // Click backdrop (first fixed-inset button rendered before the panel)
    const backdrop = screen
      .getAllByRole('button')
      .find((el) => el.className.includes('fixed'));
    if (backdrop) fireEvent.click(backdrop);
    expect(
      screen.queryByTestId('persona-switcher-panel')
    ).not.toBeInTheDocument();
  });
});
