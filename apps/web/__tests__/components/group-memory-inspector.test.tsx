import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  GroupMemoryInspector,
} from '../../components/chat/GroupMemoryInspector';
import type { GroupMemoryInspectorParticipant } from '../../components/chat/GroupMemoryInspector';
import { buildParticipantScopes } from '../../lib/group-memory';
import type { RawMemoryItem } from '../../lib/group-memory';

const PARTICIPANT_ATLAS: GroupMemoryInspectorParticipant = {
  agentId: 'anchor-atlas',
  agentName: 'atlas',
  privateFacts: ['Past conversation history', 'Relationship notes'],
  sharedFacts: ['Display name', 'Interests & hobbies'],
};

const PARTICIPANT_NOVA: GroupMemoryInspectorParticipant = {
  agentId: 'agent-nova',
  agentName: 'nova',
  privateFacts: ['Private diary'],
  sharedFacts: ['Personality', 'Hobbies'],
};

const PARTICIPANT_EMPTY: GroupMemoryInspectorParticipant = {
  agentId: 'agent-aria',
  agentName: 'aria',
  privateFacts: [],
  sharedFacts: [],
};

function renderInspector(
  overrides: Partial<{
    participants: GroupMemoryInspectorParticipant[];
    isOpen: boolean;
    onClose: () => void;
  }> = {}
) {
  const onClose = vi.fn();
  return {
    onClose,
    ...render(
      <GroupMemoryInspector
        participants={[PARTICIPANT_ATLAS, PARTICIPANT_NOVA]}
        isOpen={true}
        onClose={onClose}
        {...overrides}
      />
    ),
  };
}

describe('GroupMemoryInspector — modal visibility', () => {
  it('renders the modal when isOpen is true', () => {
    renderInspector({ isOpen: true });
    expect(
      screen.getByTestId('group-memory-inspector-modal')
    ).toBeInTheDocument();
  });

  it('does not render the modal when isOpen is false', () => {
    renderInspector({ isOpen: false });
    expect(
      screen.queryByTestId('group-memory-inspector-modal')
    ).not.toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const { onClose } = renderInspector({ isOpen: true });
    fireEvent.click(screen.getByTestId('memory-inspector-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('GroupMemoryInspector — participant rendering', () => {
  it('renders the participant list container', () => {
    renderInspector();
    expect(
      screen.getByTestId('memory-inspector-participant-list')
    ).toBeInTheDocument();
  });

  it('renders a section for each participant', () => {
    renderInspector();
    expect(
      screen.getByTestId(`memory-inspector-participant-${PARTICIPANT_ATLAS.agentName}`)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`memory-inspector-participant-${PARTICIPANT_NOVA.agentName}`)
    ).toBeInTheDocument();
  });

  it('shows the no-participants message when participants array is empty', () => {
    renderInspector({ participants: [] });
    expect(
      screen.getByTestId('memory-inspector-no-participants')
    ).toBeInTheDocument();
  });
});

describe('GroupMemoryInspector — private/shared fact separation', () => {
  it('renders the shared facts section for a participant with shared facts', () => {
    renderInspector();
    expect(
      screen.getByTestId(`memory-inspector-shared-${PARTICIPANT_ATLAS.agentName}`)
    ).toBeInTheDocument();
  });

  it('renders the private facts section for a participant with private facts', () => {
    renderInspector();
    expect(
      screen.getByTestId(`memory-inspector-private-${PARTICIPANT_ATLAS.agentName}`)
    ).toBeInTheDocument();
  });

  it('renders shared fact chips with Eye icon styling', () => {
    renderInspector();
    const sharedChips = screen.getAllByTestId('fact-chip-shared');
    expect(sharedChips.length).toBeGreaterThan(0);
  });

  it('renders private fact chips with Lock icon styling', () => {
    renderInspector();
    const privateChips = screen.getAllByTestId('fact-chip-private');
    expect(privateChips.length).toBeGreaterThan(0);
  });

  it('shows correct fact labels for atlas shared facts', () => {
    renderInspector({ participants: [PARTICIPANT_ATLAS] });
    expect(screen.getByText('Display name')).toBeInTheDocument();
    expect(screen.getByText('Interests & hobbies')).toBeInTheDocument();
  });

  it('shows correct fact labels for atlas private facts', () => {
    renderInspector({ participants: [PARTICIPANT_ATLAS] });
    expect(screen.getByText('Past conversation history')).toBeInTheDocument();
    expect(screen.getByText('Relationship notes')).toBeInTheDocument();
  });
});

describe('GroupMemoryInspector — empty state', () => {
  it('shows empty message for a participant with no facts', () => {
    renderInspector({ participants: [PARTICIPANT_EMPTY] });
    expect(
      screen.getByTestId(`memory-inspector-empty-${PARTICIPANT_EMPTY.agentName}`)
    ).toBeInTheDocument();
  });

  it('does not show shared/private sections when participant has no facts', () => {
    renderInspector({ participants: [PARTICIPANT_EMPTY] });
    expect(
      screen.queryByTestId(`memory-inspector-shared-${PARTICIPANT_EMPTY.agentName}`)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`memory-inspector-private-${PARTICIPANT_EMPTY.agentName}`)
    ).not.toBeInTheDocument();
  });
});

describe('buildParticipantScopes — lib/group-memory', () => {
  const RAW_ITEMS: RawMemoryItem[] = [
    { agentId: 'a1', key: 'name', value: 'Atlas display name', scope: 'group' },
    { agentId: 'a1', key: 'history', value: 'Atlas private history', scope: 'private' },
    { agentId: 'a1', key: 'canon', value: 'Atlas public canon', scope: 'public_canon' },
    { agentId: 'a2', key: 'name', value: 'Nova display name', scope: 'group' },
    { agentId: 'a2', key: 'diary', value: 'Nova private diary', scope: 'private' },
  ];

  it('returns a scope entry for each participant', () => {
    const result = buildParticipantScopes(RAW_ITEMS, [
      { agentId: 'a1', agentName: 'atlas' },
      { agentId: 'a2', agentName: 'nova' },
    ]);
    expect(result).toHaveLength(2);
  });

  it('places group and public_canon items in sharedFacts', () => {
    const result = buildParticipantScopes(RAW_ITEMS, [
      { agentId: 'a1', agentName: 'atlas' },
    ]);
    expect(result[0].sharedFacts).toContain('Atlas display name');
    expect(result[0].sharedFacts).toContain('Atlas public canon');
  });

  it('places private items in privateFacts', () => {
    const result = buildParticipantScopes(RAW_ITEMS, [
      { agentId: 'a1', agentName: 'atlas' },
    ]);
    expect(result[0].privateFacts).toContain('Atlas private history');
  });

  it('returns empty arrays when participant has no matching items', () => {
    const result = buildParticipantScopes(RAW_ITEMS, [
      { agentId: 'unknown-agent', agentName: 'ghost' },
    ]);
    expect(result[0].privateFacts).toHaveLength(0);
    expect(result[0].sharedFacts).toHaveLength(0);
  });

  it('preserves agentId and agentName in output', () => {
    const result = buildParticipantScopes(RAW_ITEMS, [
      { agentId: 'a2', agentName: 'nova' },
    ]);
    expect(result[0].agentId).toBe('a2');
    expect(result[0].agentName).toBe('nova');
  });
});
