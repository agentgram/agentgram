import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CreatorProvenanceStrip } from '../../components/agents/CreatorProvenanceStrip';

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

describe('CreatorProvenanceStrip', () => {
  it('renders null when no provenance data is present for a claimed agent', () => {
    const { container } = render(
      <CreatorProvenanceStrip
        agentName="my-bot"
        identityClaimStatus="claimed_verified"
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows remix lineage as plain text in card variant', () => {
    render(
      <CreatorProvenanceStrip
        agentName="cool-bot-v2"
        identityClaimStatus="claimed_verified"
        remixSource={{ id: 'src-1', name: 'cool-bot', displayName: 'Cool Bot' }}
        variant="card"
      />
    );

    expect(screen.getByTestId('creator-provenance-strip')).toBeInTheDocument();
    expect(screen.getByTestId('remix-lineage')).toBeInTheDocument();
    expect(screen.getByTestId('remix-source-label')).toHaveTextContent('Cool Bot');
    expect(screen.queryByTestId('remix-source-link')).not.toBeInTheDocument();
  });

  it('shows remix lineage as a link in profile variant', () => {
    render(
      <CreatorProvenanceStrip
        agentName="cool-bot-v2"
        identityClaimStatus="claimed_verified"
        remixSource={{ id: 'src-1', name: 'cool-bot', displayName: 'Cool Bot' }}
        variant="profile"
      />
    );

    expect(screen.getByTestId('remix-lineage')).toBeInTheDocument();
    const link = screen.getByTestId('remix-source-link');
    expect(link).toHaveTextContent('Cool Bot');
    expect(link).toHaveAttribute('href', '/agents/cool-bot');
    expect(screen.queryByTestId('remix-source-label')).not.toBeInTheDocument();
  });

  it('falls back to remixSource.name when displayName is missing', () => {
    render(
      <CreatorProvenanceStrip
        agentName="fork-bot"
        identityClaimStatus="claimed_verified"
        remixSource={{ id: 'src-2', name: 'alpha-bot' }}
        variant="profile"
      />
    );

    expect(screen.getByTestId('remix-source-link')).toHaveTextContent('alpha-bot');
    expect(screen.getByTestId('remix-source-link')).toHaveAttribute(
      'href',
      '/agents/alpha-bot'
    );
  });

  it('shows creator attribution when publicOwnerLabel is provided', () => {
    render(
      <CreatorProvenanceStrip
        agentName="my-bot"
        publicOwnerLabel="Ralph"
        identityClaimStatus="claimed_verified"
        variant="card"
      />
    );

    expect(screen.getByTestId('creator-attribution')).toBeInTheDocument();
    expect(screen.getByTestId('creator-name')).toHaveTextContent('Ralph');
  });

  it('shows follow creator CTA in profile variant when creator is verified', () => {
    render(
      <CreatorProvenanceStrip
        agentName="my-bot"
        publicOwnerLabel="Ralph"
        identityClaimStatus="claimed_verified"
        variant="profile"
      />
    );

    const cta = screen.getByTestId('follow-creator-cta');
    expect(cta).toHaveTextContent('Follow Creator');
    expect(cta).toHaveAttribute('href', '/agents/my-bot');
  });

  it('links follow creator CTA to creatorHandle when provided', () => {
    render(
      <CreatorProvenanceStrip
        agentName="my-bot"
        publicOwnerLabel="Ralph"
        identityClaimStatus="claimed_verified"
        creatorHandle="ralph-ai"
        variant="profile"
      />
    );

    const cta = screen.getByTestId('follow-creator-cta');
    expect(cta).toHaveAttribute('href', '/agents/ralph-ai');
  });

  it('does not show follow creator CTA in card variant', () => {
    render(
      <CreatorProvenanceStrip
        agentName="my-bot"
        publicOwnerLabel="Ralph"
        identityClaimStatus="claimed_verified"
        variant="card"
      />
    );

    expect(screen.queryByTestId('follow-creator-cta')).not.toBeInTheDocument();
  });

  it('shows claim creator profile CTA for unclaimed agents', () => {
    render(
      <CreatorProvenanceStrip
        agentName="unclaimed-bot"
        identityClaimStatus="unclaimed"
        variant="profile"
      />
    );

    expect(screen.getByTestId('creator-provenance-strip')).toBeInTheDocument();
    const claimCta = screen.getByTestId('claim-creator-profile-cta');
    expect(claimCta).toHaveTextContent('Claim your creator profile');
    expect(claimCta).toHaveAttribute(
      'href',
      '/dashboard/claim?agentName=unclaimed-bot'
    );
  });

  it('does not show claim CTA in card variant even when unclaimed (avoids nested anchor)', () => {
    render(
      <CreatorProvenanceStrip
        agentName="unknown-bot"
        identityClaimStatus={null}
        variant="card"
      />
    );

    expect(screen.queryByTestId('claim-creator-profile-cta')).not.toBeInTheDocument();
  });

  it('does not show claim CTA for pending_review agents', () => {
    render(
      <CreatorProvenanceStrip
        agentName="pending-bot"
        publicOwnerLabel="Dev"
        identityClaimStatus="pending_review"
        variant="profile"
      />
    );

    expect(
      screen.queryByTestId('claim-creator-profile-cta')
    ).not.toBeInTheDocument();
  });

  it('does not show follow creator CTA for unclaimed agents', () => {
    render(
      <CreatorProvenanceStrip
        agentName="unclaimed-bot"
        publicOwnerLabel="Dev"
        identityClaimStatus="unclaimed"
        variant="profile"
      />
    );

    expect(screen.queryByTestId('follow-creator-cta')).not.toBeInTheDocument();
    expect(screen.getByTestId('claim-creator-profile-cta')).toBeInTheDocument();
  });

  it('shows both remix lineage and creator attribution together', () => {
    render(
      <CreatorProvenanceStrip
        agentName="remix-bot"
        publicOwnerLabel="Alice"
        identityClaimStatus="claimed_verified"
        remixSource={{ id: 'src-3', name: 'base-bot', displayName: 'Base Bot' }}
        variant="profile"
      />
    );

    expect(screen.getByTestId('remix-lineage')).toBeInTheDocument();
    expect(screen.getByTestId('creator-attribution')).toBeInTheDocument();
    expect(screen.getByTestId('creator-name')).toHaveTextContent('Alice');
    expect(screen.getByTestId('remix-source-link')).toHaveTextContent('Base Bot');
    expect(screen.getByTestId('follow-creator-cta')).toBeInTheDocument();
  });
});
