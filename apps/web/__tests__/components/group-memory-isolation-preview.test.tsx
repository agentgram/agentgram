/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  GroupMemoryIsolationPreview,
  buildParticipantScopes,
  DEFAULT_SAMPLE_FACTS,
} from '../../components/agents/GroupMemoryIsolationPreview';
import type { MemoryFactPreview } from '../../components/agents/GroupMemoryIsolationPreview';

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
}));

const ANCHOR = {
  id: 'anchor-atlas',
  name: 'atlas',
  displayName: 'Atlas',
  avatarUrl: null,
};

const COMPANION_NOVA = {
  id: 'agent-nova',
  name: 'nova',
  displayName: 'Nova',
  avatarUrl: null,
};

const COMPANION_ARIA = {
  id: 'agent-aria',
  name: 'aria',
  displayName: 'Aria',
  avatarUrl: null,
};

function renderPreview(
  companions = [COMPANION_NOVA],
  extraProps: Partial<React.ComponentProps<typeof GroupMemoryIsolationPreview>> = {}
) {
  return render(
    <GroupMemoryIsolationPreview
      anchorAgent={ANCHOR}
      companions={companions}
      {...extraProps}
    />
  );
}

describe('GroupMemoryIsolationPreview — visibility', () => {
  it('renders nothing when companions list is empty', () => {
    const { container } = renderPreview([]);
    expect(container.firstChild).toBeNull();
  });

  it('renders the preview container when at least one companion is present', () => {
    renderPreview([COMPANION_NOVA]);
    expect(
      screen.getByTestId('group-memory-isolation-preview')
    ).toBeInTheDocument();
  });

  it('renders the participant list container', () => {
    renderPreview([COMPANION_NOVA]);
    expect(
      screen.getByTestId('memory-isolation-participant-list')
    ).toBeInTheDocument();
  });

  it('shows the anchor agent row', () => {
    renderPreview([COMPANION_NOVA]);
    expect(
      screen.getByTestId(`memory-isolation-participant-${ANCHOR.name}`)
    ).toBeInTheDocument();
  });

  it('shows companion agent rows for each companion', () => {
    renderPreview([COMPANION_NOVA, COMPANION_ARIA]);
    expect(
      screen.getByTestId(`memory-isolation-participant-${COMPANION_NOVA.name}`)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`memory-isolation-participant-${COMPANION_ARIA.name}`)
    ).toBeInTheDocument();
  });
});

describe('GroupMemoryIsolationPreview — fact visibility states', () => {
  it('anchor agent can access all facts (no restricted facts)', () => {
    renderPreview([COMPANION_NOVA]);
    // All facts should be accessible for anchor
    for (const fact of DEFAULT_SAMPLE_FACTS) {
      expect(
        screen.getByTestId(`memory-accessible-${ANCHOR.name}-${fact.id}`)
      ).toBeInTheDocument();
    }
    // Anchor should have no restricted fact rows
    for (const fact of DEFAULT_SAMPLE_FACTS.filter((f) => f.scope === 'private')) {
      expect(
        screen.queryByTestId(`memory-restricted-${ANCHOR.name}-${fact.id}`)
      ).not.toBeInTheDocument();
    }
  });

  it('companion agent can access shared facts', () => {
    renderPreview([COMPANION_NOVA]);
    const sharedFacts = DEFAULT_SAMPLE_FACTS.filter((f) => f.scope === 'shared');
    for (const fact of sharedFacts) {
      expect(
        screen.getByTestId(`memory-accessible-${COMPANION_NOVA.name}-${fact.id}`)
      ).toBeInTheDocument();
    }
  });

  it('companion agent has private facts marked as restricted', () => {
    renderPreview([COMPANION_NOVA]);
    const privateFacts = DEFAULT_SAMPLE_FACTS.filter((f) => f.scope === 'private');
    for (const fact of privateFacts) {
      expect(
        screen.getByTestId(`memory-restricted-${COMPANION_NOVA.name}-${fact.id}`)
      ).toBeInTheDocument();
    }
  });

  it('shows "visible" badge for accessible facts and "isolated" badge for restricted facts', () => {
    renderPreview([COMPANION_NOVA]);
    const visibleBadges = screen.getAllByText('visible');
    const isolatedBadges = screen.getAllByText('isolated');
    expect(visibleBadges.length).toBeGreaterThan(0);
    expect(isolatedBadges.length).toBeGreaterThan(0);
  });
});

describe('GroupMemoryIsolationPreview — custom facts', () => {
  it('accepts custom sampleFacts prop', () => {
    const customFacts: MemoryFactPreview[] = [
      { id: 'c1', label: 'Custom shared fact', scope: 'shared' },
      { id: 'c2', label: 'Custom private fact', scope: 'private' },
    ];
    renderPreview([COMPANION_NOVA], { sampleFacts: customFacts });
    expect(screen.getAllByText('Custom shared fact').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Custom private fact').length).toBeGreaterThan(0);
  });

  it('companion only sees custom shared facts when custom facts provided', () => {
    const customFacts: MemoryFactPreview[] = [
      { id: 'c1', label: 'Shared info', scope: 'shared' },
      { id: 'c2', label: 'Private info', scope: 'private' },
    ];
    renderPreview([COMPANION_NOVA], { sampleFacts: customFacts });
    expect(
      screen.getByTestId(`memory-accessible-${COMPANION_NOVA.name}-c1`)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`memory-restricted-${COMPANION_NOVA.name}-c2`)
    ).toBeInTheDocument();
  });
});

describe('GroupMemoryIsolationPreview — buildParticipantScopes', () => {
  it('returns anchor + companions as participants', () => {
    const scopes = buildParticipantScopes(
      ANCHOR,
      [COMPANION_NOVA],
      DEFAULT_SAMPLE_FACTS
    );
    expect(scopes).toHaveLength(2);
    expect(scopes[0].name).toBe(ANCHOR.name);
    expect(scopes[1].name).toBe(COMPANION_NOVA.name);
  });

  it('anchor has all facts accessible and none restricted', () => {
    const scopes = buildParticipantScopes(
      ANCHOR,
      [COMPANION_NOVA],
      DEFAULT_SAMPLE_FACTS
    );
    const anchor = scopes[0];
    expect(anchor.accessibleFacts).toHaveLength(DEFAULT_SAMPLE_FACTS.length);
    expect(anchor.restrictedFacts).toHaveLength(0);
  });

  it('companion only has shared facts accessible', () => {
    const scopes = buildParticipantScopes(
      ANCHOR,
      [COMPANION_NOVA],
      DEFAULT_SAMPLE_FACTS
    );
    const companion = scopes[1];
    const sharedCount = DEFAULT_SAMPLE_FACTS.filter((f) => f.scope === 'shared').length;
    const privateCount = DEFAULT_SAMPLE_FACTS.filter((f) => f.scope === 'private').length;
    expect(companion.accessibleFacts).toHaveLength(sharedCount);
    expect(companion.restrictedFacts).toHaveLength(privateCount);
  });

  it('handles multiple companions correctly', () => {
    const scopes = buildParticipantScopes(
      ANCHOR,
      [COMPANION_NOVA, COMPANION_ARIA],
      DEFAULT_SAMPLE_FACTS
    );
    expect(scopes).toHaveLength(3);
    expect(scopes.map((s) => s.name)).toEqual([
      ANCHOR.name,
      COMPANION_NOVA.name,
      COMPANION_ARIA.name,
    ]);
  });
});
