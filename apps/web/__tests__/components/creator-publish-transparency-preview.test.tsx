import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CreatorPublishTransparencyPreview } from '@/components/dashboard/CreatorPublishTransparencyPreview';

const defaultProps = {
  agentName: 'companion-guide',
  agentBio: 'A calm companion who checks in after work',
  tags: ['companion', 'daily', 'lifestyle'],
  category: 'Lifestyle',
  onConfirmPublish: vi.fn(),
  onFixIssues: vi.fn(),
};

describe('CreatorPublishTransparencyPreview', () => {
  it('renders filter outcome indicator', () => {
    render(<CreatorPublishTransparencyPreview {...defaultProps} />);
    expect(screen.getByTestId('filter-outcome-section')).toBeInTheDocument();
    expect(screen.getByTestId('filter-check-name-check')).toBeInTheDocument();
    expect(screen.getByTestId('filter-check-bio-check')).toBeInTheDocument();
    expect(screen.getByTestId('filter-check-content-policy')).toBeInTheDocument();
  });

  it('renders discovery visibility estimate', () => {
    render(<CreatorPublishTransparencyPreview {...defaultProps} />);
    expect(screen.getByTestId('discovery-visibility-section')).toBeInTheDocument();
    const visibilityValue = screen.getByTestId('discovery-visibility-value');
    expect(visibilityValue).toBeInTheDocument();
    expect(['Wide', 'Niche', 'Limited']).toContain(visibilityValue.textContent);
  });

  it('calls onConfirmPublish when user confirms publish', () => {
    const onConfirmPublish = vi.fn();
    render(
      <CreatorPublishTransparencyPreview
        {...defaultProps}
        onConfirmPublish={onConfirmPublish}
      />
    );
    fireEvent.click(screen.getByTestId('publish-anyway-button'));
    expect(onConfirmPublish).toHaveBeenCalledTimes(1);
  });

  it('shows Wide visibility when 3+ tags and category are set', () => {
    render(<CreatorPublishTransparencyPreview {...defaultProps} />);
    expect(screen.getByTestId('discovery-visibility-value').textContent).toBe('Wide');
  });

  it('shows Limited visibility when no tags and no category', () => {
    render(
      <CreatorPublishTransparencyPreview
        {...defaultProps}
        tags={[]}
        category=""
      />
    );
    expect(screen.getByTestId('discovery-visibility-value').textContent).toBe('Limited');
  });

  it('shows a high confidence score for well-configured agents', () => {
    render(<CreatorPublishTransparencyPreview {...defaultProps} />);
    const scoreText = screen.getByTestId('confidence-score-value').textContent ?? '';
    const score = parseInt(scoreText.split('/')[0], 10);
    expect(score).toBeGreaterThanOrEqual(70);
  });

  it('shows a low confidence score when name and bio are missing', () => {
    render(
      <CreatorPublishTransparencyPreview
        {...defaultProps}
        agentName=""
        agentBio=""
        tags={[]}
        category=""
      />
    );
    const scoreText = screen.getByTestId('confidence-score-value').textContent ?? '';
    const score = parseInt(scoreText.split('/')[0], 10);
    expect(score).toBe(0);
  });

  it('calls onFixIssues when fix-issues button is clicked', () => {
    const onFixIssues = vi.fn();
    render(
      <CreatorPublishTransparencyPreview
        {...defaultProps}
        onFixIssues={onFixIssues}
      />
    );
    fireEvent.click(screen.getByTestId('fix-issues-button'));
    expect(onFixIssues).toHaveBeenCalledTimes(1);
  });

  it('renders the confidence score bar', () => {
    render(<CreatorPublishTransparencyPreview {...defaultProps} />);
    expect(screen.getByTestId('confidence-score-bar')).toBeInTheDocument();
  });
});
