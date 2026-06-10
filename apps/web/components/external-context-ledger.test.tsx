import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  ExternalContextLedger,
  type ContextSourceEntry,
} from './external-context-ledger';

const ALL_SOURCE_TYPES: ContextSourceEntry[] = [
  {
    type: 'link',
    timestamp: '2026-06-09T08:00:00.000Z',
    description: 'Checked a shared article you sent earlier.',
    label: 'example.com',
  },
  {
    type: 'photo',
    timestamp: '2026-06-09T08:01:00.000Z',
    description: 'Analyzed the photo you uploaded yesterday.',
  },
  {
    type: 'app',
    timestamp: '2026-06-09T08:02:00.000Z',
    description: 'Read your recent activity from the connected app.',
    label: 'Spotify',
  },
  {
    type: 'internet',
    timestamp: '2026-06-09T08:03:00.000Z',
    description: 'Searched the web for the latest news on your topic.',
  },
];

describe('ExternalContextLedger', () => {
  it('renders the ledger container', () => {
    render(<ExternalContextLedger sources={[]} />);
    expect(
      screen.getByTestId('external-context-ledger')
    ).toBeInTheDocument();
  });

  it('renders all 4 context source types', () => {
    render(<ExternalContextLedger sources={ALL_SOURCE_TYPES} />);

    expect(screen.getByTestId('context-source-type-link')).toHaveTextContent(
      'Link'
    );
    expect(screen.getByTestId('context-source-type-photo')).toHaveTextContent(
      'Photo'
    );
    expect(screen.getByTestId('context-source-type-app')).toHaveTextContent(
      'App'
    );
    expect(
      screen.getByTestId('context-source-type-internet')
    ).toHaveTextContent('Internet');
  });

  it('renders a list item for each source', () => {
    render(<ExternalContextLedger sources={ALL_SOURCE_TYPES} />);

    expect(
      screen.getByTestId('context-source-entry-link')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('context-source-entry-photo')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('context-source-entry-app')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('context-source-entry-internet')
    ).toBeInTheDocument();
  });

  it('shows empty state when no context sources provided', () => {
    render(<ExternalContextLedger sources={[]} />);

    expect(
      screen.getByTestId('external-context-ledger-empty')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('external-context-ledger-list')
    ).not.toBeInTheDocument();
  });

  it('does not show empty state when sources are provided', () => {
    render(<ExternalContextLedger sources={ALL_SOURCE_TYPES} />);

    expect(
      screen.queryByTestId('external-context-ledger-empty')
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('external-context-ledger-list')
    ).toBeInTheDocument();
  });

  it('"Manage connected sources" link is always present', () => {
    render(<ExternalContextLedger sources={[]} />);

    const link = screen.getByTestId('manage-context-sources-link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/settings/context-sources');
  });

  it('"Manage connected sources" link is present with sources', () => {
    render(<ExternalContextLedger sources={ALL_SOURCE_TYPES} />);

    const link = screen.getByTestId('manage-context-sources-link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/settings/context-sources');
  });

  it('renders the source description for each entry', () => {
    render(<ExternalContextLedger sources={ALL_SOURCE_TYPES} />);

    expect(
      screen.getByText('Checked a shared article you sent earlier.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Searched the web for the latest news on your topic.')
    ).toBeInTheDocument();
  });
});
