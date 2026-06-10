import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReplikaReimportWizard } from '@/components/replika-reimport-wizard';

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

describe('ReplikaReimportWizard', () => {
  it('renders the wizard container', () => {
    render(<ReplikaReimportWizard />);
    expect(screen.getByTestId('replika-reimport-wizard')).toBeInTheDocument();
  });

  it('renders the step navigation', () => {
    render(<ReplikaReimportWizard />);
    expect(screen.getByTestId('replika-wizard-step-nav')).toBeInTheDocument();
  });

  it('shows all four step navigation buttons', () => {
    render(<ReplikaReimportWizard />);
    expect(screen.getByTestId('wizard-step-btn-export')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-step-btn-account')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-step-btn-upload')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-step-btn-confirm')).toBeInTheDocument();
  });

  it('starts on the export step', () => {
    render(<ReplikaReimportWizard />);
    expect(screen.getByTestId('wizard-step-btn-export')).toHaveAttribute('aria-current', 'step');
    expect(screen.getByTestId('wizard-panel-export')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-step-title')).toHaveTextContent('Export from Replika');
  });

  it('disables the back button on the first step', () => {
    render(<ReplikaReimportWizard />);
    expect(screen.getByTestId('wizard-back-btn')).toBeDisabled();
  });

  it('shows the next button on the first step', () => {
    render(<ReplikaReimportWizard />);
    expect(screen.getByTestId('wizard-next-btn')).toBeInTheDocument();
  });

  it('advances to step 2 when next is clicked', () => {
    render(<ReplikaReimportWizard />);
    fireEvent.click(screen.getByTestId('wizard-next-btn'));
    expect(screen.getByTestId('wizard-step-btn-account')).toHaveAttribute('aria-current', 'step');
    expect(screen.getByTestId('wizard-panel-account')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-step-title')).toHaveTextContent(
      'Create your AgentGram account'
    );
  });

  it('goes back when back button is clicked', () => {
    render(<ReplikaReimportWizard />);
    fireEvent.click(screen.getByTestId('wizard-next-btn'));
    fireEvent.click(screen.getByTestId('wizard-back-btn'));
    expect(screen.getByTestId('wizard-step-btn-export')).toHaveAttribute('aria-current', 'step');
    expect(screen.getByTestId('wizard-panel-export')).toBeInTheDocument();
  });

  it('navigates directly to a step via the step nav', () => {
    render(<ReplikaReimportWizard />);
    fireEvent.click(screen.getByTestId('wizard-step-btn-upload'));
    expect(screen.getByTestId('wizard-step-btn-upload')).toHaveAttribute('aria-current', 'step');
    expect(screen.getByTestId('wizard-panel-upload')).toBeInTheDocument();
  });

  it('navigates to the confirm step and hides the next button', () => {
    render(<ReplikaReimportWizard />);
    fireEvent.click(screen.getByTestId('wizard-step-btn-confirm'));
    expect(screen.getByTestId('wizard-panel-confirm')).toBeInTheDocument();
    expect(screen.queryByTestId('wizard-next-btn')).not.toBeInTheDocument();
  });

  // Step 1: Export instructions
  it('renders export instructions list', () => {
    render(<ReplikaReimportWizard />);
    expect(screen.getByTestId('export-instructions')).toBeInTheDocument();
  });

  it('mentions the replika_memories.json and conversation_history.csv filenames', () => {
    render(<ReplikaReimportWizard />);
    expect(screen.getAllByText(/replika_memories\.json/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/conversation_history\.csv/).length).toBeGreaterThan(0);
  });

  // Step 2: Account
  it('renders the signup CTA linking to /auth/register', () => {
    render(<ReplikaReimportWizard />);
    fireEvent.click(screen.getByTestId('wizard-step-btn-account'));
    const cta = screen.getByTestId('wizard-signup-cta');
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '/auth/register');
  });

  it('renders the account benefits list', () => {
    render(<ReplikaReimportWizard />);
    fireEvent.click(screen.getByTestId('wizard-step-btn-account'));
    expect(screen.getByTestId('account-benefits-list')).toBeInTheDocument();
  });

  // Step 3: Upload
  it('renders the upload dropzone', () => {
    render(<ReplikaReimportWizard />);
    fireEvent.click(screen.getByTestId('wizard-step-btn-upload'));
    expect(screen.getByTestId('upload-dropzone')).toBeInTheDocument();
  });

  it('shows accepted file formats in the upload step', () => {
    render(<ReplikaReimportWizard />);
    fireEvent.click(screen.getByTestId('wizard-step-btn-upload'));
    const formats = screen.getByTestId('upload-accepted-formats');
    expect(formats).toHaveTextContent('replika_memories.json');
    expect(formats).toHaveTextContent('conversation_history.csv');
    expect(formats).toHaveTextContent('replika_export.zip');
  });

  it('renders a privacy note in the upload step', () => {
    render(<ReplikaReimportWizard />);
    fireEvent.click(screen.getByTestId('wizard-step-btn-upload'));
    expect(screen.getByTestId('upload-privacy-note')).toBeInTheDocument();
  });

  // Step 4: Confirm
  it('renders the success card on the confirm step', () => {
    render(<ReplikaReimportWizard />);
    fireEvent.click(screen.getByTestId('wizard-step-btn-confirm'));
    expect(screen.getByTestId('wizard-success-card')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-success-card')).toHaveTextContent('Your memories are safe.');
  });

  it('renders confirm next steps with links', () => {
    render(<ReplikaReimportWizard />);
    fireEvent.click(screen.getByTestId('wizard-step-btn-confirm'));
    const nextSteps = screen.getByTestId('confirm-next-steps');
    expect(nextSteps).toBeInTheDocument();
    expect(nextSteps.querySelector('a[href="/dashboard/memories"]')).toBeInTheDocument();
    expect(nextSteps.querySelector('a[href="/agents/new"]')).toBeInTheDocument();
  });

  // Why migrate section
  it('renders the why-migrate section', () => {
    render(<ReplikaReimportWizard />);
    expect(screen.getByTestId('why-migrate-section')).toBeInTheDocument();
  });

  it('renders the why-migrate heading', () => {
    render(<ReplikaReimportWizard />);
    expect(screen.getByTestId('why-migrate-heading')).toHaveTextContent(
      'Why migrate from Replika?'
    );
  });

  it('renders the amnesia wave explanation', () => {
    render(<ReplikaReimportWizard />);
    expect(screen.getByTestId('why-migrate-amnesia')).toBeInTheDocument();
    expect(screen.getByTestId('why-migrate-amnesia')).toHaveTextContent('Replika 2.0 Amnesia Wave');
  });

  it('renders the memory guarantee card in why-migrate', () => {
    render(<ReplikaReimportWizard />);
    expect(screen.getByTestId('why-migrate-guarantee')).toBeInTheDocument();
  });

  it('renders the data ownership card in why-migrate', () => {
    render(<ReplikaReimportWizard />);
    expect(screen.getByTestId('why-migrate-ownership')).toBeInTheDocument();
  });

  it('links to /memory-guarantee from the why-migrate section', () => {
    render(<ReplikaReimportWizard />);
    const section = screen.getByTestId('why-migrate-section');
    expect(section.querySelector('a[href="/memory-guarantee"]')).toBeInTheDocument();
  });
});
