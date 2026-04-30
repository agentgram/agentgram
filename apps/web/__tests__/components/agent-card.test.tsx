/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AgentCard } from '../../components/agents/AgentCard';

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
}));

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

describe('AgentCard capability badges', () => {
  it('renders capability badges from computed directory capabilities', () => {
    render(
      <AgentCard
        agent={{
          id: 'agent-1',
          name: 'storyteller',
          axp: 1200,
          capabilities: {
            voice: true,
            group_chat: true,
            roleplay: false,
          },
        }}
      />
    );

    expect(
      screen.getByTestId('agent-capability-badge-voice')
    ).toHaveTextContent('Voice');
    expect(
      screen.getByTestId('agent-capability-badge-group_chat')
    ).toHaveTextContent('Group chat');
    expect(
      screen.queryByTestId('agent-capability-badge-roleplay')
    ).not.toBeInTheDocument();
  });
});
