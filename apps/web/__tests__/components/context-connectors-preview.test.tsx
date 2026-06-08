import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ContextConnectorsPreview } from '../../components/agents/ContextConnectorsPreview';
import type { ContextSource } from '../../components/agents/ContextConnectorsPreview';

const SOURCES: ContextSource[] = [
  { id: 'links', type: 'link', label: 'Links', active: true },
  { id: 'photos', type: 'photo', label: 'Photos', active: true },
  { id: 'app-data', type: 'app', label: 'App data', active: false },
];

describe('ContextConnectorsPreview', () => {
  it('renders the panel with a toggle button', () => {
    render(<ContextConnectorsPreview sources={SOURCES} />);

    expect(
      screen.getByTestId('context-connectors-preview')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('context-connectors-toggle')
    ).toBeInTheDocument();
  });

  it('shows active source count badge when sources are active', () => {
    render(<ContextConnectorsPreview sources={SOURCES} />);

    const badge = screen.getByTestId('context-connectors-active-count');
    expect(badge).toHaveTextContent('2 active');
  });

  it('hides the source list by default (collapsed)', () => {
    render(<ContextConnectorsPreview sources={SOURCES} />);

    expect(
      screen.queryByTestId('context-connectors-list')
    ).not.toBeInTheDocument();
  });

  it('expands to show source list on toggle click', () => {
    render(<ContextConnectorsPreview sources={SOURCES} />);

    fireEvent.click(screen.getByTestId('context-connectors-toggle'));

    expect(
      screen.getByTestId('context-connectors-list')
    ).toBeInTheDocument();
    expect(screen.getByTestId('context-source-links')).toBeInTheDocument();
    expect(screen.getByTestId('context-source-photos')).toBeInTheDocument();
    expect(screen.getByTestId('context-source-app-data')).toBeInTheDocument();
  });

  it('collapses source list on second toggle click', () => {
    render(<ContextConnectorsPreview sources={SOURCES} />);

    fireEvent.click(screen.getByTestId('context-connectors-toggle'));
    fireEvent.click(screen.getByTestId('context-connectors-toggle'));

    expect(
      screen.queryByTestId('context-connectors-list')
    ).not.toBeInTheDocument();
  });

  it('shows Active status for active sources', () => {
    render(<ContextConnectorsPreview sources={SOURCES} />);
    fireEvent.click(screen.getByTestId('context-connectors-toggle'));

    expect(
      screen.getByTestId('context-source-links-status')
    ).toHaveTextContent('Active');
    expect(
      screen.getByTestId('context-source-photos-status')
    ).toHaveTextContent('Active');
  });

  it('shows Inactive status for inactive sources', () => {
    render(<ContextConnectorsPreview sources={SOURCES} />);
    fireEvent.click(screen.getByTestId('context-connectors-toggle'));

    expect(
      screen.getByTestId('context-source-app-data-status')
    ).toHaveTextContent('Inactive');
  });

  it('shows source labels in the expanded list', () => {
    render(<ContextConnectorsPreview sources={SOURCES} />);
    fireEvent.click(screen.getByTestId('context-connectors-toggle'));

    expect(screen.getByTestId('context-source-links')).toHaveTextContent(
      'Links'
    );
    expect(screen.getByTestId('context-source-photos')).toHaveTextContent(
      'Photos'
    );
    expect(screen.getByTestId('context-source-app-data')).toHaveTextContent(
      'App data'
    );
  });

  it('shows zero active count when no sources are active', () => {
    const inactiveSources: ContextSource[] = [
      { id: 'links', type: 'link', label: 'Links', active: false },
    ];
    render(<ContextConnectorsPreview sources={inactiveSources} />);

    expect(
      screen.queryByTestId('context-connectors-active-count')
    ).not.toBeInTheDocument();
  });

  it('uses default sources when none are provided', () => {
    render(<ContextConnectorsPreview />);

    const badge = screen.getByTestId('context-connectors-active-count');
    expect(badge).toHaveTextContent('2 active');
  });

  it('sets aria-expanded to false when collapsed', () => {
    render(<ContextConnectorsPreview sources={SOURCES} />);

    expect(
      screen.getByTestId('context-connectors-toggle')
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('sets aria-expanded to true when expanded', () => {
    render(<ContextConnectorsPreview sources={SOURCES} />);

    fireEvent.click(screen.getByTestId('context-connectors-toggle'));

    expect(
      screen.getByTestId('context-connectors-toggle')
    ).toHaveAttribute('aria-expanded', 'true');
  });
});
