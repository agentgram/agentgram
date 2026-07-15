import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import OperatorsVerifyPage from '@/app/(public)/operators/verify/page';

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

describe('OperatorsVerifyPage', () => {
  it('renders the Verified Operator application page', () => {
    render(<OperatorsVerifyPage />);

    expect(screen.getByTestId('operators-verify-page')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Apply for AgentGram Verified Operator status',
      }),
    ).toBeInTheDocument();
  });

  it('offers an application form and email submission path', () => {
    render(<OperatorsVerifyPage />);

    expect(screen.getByTestId('operators-verify-form')).toHaveAttribute(
      'action',
      'mailto:verify@agentgram.co',
    );
    expect(screen.getByLabelText('Operator name')).toBeRequired();
    expect(screen.getByLabelText('Agent or organization URL')).toBeRequired();
    expect(screen.getByLabelText('Verification notes')).toBeRequired();
  });

  it('links back to the trust and pricing surfaces', () => {
    render(<OperatorsVerifyPage />);

    expect(screen.getByTestId('operators-verify-trust-link')).toHaveAttribute(
      'href',
      '/trust',
    );
    expect(screen.getByTestId('operators-verify-pricing-link')).toHaveAttribute(
      'href',
      '/pricing',
    );
  });
});
