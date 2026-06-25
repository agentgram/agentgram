import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CommunityHandoffLinks } from '../../components/agents/CommunityHandoffLinks';

describe('CommunityHandoffLinks', () => {
  it('renders nothing when links prop is undefined', () => {
    const { container } = render(<CommunityHandoffLinks />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when links prop is null', () => {
    const { container } = render(<CommunityHandoffLinks links={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when all link fields are absent', () => {
    const { container } = render(<CommunityHandoffLinks links={{}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the Discord link with correct href', () => {
    render(
      <CommunityHandoffLinks
        links={{ discord: 'https://discord.gg/example' }}
      />
    );
    const link = screen.getByTestId('community-link-discord');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://discord.gg/example');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveTextContent('Discord');
  });

  it('renders the Reddit link with correct href', () => {
    render(
      <CommunityHandoffLinks
        links={{ reddit: 'https://reddit.com/r/example' }}
      />
    );
    const link = screen.getByTestId('community-link-reddit');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://reddit.com/r/example');
    expect(link).toHaveTextContent('Reddit');
  });

  it('renders the custom follow link with correct href', () => {
    render(
      <CommunityHandoffLinks
        links={{ customFollow: 'https://example.com/follow' }}
      />
    );
    const link = screen.getByTestId('community-link-custom');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com/follow');
    expect(link).toHaveTextContent('Follow');
  });

  it('renders all three links when all fields are provided', () => {
    render(
      <CommunityHandoffLinks
        links={{
          discord: 'https://discord.gg/test',
          reddit: 'https://reddit.com/r/test',
          customFollow: 'https://example.com/sub',
        }}
      />
    );
    expect(screen.getByTestId('community-link-discord')).toBeInTheDocument();
    expect(screen.getByTestId('community-link-reddit')).toBeInTheDocument();
    expect(screen.getByTestId('community-link-custom')).toBeInTheDocument();
    expect(screen.getByTestId('community-handoff-links')).toBeInTheDocument();
  });

  it('renders only Discord when only discord is set', () => {
    render(
      <CommunityHandoffLinks links={{ discord: 'https://discord.gg/only' }} />
    );
    expect(screen.getByTestId('community-link-discord')).toBeInTheDocument();
    expect(
      screen.queryByTestId('community-link-reddit')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('community-link-custom')
    ).not.toBeInTheDocument();
  });

  it('renders only Reddit when only reddit is set', () => {
    render(
      <CommunityHandoffLinks
        links={{ reddit: 'https://reddit.com/r/only' }}
      />
    );
    expect(screen.getByTestId('community-link-reddit')).toBeInTheDocument();
    expect(
      screen.queryByTestId('community-link-discord')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('community-link-custom')
    ).not.toBeInTheDocument();
  });

  it('applies indigo styling to Discord, orange to Reddit, and muted to custom', () => {
    render(
      <CommunityHandoffLinks
        links={{
          discord: 'https://discord.gg/style',
          reddit: 'https://reddit.com/r/style',
          customFollow: 'https://example.com/style',
        }}
      />
    );
    const discordLink = screen.getByTestId('community-link-discord');
    const redditLink = screen.getByTestId('community-link-reddit');
    const customLink = screen.getByTestId('community-link-custom');

    expect(discordLink.className).toContain('indigo');
    expect(redditLink.className).toContain('orange');
    expect(customLink.className).toContain('muted');
  });
});
