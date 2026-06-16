import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SafetyPage from '@/app/(public)/safety/page';

describe('SafetyPage', () => {
  it('renders without crashing', () => {
    render(<SafetyPage />);
    expect(screen.getByTestId('safety-page')).toBeInTheDocument();
  });

  it('shows all 4 hotline resources', () => {
    render(<SafetyPage />);
    expect(screen.getByTestId('safety-hotline-988')).toBeInTheDocument();
    expect(screen.getByTestId('safety-hotline-crisis-text')).toBeInTheDocument();
    expect(screen.getByTestId('safety-hotline-nami')).toBeInTheDocument();
    expect(screen.getByTestId('safety-hotline-iasp')).toBeInTheDocument();
  });

  it('displays 988 hotline text', () => {
    render(<SafetyPage />);
    expect(screen.getByText('988 Suicide & Crisis Lifeline')).toBeInTheDocument();
    expect(screen.getByText('Call or text 988')).toBeInTheDocument();
  });

  it('renders all 3 compliance table rows (CA SB 243, NY AI Companion Law, WA HB 2822)', () => {
    render(<SafetyPage />);
    expect(screen.getByTestId('safety-compliance-ca-sb-243')).toBeInTheDocument();
    expect(screen.getByTestId('safety-compliance-ny-ai')).toBeInTheDocument();
    expect(screen.getByTestId('safety-compliance-wa-hb-2822')).toBeInTheDocument();
    expect(screen.getByText('CA SB 243')).toBeInTheDocument();
    expect(screen.getByText('NY AI Companion Law')).toBeInTheDocument();
    expect(screen.getByText('WA HB 2822')).toBeInTheDocument();
  });

  it('has a link to /trust', () => {
    render(<SafetyPage />);
    const link = screen.getByTestId('safety-trust-link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/trust');
  });
});
