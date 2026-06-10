import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Header from '@/components/common/Header';

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

vi.mock('@/components/auth/AuthButton', () => ({
  AuthButton: () => <div data-testid="auth-button" />,
}));

vi.mock('@/components/common/NotificationBell', () => ({
  NotificationBell: () => <div data-testid="notification-bell" />,
}));

vi.mock('@/components/common/MultiPersonaSwitcher', () => ({
  MultiPersonaSwitcher: () => <div data-testid="multi-persona-switcher" />,
}));

vi.mock('@/components/icons/GithubIcon', () => ({
  GithubIcon: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} data-testid="github-icon" />
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    variant?: string;
    size?: string;
  }) => <button {...props}>{children}</button>,
}));

vi.mock('@/lib/env', () => ({
  getBaseUrl: () => 'http://localhost:3000',
}));

vi.mock('@/lib/format-date', () => ({
  formatTimeAgo: (date: string) => {
    void date;
    return '2 hours ago';
  },
}));

const MOCK_STATS = {
  success: true,
  data: {
    agents: { total: 1234 },
    posts: { total: 5678 },
    activity: { lastPostAt: '2026-06-10T19:00:00Z' },
  },
};

function mockFetchSuccess() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(MOCK_STATS), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )
  );
}

function mockFetchFailure() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(null, { status: 500 }))
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('Header', () => {
  it('renders nav links', async () => {
    mockFetchFailure();
    render(await Header({ githubUrl: 'https://github.com/example/repo' }));

    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Agents')).toBeInTheDocument();
    expect(screen.getByText('Docs')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
  });

  it('renders stats pill with agents, posts, and Last post prefix when stats available', async () => {
    mockFetchSuccess();
    render(await Header({ githubUrl: 'https://github.com/example/repo' }));

    expect(screen.getByText('1,234 agents')).toBeInTheDocument();
    expect(screen.getByText('5,678 posts')).toBeInTheDocument();
    expect(screen.getByText('Last post 2 hours ago')).toBeInTheDocument();
  });

  it('does not render stats pill when fetch fails', async () => {
    mockFetchFailure();
    render(await Header({ githubUrl: 'https://github.com/example/repo' }));

    expect(screen.queryByText(/agents/)).not.toBeInTheDocument();
    expect(screen.queryByText(/posts/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Last post/)).not.toBeInTheDocument();
  });

  it('omits Last post segment when lastPostAt is null', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              agents: { total: 42 },
              posts: { total: 100 },
              activity: { lastPostAt: null },
            },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      )
    );
    render(await Header({ githubUrl: 'https://github.com/example/repo' }));

    expect(screen.getByText('42 agents')).toBeInTheDocument();
    expect(screen.queryByText(/Last post/)).not.toBeInTheDocument();
  });

  it('renders GitHub link with provided URL', async () => {
    mockFetchFailure();
    render(
      await Header({ githubUrl: 'https://github.com/agentgram/agentgram' })
    );

    const githubLink = screen.getByRole('link', { name: /Star on GitHub/i });
    expect(githubLink).toHaveAttribute(
      'href',
      'https://github.com/agentgram/agentgram'
    );
  });
});
