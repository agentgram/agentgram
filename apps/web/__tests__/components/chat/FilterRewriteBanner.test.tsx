import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  FilterRewriteBanner,
  estimateFilterRisk,
  suggestRewrite,
} from '../../../components/chat/FilterRewriteBanner';

describe('FilterRewriteBanner', () => {
  const onAcceptRewrite = vi.fn();
  const onDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when message is safe', () => {
    const { container } = render(
      <FilterRewriteBanner
        message="Hello, how are you today?"
        onAcceptRewrite={onAcceptRewrite}
        onDismiss={onDismiss}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('does not render when message is empty', () => {
    const { container } = render(
      <FilterRewriteBanner
        message=""
        onAcceptRewrite={onAcceptRewrite}
        onDismiss={onDismiss}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders banner when message contains filter-risk content', () => {
    render(
      <FilterRewriteBanner
        message="I want to kill this bug"
        onAcceptRewrite={onAcceptRewrite}
        onDismiss={onDismiss}
      />
    );
    expect(screen.getByTestId('filter-rewrite-banner')).toBeInTheDocument();
    expect(
      screen.getByText(/This message might be filtered/i)
    ).toBeInTheDocument();
  });

  it('calls onAcceptRewrite with suggested rewrite when "Use this rewrite" is clicked', () => {
    render(
      <FilterRewriteBanner
        message="I want to kill this bug"
        onAcceptRewrite={onAcceptRewrite}
        onDismiss={onDismiss}
      />
    );
    fireEvent.click(screen.getByTestId('filter-rewrite-accept'));
    expect(onAcceptRewrite).toHaveBeenCalledTimes(1);
    expect(onAcceptRewrite).toHaveBeenCalledWith('I want to stop this bug');
  });

  it('calls onDismiss when "Dismiss" is clicked', () => {
    render(
      <FilterRewriteBanner
        message="SCREAMING AT YOU"
        onAcceptRewrite={onAcceptRewrite}
        onDismiss={onDismiss}
      />
    );
    fireEvent.click(screen.getByTestId('filter-rewrite-dismiss'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onAcceptRewrite).not.toHaveBeenCalled();
  });
});

describe('estimateFilterRisk', () => {
  it('returns false for safe messages', () => {
    expect(estimateFilterRisk('Hello world')).toBe(false);
    expect(estimateFilterRisk('What a great day')).toBe(false);
  });

  it('returns true for kill/murder keywords', () => {
    expect(estimateFilterRisk('I want to kill the process')).toBe(true);
    expect(estimateFilterRisk('murder mystery novel')).toBe(true);
  });

  it('returns true for explicit content keywords', () => {
    expect(estimateFilterRisk('this is nsfw content')).toBe(true);
    expect(estimateFilterRisk('explicit language warning')).toBe(true);
  });

  it('returns true for ALL CAPS shouting (5+ chars)', () => {
    expect(estimateFilterRisk('HELLO there')).toBe(true);
  });

  it('returns true for repeated characters (5+ times)', () => {
    expect(estimateFilterRisk('noooooo way')).toBe(true);
  });
});

describe('suggestRewrite', () => {
  it('replaces kill with stop', () => {
    expect(suggestRewrite('I want to kill this bug')).toBe('I want to stop this bug');
  });

  it('replaces murder with stop', () => {
    expect(suggestRewrite('murder mystery')).toBe('stop mystery');
  });

  it('replaces explicit/nsfw/sexual/nude with mature', () => {
    expect(suggestRewrite('this is explicit')).toBe('this is mature');
    expect(suggestRewrite('nsfw content')).toBe('mature content');
  });

  it('normalizes ALL CAPS sequences to title case', () => {
    expect(suggestRewrite('HELLO there')).toBe('Hello there');
  });

  it('collapses repeated characters (5+) down to two', () => {
    expect(suggestRewrite('noooooo')).toBe('noo');
    expect(suggestRewrite('yesssss')).toBe('yess');
  });
});
