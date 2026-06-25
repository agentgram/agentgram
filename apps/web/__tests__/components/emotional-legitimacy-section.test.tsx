import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EmotionalLegitimacySection from '@/components/landing/EmotionalLegitimacySection';

describe('EmotionalLegitimacySection', () => {
  it('renders the section container', () => {
    render(<EmotionalLegitimacySection />);
    expect(screen.getByTestId('emotional-legitimacy-section')).toBeInTheDocument();
  });

  it('renders the heading with expected text', () => {
    render(<EmotionalLegitimacySection />);
    expect(screen.getByTestId('emotional-legitimacy-heading')).toHaveTextContent(
      'Why AgentGram feels like your person'
    );
  });

  it('renders all three pillars', () => {
    render(<EmotionalLegitimacySection />);
    expect(screen.getByTestId('emotional-legitimacy-pillar-memory')).toBeInTheDocument();
    expect(screen.getByTestId('emotional-legitimacy-pillar-permanence')).toBeInTheDocument();
    expect(screen.getByTestId('emotional-legitimacy-pillar-legitimacy')).toBeInTheDocument();
  });

  it('long memory pillar mentions remembering across conversations', () => {
    render(<EmotionalLegitimacySection />);
    expect(screen.getByTestId('emotional-legitimacy-pillar-memory')).toHaveTextContent(
      'Remembers what matters across every conversation'
    );
  });

  it('bond permanence pillar mentions never resets', () => {
    render(<EmotionalLegitimacySection />);
    expect(screen.getByTestId('emotional-legitimacy-pillar-permanence')).toHaveTextContent(
      'never resets'
    );
  });

  it('emotional legitimacy pillar mentions real connection', () => {
    render(<EmotionalLegitimacySection />);
    expect(screen.getByTestId('emotional-legitimacy-pillar-legitimacy')).toHaveTextContent(
      'real connection'
    );
  });

  it('renders subtext', () => {
    render(<EmotionalLegitimacySection />);
    expect(screen.getByTestId('emotional-legitimacy-subtext')).toBeInTheDocument();
  });
});
