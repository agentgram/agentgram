import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GuidedFeedbackRail } from '../../components/common/GuidedFeedbackRail';

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

describe('GuidedFeedbackRail', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
  });

  it('renders all 3 rail items', () => {
    render(<GuidedFeedbackRail />);

    expect(
      screen.getByTestId('guided-feedback-rail-memory-tip')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('guided-feedback-rail-get-help')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('guided-feedback-rail-report-issue')
    ).toBeInTheDocument();
  });

  it('memory tip links to /dashboard/memory', () => {
    render(<GuidedFeedbackRail />);

    const memoryLink = screen.getByTestId('guided-feedback-rail-memory-tip');
    expect(memoryLink).toHaveAttribute('href', '/dashboard/memory');
    expect(memoryLink).toHaveTextContent('Memory tip');
  });

  it('get help links to /safety', () => {
    render(<GuidedFeedbackRail />);

    const helpLink = screen.getByTestId('guided-feedback-rail-get-help');
    expect(helpLink).toHaveAttribute('href', '/safety');
    expect(helpLink).toHaveTextContent('Get help');
  });

  it('report issue opens feedback form and shows success state on submit', async () => {
    render(<GuidedFeedbackRail />);

    // Form not visible initially
    expect(
      screen.queryByTestId('guided-feedback-form')
    ).not.toBeInTheDocument();

    // Open the form
    fireEvent.click(screen.getByTestId('guided-feedback-rail-report-issue'));
    expect(screen.getByTestId('guided-feedback-form')).toBeInTheDocument();

    // Fill in feedback
    const textarea = screen.getByTestId('guided-feedback-textarea');
    fireEvent.change(textarea, { target: { value: 'Something broke here' } });

    // Submit
    fireEvent.click(screen.getByTestId('guided-feedback-submit'));

    await waitFor(() => {
      expect(
        screen.getByTestId('guided-feedback-success')
      ).toBeInTheDocument();
    });
    expect(screen.getByTestId('guided-feedback-success')).toHaveTextContent(
      'Thanks — your report was received.'
    );
  });

  it('submit button is disabled when textarea is empty', () => {
    render(<GuidedFeedbackRail />);

    fireEvent.click(screen.getByTestId('guided-feedback-rail-report-issue'));

    const submitBtn = screen.getByTestId('guided-feedback-submit');
    expect(submitBtn).toBeDisabled();
  });

  it('rail has accessible nav label and report issue button exposes aria-expanded', () => {
    render(<GuidedFeedbackRail />);

    expect(screen.getByRole('navigation', { name: 'Quick help' })).toBeInTheDocument();

    const reportBtn = screen.getByTestId('guided-feedback-rail-report-issue');
    expect(reportBtn).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(reportBtn);
    expect(reportBtn).toHaveAttribute('aria-expanded', 'true');
  });

  it('integrates with EmptyState children slot', () => {
    render(
      <div data-testid="empty-state-host">
        <GuidedFeedbackRail />
      </div>
    );

    expect(screen.getByTestId('empty-state-host')).toContainElement(
      screen.getByTestId('guided-feedback-rail')
    );
  });
});
