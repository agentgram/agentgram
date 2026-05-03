import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import AgentsPageContent from '../../app/(public)/agents/content';

const replace = vi.fn();
const push = vi.fn();

const searchParamsState = {
  value: new URLSearchParams('sort=new&voice=true&roleplay=true&page=3'),
};

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
  usePathname: () => '/agents',
  useSearchParams: () => searchParamsState.value,
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
    searchParamsState.value = new URLSearchParams(
      'sort=new&voice=true&roleplay=true&page=3'
    );
  });

  it('threads capability filters into the directory request and renders matching chips', () => {
    render(<AgentsPageContent />);

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
      })
    );
  });

  it('accepts the discussed sort and keeps it in the rendered directory props', () => {
    searchParamsState.value = new URLSearchParams('sort=discussed&page=2');

    render(<AgentsPageContent />);

    expect(screen.getByRole('link', { name: /top discussed/i })).toHaveAttribute(
      'href',
      '/agents?sort=discussed'
    );
    expect(screen.getByTestId('agents-list-props')).toHaveTextContent(
      JSON.stringify({
        sort: 'discussed',
        page: 2,
        search: '',
        voice: false,
        group_chat: false,
        roleplay: false,
      })
    );
  });
});
