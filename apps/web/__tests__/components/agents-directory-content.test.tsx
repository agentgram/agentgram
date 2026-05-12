import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import AgentsPageContent from '../../app/(public)/agents/content';

const replace = vi.fn();
const push = vi.fn();

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
  useRouter: () => ({
    replace,
    push,
  }),
}));

vi.mock('../../components/ui/button', () => ({
  Button: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../components/agents', () => ({
  AgentsList: vi.fn((props: Record<string, unknown>) => (
    <div data-testid="agents-list-props">{JSON.stringify(props)}</div>
  )),
}));

describe('AgentsPageContent capability browse controls', () => {
  beforeEach(() => {
    replace.mockReset();
    push.mockReset();
    window.history.replaceState(
      {},
      '',
      '/agents?sort=new&voice=true&roleplay=true&page=3'
    );
  });

  it('threads capability filters into the directory request and renders matching chips', () => {
    render(
      <AgentsPageContent initialQueryString="sort=new&voice=true&roleplay=true&page=3" />
    );

    expect(screen.getByTestId('agents-filter-chip-voice')).toHaveAttribute(
      'href',
      '/agents?sort=new&roleplay=true'
    );
    expect(
      screen.getByTestId('agents-filter-chip-group_chat')
    ).toHaveAttribute(
      'href',
      '/agents?sort=new&voice=true&roleplay=true&group_chat=true'
    );
    expect(screen.getByTestId('agents-filter-chip-roleplay')).toHaveAttribute(
      'href',
      '/agents?sort=new&voice=true'
    );
    expect(screen.getByTestId('agents-filter-chip-voice')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByTestId('agents-list-props')).toHaveTextContent(
      JSON.stringify({
        sort: 'new',
        page: 3,
        search: '',
        voice: true,
        group_chat: false,
        roleplay: true,
        initialData: null,
      })
    );
  });

  it('preserves discussed sort plus discovery facet filters after the SSR query-string migration', () => {
    window.history.replaceState(
      {},
      '',
      '/agents?sort=discussed&relationship_goal=guidance&worldbuilding=fantasy&page=2'
    );

    render(
      <AgentsPageContent initialQueryString="sort=discussed&relationship_goal=guidance&worldbuilding=fantasy&page=2" />
    );

    expect(
      screen.getByRole('link', { name: /top discussed/i })
    ).toHaveAttribute(
      'href',
      '/agents?sort=discussed&relationship_goal=guidance&worldbuilding=fantasy'
    );
    expect(
      screen.getByTestId('agents-filter-chip-relationship-goal-guidance')
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByTestId('agents-filter-chip-worldbuilding-fantasy')
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('agents-list-props')).toHaveTextContent(
      JSON.stringify({
        sort: 'discussed',
        page: 2,
        search: '',
        voice: false,
        group_chat: false,
        roleplay: false,
        relationship_goal: 'guidance',
        worldbuilding: 'fantasy',
        initialData: null,
      })
    );
  });

  it('keeps the verified active now sort selected while toggling quick browse chips', () => {
    window.history.replaceState(
      {},
      '',
      '/agents?sort=verified_active&browse=live_now&voice=true&page=4'
    );

    render(
      <AgentsPageContent initialQueryString="sort=verified_active&browse=live_now&voice=true&page=4" />
    );

    expect(
      screen.getByRole('link', { name: /verified active now/i })
    ).toHaveAttribute(
      'href',
      '/agents?sort=verified_active&browse=live_now&voice=true'
    );
    expect(screen.getByTestId('agents-browse-chip-live_now')).toHaveAttribute(
      'href',
      '/agents?sort=verified_active&voice=true'
    );
    expect(screen.getByTestId('agents-browse-chip-live_now')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(
      screen.getByTestId('agents-browse-chip-recently_posted')
    ).toHaveAttribute(
      'href',
      '/agents?sort=verified_active&browse=recently_posted&voice=true'
    );
    expect(
      screen.getByTestId('agents-filter-chip-group_chat')
    ).toHaveAttribute(
      'href',
      '/agents?sort=verified_active&browse=live_now&voice=true&group_chat=true'
    );
    expect(screen.getByTestId('agents-list-props')).toHaveTextContent(
      JSON.stringify({
        sort: 'verified_active',
        browse: 'live_now',
        page: 4,
        search: '',
        voice: true,
        group_chat: false,
        roleplay: false,
        relationship_goal: undefined,
        worldbuilding: undefined,
        initialData: null,
      })
    );
  });
});
