import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { WebAwareFilter } from '../../components/agents/WebAwareFilter';
import { WebSearchTimestamp } from '../../components/agents/WebSearchTimestamp';
import { AgentWebCapabilityBadge } from '../../components/agents/AgentWebCapabilityBadge';
import { AgentCard } from '../../components/agents/AgentCard';

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

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} alt={props.alt ?? ''} />
  ),
}));

vi.mock('../../components/ui/button', () => ({
  Button: ({
    children,
    asChild,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    asChild?: boolean;
    variant?: string;
    size?: string;
  }) => {
    if (asChild && React.isValidElement(children)) {
      return children;
    }
    return <button {...props}>{children}</button>;
  },
}));

describe('AgentWebCapabilityBadge', () => {
  it('renders with "Web-aware" label and testid', () => {
    render(<AgentWebCapabilityBadge />);

    expect(screen.getByTestId('agent-web-capability-badge')).toBeInTheDocument();
    expect(screen.getByTestId('agent-web-capability-badge')).toHaveTextContent(
      'Web-aware'
    );
  });

  it('applies custom className', () => {
    render(<AgentWebCapabilityBadge className="custom-class" />);

    expect(screen.getByTestId('agent-web-capability-badge')).toHaveClass(
      'custom-class'
    );
  });
});

describe('WebAwareFilter', () => {
  it('renders as a link with correct href and testid', () => {
    render(<WebAwareFilter enabled={false} href="/agents?web=true" />);

    const link = screen.getByTestId('agents-filter-chip-web');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/agents?web=true');
  });

  it('sets aria-pressed=true when enabled', () => {
    render(<WebAwareFilter enabled href="/agents" />);

    expect(screen.getByTestId('agents-filter-chip-web')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('sets aria-pressed=false when not enabled', () => {
    render(<WebAwareFilter enabled={false} href="/agents?web=true" />);

    expect(screen.getByTestId('agents-filter-chip-web')).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('includes the Web-aware label text', () => {
    render(<WebAwareFilter enabled={false} href="/agents?web=true" />);

    expect(screen.getByTestId('agents-filter-chip-web')).toHaveTextContent(
      'Web-aware'
    );
  });
});

describe('WebSearchTimestamp', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-10T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows AgentWebCapabilityBadge when no lastWebSearch is provided', () => {
    render(<WebSearchTimestamp />);

    expect(screen.getByTestId('agent-web-capability-badge')).toBeInTheDocument();
    expect(screen.queryByTestId('agent-web-search-timestamp')).not.toBeInTheDocument();
  });

  it('shows timestamp when lastWebSearch is provided', () => {
    render(
      <WebSearchTimestamp lastWebSearch="2026-06-10T10:00:00.000Z" />
    );

    expect(screen.getByTestId('agent-web-search-timestamp')).toBeInTheDocument();
    expect(screen.getByTestId('agent-web-search-timestamp')).toHaveTextContent(
      'Last web search: 2 hours ago'
    );
  });

  it('shows "just now" for searches under an hour ago', () => {
    render(
      <WebSearchTimestamp lastWebSearch="2026-06-10T11:45:00.000Z" />
    );

    expect(screen.getByTestId('agent-web-search-timestamp')).toHaveTextContent(
      'Last web search: just now'
    );
  });

  it('shows singular "1 hour ago" for searches exactly one hour old', () => {
    render(
      <WebSearchTimestamp lastWebSearch="2026-06-10T11:00:00.000Z" />
    );

    expect(screen.getByTestId('agent-web-search-timestamp')).toHaveTextContent(
      'Last web search: 1 hour ago'
    );
  });

  it('shows day count for searches over 24 hours old', () => {
    render(
      <WebSearchTimestamp lastWebSearch="2026-06-08T12:00:00.000Z" />
    );

    expect(screen.getByTestId('agent-web-search-timestamp')).toHaveTextContent(
      'Last web search: 2 days ago'
    );
  });
});

describe('AgentCard web capability row', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-10T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders web search row when capabilities.web is true', () => {
    render(
      <AgentCard
        agent={{
          id: 'agent-web-1',
          name: 'web-searcher',
          axp: 500,
          capabilities: {
            voice: false,
            video: false,
            image: false,
            web: true,
            group_chat: false,
            roleplay: false,
          },
        }}
      />
    );

    expect(screen.getByTestId('agent-card-web-search-row')).toBeInTheDocument();
  });

  it('does not render web search row when capabilities.web is false', () => {
    render(
      <AgentCard
        agent={{
          id: 'agent-no-web',
          name: 'no-web-agent',
          axp: 200,
          capabilities: {
            voice: false,
            video: false,
            image: false,
            web: false,
            group_chat: false,
            roleplay: false,
          },
        }}
      />
    );

    expect(
      screen.queryByTestId('agent-card-web-search-row')
    ).not.toBeInTheDocument();
  });

  it('shows last web search timestamp when lastWebSearch is provided', () => {
    render(
      <AgentCard
        agent={{
          id: 'agent-web-ts',
          name: 'web-ts-agent',
          axp: 800,
          capabilities: {
            voice: false,
            video: false,
            image: false,
            web: true,
            group_chat: false,
            roleplay: false,
          },
          lastWebSearch: '2026-06-10T10:00:00.000Z',
        }}
      />
    );

    expect(screen.getByTestId('agent-web-search-timestamp')).toHaveTextContent(
      'Last web search: 2 hours ago'
    );
  });
});
