import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { LabsFeatureVotePanel } from '@/components/labs/LabsFeatureVotePanel';

describe('LabsFeatureVotePanel', () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, val: string) => {
          store[key] = val;
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          store = {};
        }),
      },
      writable: true,
    });
  });

  it('renders the vote panel container', () => {
    render(<LabsFeatureVotePanel />);
    expect(screen.getByTestId('labs-feature-vote-panel')).toBeInTheDocument();
  });

  it('renders all 5 feature candidates', () => {
    render(<LabsFeatureVotePanel />);
    const items = [
      'vote-item-voice-first-chat',
      'vote-item-multi-agent-group-threads',
      'vote-item-auto-summarized-memory-digests',
      'vote-item-story-arc-branching',
      'vote-item-agent-cross-follow-notifications',
    ];
    for (const testId of items) {
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    }
  });

  it('shows feature titles', () => {
    render(<LabsFeatureVotePanel />);
    expect(screen.getByTestId('vote-item-voice-first-chat-title')).toHaveTextContent(
      'Voice-first chat mode'
    );
    expect(
      screen.getByTestId('vote-item-multi-agent-group-threads-title')
    ).toHaveTextContent('Multi-agent group threads');
  });

  it('all vote counts start at 0', () => {
    render(<LabsFeatureVotePanel />);
    const featureIds = [
      'voice-first-chat',
      'multi-agent-group-threads',
      'auto-summarized-memory-digests',
      'story-arc-branching',
      'agent-cross-follow-notifications',
    ];
    for (const id of featureIds) {
      expect(screen.getByTestId(`vote-count-${id}`)).toHaveTextContent('0');
    }
  });

  it('upvote increments count by 1', () => {
    render(<LabsFeatureVotePanel />);
    const btn = screen.getByTestId('vote-button-voice-first-chat');
    fireEvent.click(btn);
    expect(screen.getByTestId('vote-count-voice-first-chat')).toHaveTextContent('1');
  });

  it('upvote button is disabled after voting (no double-vote)', () => {
    render(<LabsFeatureVotePanel />);
    const btn = screen.getByTestId('vote-button-voice-first-chat');
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(screen.getByTestId('vote-count-voice-first-chat')).toHaveTextContent('1');
  });

  it('voting one feature does not affect other features', () => {
    render(<LabsFeatureVotePanel />);
    fireEvent.click(screen.getByTestId('vote-button-voice-first-chat'));
    expect(
      screen.getByTestId('vote-count-multi-agent-group-threads')
    ).toHaveTextContent('0');
  });

  it('persists vote to localStorage', () => {
    render(<LabsFeatureVotePanel />);
    fireEvent.click(screen.getByTestId('vote-button-story-arc-branching'));
    const stored = JSON.parse(store['agentgram:labs-feature-votes'] ?? '{}');
    expect(stored['story-arc-branching']).toBe(1);
  });
});
