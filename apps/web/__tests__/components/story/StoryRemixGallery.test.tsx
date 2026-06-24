import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StoryRemixGallery } from '@/components/story/StoryRemixGallery';
import type { StoryRemix } from '@agentgram/shared';

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

const REMIX_A: StoryRemix = {
  id: 'remix-1',
  agentId: 'agent-42',
  title: 'The Pirate AU',
  description: 'What if they were a high-seas buccaneer instead?',
  authorId: 'user-1',
  authorName: 'SailorMoon99',
  createdAt: '2026-05-01T00:00:00.000Z',
  chatCount: 142,
};

const REMIX_B: StoryRemix = {
  id: 'remix-2',
  agentId: 'agent-42',
  title: 'Cyberpunk Variant',
  description: 'Neon-lit streets and neural implants.',
  authorId: 'user-2',
  authorName: 'NeonKnight',
  createdAt: '2026-05-10T00:00:00.000Z',
  chatCount: 0,
};

function mockFetchSuccess(remixes: StoryRemix[], total?: number) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { remixes, total: total ?? remixes.length, page: 1, limit: 20 },
      }),
    })
  );
}

function mockFetchEmpty() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { remixes: [], total: 0, page: 1, limit: 20 },
      }),
    })
  );
}

function mockFetchError() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
      }),
    })
  );
}

describe('StoryRemixGallery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the gallery section with aria-label', async () => {
    mockFetchEmpty();
    render(<StoryRemixGallery agentId="agent-42" agentName="ghost-writer" />);
    await waitFor(() =>
      expect(screen.getByTestId('story-remix-gallery')).toBeInTheDocument()
    );
    expect(
      screen.getByRole('region', { name: 'AU remix variants' })
    ).toBeInTheDocument();
  });

  it('shows empty state message when no remixes exist', async () => {
    mockFetchEmpty();
    render(<StoryRemixGallery agentId="agent-42" agentName="ghost-writer" />);
    await waitFor(() =>
      expect(screen.getByTestId('remix-empty-state')).toBeInTheDocument()
    );
    expect(screen.getByTestId('remix-empty-state')).toHaveTextContent(
      'No remixes yet — be the first to create one.'
    );
  });

  it('renders the section heading', async () => {
    mockFetchEmpty();
    render(<StoryRemixGallery agentId="agent-42" agentName="ghost-writer" />);
    await waitFor(() =>
      expect(screen.getByTestId('story-remix-gallery')).toBeInTheDocument()
    );
    expect(screen.getByText('Community remixes')).toBeInTheDocument();
  });

  it('renders a remix card with title', async () => {
    mockFetchSuccess([REMIX_A]);
    render(<StoryRemixGallery agentId="agent-42" agentName="ghost-writer" />);
    await waitFor(() =>
      expect(screen.getByTestId('remix-title-remix-1')).toBeInTheDocument()
    );
    expect(screen.getByTestId('remix-title-remix-1')).toHaveTextContent(
      'The Pirate AU'
    );
  });

  it('renders a remix card with description', async () => {
    mockFetchSuccess([REMIX_A]);
    render(<StoryRemixGallery agentId="agent-42" agentName="ghost-writer" />);
    await waitFor(() =>
      expect(screen.getByTestId('remix-description-remix-1')).toBeInTheDocument()
    );
    expect(screen.getByTestId('remix-description-remix-1')).toHaveTextContent(
      'What if they were a high-seas buccaneer instead?'
    );
  });

  it('renders the author name on each card', async () => {
    mockFetchSuccess([REMIX_A]);
    render(<StoryRemixGallery agentId="agent-42" agentName="ghost-writer" />);
    await waitFor(() =>
      expect(screen.getByTestId('remix-author-remix-1')).toBeInTheDocument()
    );
    expect(screen.getByTestId('remix-author-remix-1')).toHaveTextContent(
      'SailorMoon99'
    );
  });

  it('renders the chat count on each card', async () => {
    mockFetchSuccess([REMIX_A]);
    render(<StoryRemixGallery agentId="agent-42" agentName="ghost-writer" />);
    await waitFor(() =>
      expect(screen.getByTestId('remix-chat-count-remix-1')).toBeInTheDocument()
    );
    expect(screen.getByTestId('remix-chat-count-remix-1')).toHaveTextContent(
      '142 chats'
    );
  });

  it('renders "Chat with this version" CTA with correct href', async () => {
    mockFetchSuccess([REMIX_A]);
    render(<StoryRemixGallery agentId="agent-42" agentName="ghost-writer" />);
    await waitFor(() =>
      expect(screen.getByTestId('remix-cta-remix-1')).toBeInTheDocument()
    );
    const cta = screen.getByTestId('remix-cta-remix-1');
    expect(cta).toHaveTextContent('Chat with this version');
    expect(cta).toHaveAttribute(
      'href',
      '/agents/ghost-writer/chat?remix=remix-1'
    );
  });

  it('uses agentName in CTA href', async () => {
    mockFetchSuccess([REMIX_A]);
    render(<StoryRemixGallery agentId="agent-42" agentName="my-special-agent" />);
    await waitFor(() =>
      expect(screen.getByTestId('remix-cta-remix-1')).toBeInTheDocument()
    );
    expect(screen.getByTestId('remix-cta-remix-1')).toHaveAttribute(
      'href',
      '/agents/my-special-agent/chat?remix=remix-1'
    );
  });

  it('renders multiple remix cards', async () => {
    mockFetchSuccess([REMIX_A, REMIX_B]);
    render(<StoryRemixGallery agentId="agent-42" agentName="ghost-writer" />);
    await waitFor(() =>
      expect(screen.getByTestId('remix-card-remix-1')).toBeInTheDocument()
    );
    expect(screen.getByTestId('remix-card-remix-1')).toBeInTheDocument();
    expect(screen.getByTestId('remix-card-remix-2')).toBeInTheDocument();
  });

  it('renders loading indicator while fetching', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));
    render(<StoryRemixGallery agentId="agent-42" agentName="ghost-writer" />);
    expect(screen.getByTestId('remix-loading')).toBeInTheDocument();
  });

  it('renders error message when fetch fails', async () => {
    mockFetchError();
    render(<StoryRemixGallery agentId="agent-42" agentName="ghost-writer" />);
    await waitFor(() =>
      expect(screen.getByTestId('remix-error')).toBeInTheDocument()
    );
    expect(screen.getByTestId('remix-error')).toHaveTextContent(
      'Something went wrong'
    );
  });

  it('calls fetch with the correct remixes URL', async () => {
    mockFetchSuccess([]);
    render(<StoryRemixGallery agentId="agent-99" agentName="ghost-writer" />);
    await waitFor(() =>
      expect(
        (vi.mocked(fetch) as ReturnType<typeof vi.fn>).mock.calls.length
      ).toBeGreaterThan(0)
    );
    const calledUrl = (vi.mocked(fetch) as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as string;
    expect(calledUrl).toContain('/api/v1/agents/agent-99/remixes');
  });

  it('renders remix list container when remixes are present', async () => {
    mockFetchSuccess([REMIX_A, REMIX_B]);
    render(<StoryRemixGallery agentId="agent-42" agentName="ghost-writer" />);
    await waitFor(() =>
      expect(screen.getByTestId('remix-list')).toBeInTheDocument()
    );
  });
});
