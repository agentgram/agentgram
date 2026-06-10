import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TopicChannelRail } from '../../components/agents/TopicChannelRail';
import AgentsPageContent from '../../app/(public)/agents/content';

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

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock('../../components/agents/AgentsList', () => ({
  AgentsList: vi.fn((props: Record<string, unknown>) => (
    <div data-testid="agents-list-props">{JSON.stringify(props)}</div>
  )),
}));

vi.mock('../../components/ui/button', () => ({
  Button: ({
    children,
    asChild,
    ...props
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>) =>
    asChild ? <>{children}</> : <button {...props}>{children}</button>,
  buttonVariants: ({ variant }: { variant?: string; size?: string } = {}) =>
    `btn-${variant ?? 'default'}`,
}));

describe('TopicChannelRail', () => {
  const createHref = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams();
    Object.entries(updates).forEach(([k, v]) => {
      if (v !== null) params.set(k, v);
    });
    const qs = params.toString();
    return qs ? `/agents?${qs}` : '/agents';
  };

  it('renders the All chip and all topic channel chips', () => {
    render(<TopicChannelRail activeTopic={undefined} createHref={createHref} />);

    expect(screen.getByTestId('topic-chip-all')).toBeInTheDocument();
    expect(screen.getByTestId('topic-chip-companions')).toBeInTheDocument();
    expect(screen.getByTestId('topic-chip-storytellers')).toBeInTheDocument();
    expect(screen.getByTestId('topic-chip-productivity')).toBeInTheDocument();
    expect(screen.getByTestId('topic-chip-gaming')).toBeInTheDocument();
    expect(screen.getByTestId('topic-chip-creative')).toBeInTheDocument();
    expect(screen.getByTestId('topic-chip-romance')).toBeInTheDocument();
    expect(screen.getByTestId('topic-chip-voice')).toBeInTheDocument();
    expect(screen.getByTestId('topic-chip-group')).toBeInTheDocument();
  });

  it('marks the All chip as pressed when no topic is active', () => {
    render(<TopicChannelRail activeTopic={undefined} createHref={createHref} />);

    expect(screen.getByTestId('topic-chip-all')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByTestId('topic-chip-companions')).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('marks the correct chip as pressed when a topic is active', () => {
    render(
      <TopicChannelRail activeTopic="companions" createHref={createHref} />
    );

    expect(screen.getByTestId('topic-chip-all')).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(screen.getByTestId('topic-chip-companions')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByTestId('topic-chip-storytellers')).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('companions chip href includes relationship_goal=companionship and topic=companions', () => {
    render(<TopicChannelRail activeTopic={undefined} createHref={createHref} />);

    const href = screen
      .getByTestId('topic-chip-companions')
      .getAttribute('href');
    expect(href).toContain('topic=companions');
    expect(href).toContain('relationship_goal=companionship');
  });

  it('storytellers chip href includes worldbuilding=fantasy and roleplay=true', () => {
    render(<TopicChannelRail activeTopic={undefined} createHref={createHref} />);

    const href = screen
      .getByTestId('topic-chip-storytellers')
      .getAttribute('href');
    expect(href).toContain('topic=storytellers');
    expect(href).toContain('worldbuilding=fantasy');
    expect(href).toContain('roleplay=true');
  });

  it('productivity chip href includes relationship_goal=guidance', () => {
    render(<TopicChannelRail activeTopic={undefined} createHref={createHref} />);

    const href = screen
      .getByTestId('topic-chip-productivity')
      .getAttribute('href');
    expect(href).toContain('topic=productivity');
    expect(href).toContain('relationship_goal=guidance');
  });

  it('gaming chip href includes worldbuilding=contemporary and roleplay=true', () => {
    render(<TopicChannelRail activeTopic={undefined} createHref={createHref} />);

    const href = screen.getByTestId('topic-chip-gaming').getAttribute('href');
    expect(href).toContain('topic=gaming');
    expect(href).toContain('worldbuilding=contemporary');
    expect(href).toContain('roleplay=true');
  });

  it('All chip href clears all topic-related params', () => {
    render(<TopicChannelRail activeTopic="companions" createHref={createHref} />);

    expect(screen.getByTestId('topic-chip-all')).toHaveAttribute(
      'href',
      '/agents'
    );
  });

  it('voice chip href includes voice=true', () => {
    render(<TopicChannelRail activeTopic={undefined} createHref={createHref} />);

    const href = screen.getByTestId('topic-chip-voice').getAttribute('href');
    expect(href).toContain('topic=voice');
    expect(href).toContain('voice=true');
  });
});

describe('AgentsPageContent with topic channel', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/agents?topic=companions');
  });

  it('renders the topic channel rail', () => {
    render(
      <AgentsPageContent initialQueryString="topic=companions" />
    );

    expect(screen.getByTestId('topic-channel-rail')).toBeInTheDocument();
  });

  it('marks the companions chip as pressed when topic=companions is in the URL', () => {
    render(
      <AgentsPageContent initialQueryString="topic=companions" />
    );

    expect(screen.getByTestId('topic-chip-companions')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByTestId('topic-chip-all')).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('applies companions topic filters (relationship_goal=companionship) to AgentsList', () => {
    render(
      <AgentsPageContent initialQueryString="topic=companions" />
    );

    const propsEl = screen.getByTestId('agents-list-props');
    const props = JSON.parse(propsEl.textContent || '{}');
    expect(props.relationship_goal).toBe('companionship');
  });

  it('applies storytellers topic filters to AgentsList', () => {
    window.history.replaceState({}, '', '/agents?topic=storytellers');
    render(
      <AgentsPageContent initialQueryString="topic=storytellers" />
    );

    const propsEl = screen.getByTestId('agents-list-props');
    const props = JSON.parse(propsEl.textContent || '{}');
    expect(props.worldbuilding).toBe('fantasy');
    expect(props.roleplay).toBe(true);
  });

  it('applies voice topic filter to AgentsList', () => {
    window.history.replaceState({}, '', '/agents?topic=voice');
    render(<AgentsPageContent initialQueryString="topic=voice" />);

    const propsEl = screen.getByTestId('agents-list-props');
    const props = JSON.parse(propsEl.textContent || '{}');
    expect(props.voice).toBe(true);
  });

  it('shows topic channel rail even without active topic', () => {
    window.history.replaceState({}, '', '/agents');
    render(<AgentsPageContent />);

    expect(screen.getByTestId('topic-channel-rail')).toBeInTheDocument();
    expect(screen.getByTestId('topic-chip-all')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});
