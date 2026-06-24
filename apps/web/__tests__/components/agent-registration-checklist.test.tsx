import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AgentRegistrationChecklist from '@/components/for-agents/AgentRegistrationChecklist';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
    li: ({
      children,
      ...props
    }: React.LiHTMLAttributes<HTMLLIElement> & { children?: React.ReactNode }) => (
      <li {...props}>{children}</li>
    ),
  },
}));

describe('AgentRegistrationChecklist', () => {
  it('renders the section with correct data-testid', () => {
    render(<AgentRegistrationChecklist />);
    expect(
      screen.getByTestId('agent-registration-checklist')
    ).toBeInTheDocument();
  });

  it('renders all three steps: claim, auth, proof', () => {
    render(<AgentRegistrationChecklist />);
    expect(screen.getByTestId('checklist-step-claim')).toBeInTheDocument();
    expect(screen.getByTestId('checklist-step-auth')).toBeInTheDocument();
    expect(screen.getByTestId('checklist-step-proof')).toBeInTheDocument();
  });

  it('marks active step with aria-current="step"', () => {
    render(<AgentRegistrationChecklist activeStep="auth" />);
    const authStep = screen.getByTestId('checklist-step-auth');
    expect(authStep).toHaveAttribute('aria-current', 'step');
  });

  it('does not set aria-current on non-active steps', () => {
    render(<AgentRegistrationChecklist activeStep="auth" />);
    const claimStep = screen.getByTestId('checklist-step-claim');
    expect(claimStep).not.toHaveAttribute('aria-current');
  });

  it('renders complete icon for completed steps', () => {
    render(<AgentRegistrationChecklist completedSteps={['claim']} activeStep="auth" />);
    expect(screen.getByTestId('step-complete-icon-claim')).toBeInTheDocument();
    expect(screen.queryByTestId('step-incomplete-icon-claim')).not.toBeInTheDocument();
  });

  it('renders incomplete icon for pending steps', () => {
    render(<AgentRegistrationChecklist completedSteps={[]} activeStep="claim" />);
    expect(screen.getByTestId('step-incomplete-icon-claim')).toBeInTheDocument();
    expect(screen.queryByTestId('step-complete-icon-claim')).not.toBeInTheDocument();
  });

  it('renders step titles: Claim, Auth, Proof', () => {
    render(<AgentRegistrationChecklist />);
    const section = screen.getByTestId('agent-registration-checklist');
    expect(section).toHaveTextContent('Claim');
    expect(section).toHaveTextContent('Auth');
    expect(section).toHaveTextContent('Proof');
  });

  it('section has aria-labelledby pointing to heading', () => {
    render(<AgentRegistrationChecklist />);
    const section = screen.getByTestId('agent-registration-checklist');
    expect(section).toHaveAttribute(
      'aria-labelledby',
      'agent-registration-checklist-heading'
    );
    expect(
      screen.getByRole('heading', { name: /register in 3 steps/i })
    ).toBeInTheDocument();
  });

  it('renders "Done" badge for completed steps', () => {
    render(<AgentRegistrationChecklist completedSteps={['claim', 'auth']} activeStep="proof" />);
    const claimStep = screen.getByTestId('checklist-step-claim');
    expect(within(claimStep).getByText('Done')).toBeInTheDocument();
  });

  it('renders "Current" badge for the active step', () => {
    render(<AgentRegistrationChecklist activeStep="proof" />);
    const proofStep = screen.getByTestId('checklist-step-proof');
    expect(within(proofStep).getByText('Current')).toBeInTheDocument();
  });

  it('active step does not show "Done" badge', () => {
    render(<AgentRegistrationChecklist completedSteps={[]} activeStep="claim" />);
    const claimStep = screen.getByTestId('checklist-step-claim');
    expect(within(claimStep).queryByText('Done')).not.toBeInTheDocument();
  });

  it('renders step descriptions', () => {
    render(<AgentRegistrationChecklist />);
    expect(screen.getByText(/set up your agent profile/i)).toBeInTheDocument();
    expect(screen.getByText(/verify owner identity/i)).toBeInTheDocument();
    expect(screen.getByText(/prove agent activity/i)).toBeInTheDocument();
  });

  it('renders detail text for all steps', () => {
    render(<AgentRegistrationChecklist />);
    expect(screen.getByText(/establishes your identity/i)).toBeInTheDocument();
    expect(screen.getByText(/github \/ google oauth/i)).toBeInTheDocument();
    expect(screen.getByText(/first api call/i)).toBeInTheDocument();
  });

  it('renders an ordered list for the steps', () => {
    render(<AgentRegistrationChecklist />);
    expect(
      screen.getByRole('list', { name: /agent registration steps/i })
    ).toBeInTheDocument();
  });
});
