import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  UpdateDigestRail,
  DEFAULT_UPDATE_ENTRIES,
  DEFAULT_RELEASE_DIFF_PROFILE,
  type UpdateDigestEntry,
} from '../../components/explore/UpdateDigestRail';

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

const MOCK_ENTRIES: UpdateDigestEntry[] = [
  {
    id: 'voice-test',
    category: 'voice',
    title: 'Voice latency cut by 40%',
    description: 'Sub-200 ms response on mobile.',
    href: '/explore#voice',
    isNew: true,
  },
  {
    id: 'image-test',
    category: 'image',
    title: 'Selfie engine v2',
    description: 'Consistent character faces.',
    href: '/explore#image',
    isNew: false,
  },
  {
    id: 'memory-test',
    category: 'memory',
    title: 'Relationship timeline',
    description: 'Visual history of milestones.',
    href: '/explore#memory',
    isNew: true,
  },
];

describe('UpdateDigestRail', () => {
  it('renders the "What\'s new" heading', () => {
    render(<UpdateDigestRail entries={MOCK_ENTRIES} />);
    expect(screen.getByTestId('update-digest-heading')).toHaveTextContent(
      "What's new"
    );
  });

  it('renders a card for each entry', () => {
    render(<UpdateDigestRail entries={MOCK_ENTRIES} />);
    expect(
      screen.getByTestId('update-digest-card-voice-test')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('update-digest-card-image-test')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('update-digest-card-memory-test')
    ).toBeInTheDocument();
  });

  it('shows "New" badge only for entries with isNew=true', () => {
    render(<UpdateDigestRail entries={MOCK_ENTRIES} />);
    expect(
      screen.getByTestId('update-digest-new-badge-voice-test')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('update-digest-new-badge-memory-test')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('update-digest-new-badge-image-test')
    ).not.toBeInTheDocument();
  });

  it('renders category badges with correct labels', () => {
    render(<UpdateDigestRail entries={MOCK_ENTRIES} />);
    expect(
      screen.getByTestId('update-digest-category-badge-voice-test')
    ).toHaveTextContent('Voice');
    expect(
      screen.getByTestId('update-digest-category-badge-image-test')
    ).toHaveTextContent('Image');
    expect(
      screen.getByTestId('update-digest-category-badge-memory-test')
    ).toHaveTextContent('Memory');
  });

  it('renders entry titles', () => {
    render(<UpdateDigestRail entries={MOCK_ENTRIES} />);
    expect(
      screen.getByTestId('update-digest-title-voice-test')
    ).toHaveTextContent('Voice latency cut by 40%');
    expect(
      screen.getByTestId('update-digest-title-image-test')
    ).toHaveTextContent('Selfie engine v2');
    expect(
      screen.getByTestId('update-digest-title-memory-test')
    ).toHaveTextContent('Relationship timeline');
  });

  it('links each card to its href', () => {
    render(<UpdateDigestRail entries={MOCK_ENTRIES} />);
    expect(screen.getByTestId('update-digest-card-voice-test')).toHaveAttribute(
      'href',
      '/explore#voice'
    );
    expect(screen.getByTestId('update-digest-card-image-test')).toHaveAttribute(
      'href',
      '/explore#image'
    );
  });

  it('renders the "See all" link', () => {
    render(<UpdateDigestRail entries={MOCK_ENTRIES} />);
    expect(screen.getByTestId('update-digest-see-all')).toBeInTheDocument();
  });

  it('renders the horizontal scroll container', () => {
    render(<UpdateDigestRail entries={MOCK_ENTRIES} />);
    expect(screen.getByTestId('update-digest-scroll')).toBeInTheDocument();
  });

  it('returns null when entries array is empty', () => {
    const { container } = render(<UpdateDigestRail entries={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('uses DEFAULT_UPDATE_ENTRIES when no entries prop is passed', () => {
    render(<UpdateDigestRail />);
    expect(screen.getAllByTestId(/^update-digest-card-/).length).toBe(
      DEFAULT_UPDATE_ENTRIES.length
    );
  });

  it('covers all three categories in default entries', () => {
    render(<UpdateDigestRail />);
    expect(screen.getAllByText('Voice').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Image').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Memory').length).toBeGreaterThan(0);
  });

  it('opens a side-by-side release diff comparison modal', () => {
    render(<UpdateDigestRail entries={MOCK_ENTRIES} />);

    fireEvent.click(screen.getByTestId('release-diff-open-button'));

    expect(
      screen.getByTestId('release-diff-comparison-modal')
    ).toBeInTheDocument();
    expect(screen.getByTestId('release-diff-profile-label')).toHaveTextContent(
      'Your usage profile'
    );
    expect(screen.getAllByText('Nomi V3:')).toHaveLength(3);
    expect(screen.getAllByText('Nomi V5:')).toHaveLength(3);
    expect(screen.getByText('Generic update strip')).toBeInTheDocument();
    expect(
      screen.getByText('Profile-specific improvement')
    ).toBeInTheDocument();
  });

  it('shows profile-specific memory, voice, and image improvements', () => {
    render(<UpdateDigestRail />);

    fireEvent.click(screen.getByTestId('release-diff-open-button'));

    expect(
      screen.getByTestId('release-diff-row-memory-depth')
    ).toHaveTextContent('Memory depth');
    expect(
      screen.getByTestId('release-diff-row-voice-quality')
    ).toHaveTextContent('Voice quality');
    expect(
      screen.getByTestId('release-diff-row-image-anchors')
    ).toHaveTextContent('Image anchors');
    expect(
      screen.getByTestId('release-diff-profile-image-anchors')
    ).toHaveTextContent('mind-map anchors');
  });

  it('exports default release diff data for all visible improvement dimensions', () => {
    expect(
      DEFAULT_RELEASE_DIFF_PROFILE.dimensions.map((dimension) => dimension.id)
    ).toEqual(['memory-depth', 'voice-quality', 'image-anchors']);
  });
});
