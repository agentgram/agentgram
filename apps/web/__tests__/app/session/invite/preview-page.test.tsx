import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock @agentgram/db before importing the page
const mockSelect = vi.fn();
const mockIn = vi.fn();
const mockEq = vi.fn();

vi.mock('@agentgram/db', () => ({
  getSupabaseServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: mockSelect,
    })),
  })),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...rest
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => <img src={src} alt={alt} />,
}));

// Mock GroupMemoryIsolationPreview (client component)
vi.mock('@/components/agents/GroupMemoryIsolationPreview', () => ({
  GroupMemoryIsolationPreview: ({
    anchorAgent,
    companions,
  }: {
    anchorAgent: { id: string; name: string };
    companions: Array<{ id: string; name: string }>;
  }) => (
    <div data-testid="group-memory-isolation-preview">
      <span data-testid="mock-anchor">{anchorAgent.name}</span>
      {companions.map((c) => (
        <span key={c.id} data-testid={`mock-companion-${c.id}`}>
          {c.name}
        </span>
      ))}
    </div>
  ),
}));

import SessionInvitePreviewPage from '@/app/session/invite/[token]/page';
import { generateGroupChatInviteToken } from '@/lib/group-chat-invite';

function makeParams(token: string): Promise<{ token: string }> {
  return Promise.resolve({ token });
}

function setupDbMock(agents: Array<{ name: string; display_name: string | null; description: string | null; avatar_url: string | null; status: string }>) {
  mockEq.mockResolvedValue({ data: agents, error: null });
  mockIn.mockReturnValue({ eq: mockEq });
  mockSelect.mockReturnValue({ in: mockIn });
}

describe('SessionInvitePreviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEq.mockResolvedValue({ data: [], error: null });
    mockIn.mockReturnValue({ eq: mockEq });
    mockSelect.mockReturnValue({ in: mockIn });
  });

  it('shows error state for an invalid token', async () => {
    const page = await SessionInvitePreviewPage({ params: makeParams('not-a-valid-token!!!') });
    render(page);
    expect(screen.getByTestId('invite-error-state')).toBeInTheDocument();
  });

  it('renders invite-landing container for a valid token', async () => {
    const token = generateGroupChatInviteToken({ agentIds: ['nova', 'aria'] });
    setupDbMock([]);
    const page = await SessionInvitePreviewPage({ params: makeParams(token) });
    render(page);
    expect(screen.getByTestId('invite-landing')).toBeInTheDocument();
  });

  it('renders agent cards for each agentId in the token', async () => {
    const token = generateGroupChatInviteToken({ agentIds: ['nova', 'aria'] });
    setupDbMock([
      { name: 'nova', display_name: 'Nova AI', description: 'A helpful assistant.', avatar_url: null, status: 'active' },
      { name: 'aria', display_name: 'Aria', description: 'Creative companion.', avatar_url: null, status: 'active' },
    ]);
    const page = await SessionInvitePreviewPage({ params: makeParams(token) });
    render(page);
    expect(screen.getByTestId('invite-preview-agent-nova')).toBeInTheDocument();
    expect(screen.getByTestId('invite-preview-agent-aria')).toBeInTheDocument();
  });

  it('shows the session name when present in the token', async () => {
    const token = generateGroupChatInviteToken({ agentIds: ['nova'], sessionName: 'Creative Hub' });
    setupDbMock([]);
    const page = await SessionInvitePreviewPage({ params: makeParams(token) });
    render(page);
    expect(screen.getByTestId('invite-heading')).toHaveTextContent('Creative Hub');
  });

  it('renders memory isolation section when 2+ agents are present', async () => {
    const token = generateGroupChatInviteToken({ agentIds: ['nova', 'aria'] });
    setupDbMock([]);
    const page = await SessionInvitePreviewPage({ params: makeParams(token) });
    render(page);
    expect(screen.getByTestId('invite-memory-isolation-section')).toBeInTheDocument();
    expect(screen.getByTestId('group-memory-isolation-preview')).toBeInTheDocument();
  });

  it('renders join CTA with correct href pointing to /group-chat/invite/{token}', async () => {
    const token = generateGroupChatInviteToken({ agentIds: ['nova', 'aria'] });
    setupDbMock([]);
    const page = await SessionInvitePreviewPage({ params: makeParams(token) });
    render(page);
    const cta = screen.getByTestId('invite-join-cta');
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', `/group-chat/invite/${token}`);
  });

  it('does NOT show memory isolation section for a single agent', async () => {
    const token = generateGroupChatInviteToken({ agentIds: ['nova'] });
    setupDbMock([
      { name: 'nova', display_name: 'Nova AI', description: 'A helper.', avatar_url: null, status: 'active' },
    ]);
    const page = await SessionInvitePreviewPage({ params: makeParams(token) });
    render(page);
    expect(screen.queryByTestId('invite-memory-isolation-section')).not.toBeInTheDocument();
  });

  it('shows generic invite state for a token with no agents', async () => {
    const token = generateGroupChatInviteToken({ agentIds: [] });
    const page = await SessionInvitePreviewPage({ params: makeParams(token) });
    render(page);
    expect(screen.getByTestId('invite-landing')).toBeInTheDocument();
    expect(screen.queryByTestId('invite-agent-list')).not.toBeInTheDocument();
  });

  it('falls back to placeholder card when agent is not found in DB', async () => {
    const token = generateGroupChatInviteToken({ agentIds: ['ghost-agent'] });
    // DB returns empty — agent not found
    setupDbMock([]);
    const page = await SessionInvitePreviewPage({ params: makeParams(token) });
    render(page);
    // Card should still render with testid, showing @ghost-agent
    const card = screen.getByTestId('invite-preview-agent-ghost-agent');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('@ghost-agent');
  });
});
