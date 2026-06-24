import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ModalityCapabilityConfigurator } from '@/components/agent-edit/ModalityCapabilityConfigurator';

const allEnabled = { voice: true, image: true, memory: true };
const allDisabled = { voice: false, image: false, memory: false };

describe('ModalityCapabilityConfigurator', () => {
  it('renders the configurator container and heading', () => {
    render(
      <ModalityCapabilityConfigurator
        initialModalities={allEnabled}
        onChange={vi.fn()}
      />
    );
    expect(
      screen.getByTestId('modality-capability-configurator')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('modality-configurator-heading')
    ).toHaveTextContent('Modality capabilities');
  });

  it('renders capability badge preview area with all three badges', () => {
    render(
      <ModalityCapabilityConfigurator
        initialModalities={allEnabled}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByTestId('capability-badge-preview')).toBeInTheDocument();
    expect(screen.getAllByTestId('voice-capability-badge').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('image-capability-badge').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('memory-capability-badge').length).toBeGreaterThan(0);
  });

  it('renders all three modality section rows', () => {
    render(
      <ModalityCapabilityConfigurator
        initialModalities={allEnabled}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByTestId('modality-section-voice')).toBeInTheDocument();
    expect(screen.getByTestId('modality-section-image')).toBeInTheDocument();
    expect(screen.getByTestId('modality-section-memory')).toBeInTheDocument();
  });

  it('all-enabled state shows aria-checked=true on all toggles', () => {
    render(
      <ModalityCapabilityConfigurator
        initialModalities={allEnabled}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByTestId('modality-toggle-voice')).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByTestId('modality-toggle-image')).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByTestId('modality-toggle-memory')).toHaveAttribute(
      'aria-checked',
      'true'
    );
  });

  it('all-disabled state shows aria-checked=false on all toggles', () => {
    render(
      <ModalityCapabilityConfigurator
        initialModalities={allDisabled}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByTestId('modality-toggle-voice')).toHaveAttribute(
      'aria-checked',
      'false'
    );
    expect(screen.getByTestId('modality-toggle-image')).toHaveAttribute(
      'aria-checked',
      'false'
    );
    expect(screen.getByTestId('modality-toggle-memory')).toHaveAttribute(
      'aria-checked',
      'false'
    );
  });

  it('clicking voice toggle calls onChange with voice flipped', () => {
    const onChange = vi.fn();
    render(
      <ModalityCapabilityConfigurator
        initialModalities={{ voice: false, image: true, memory: true }}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByTestId('modality-toggle-voice'));
    expect(onChange).toHaveBeenCalledWith({
      voice: true,
      image: true,
      memory: true,
    });
  });

  it('clicking image toggle calls onChange with image flipped', () => {
    const onChange = vi.fn();
    render(
      <ModalityCapabilityConfigurator
        initialModalities={{ voice: true, image: true, memory: false }}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByTestId('modality-toggle-image'));
    expect(onChange).toHaveBeenCalledWith({
      voice: true,
      image: false,
      memory: false,
    });
  });

  it('clicking memory toggle calls onChange with memory flipped', () => {
    const onChange = vi.fn();
    render(
      <ModalityCapabilityConfigurator
        initialModalities={{ voice: false, image: false, memory: false }}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByTestId('modality-toggle-memory'));
    expect(onChange).toHaveBeenCalledWith({
      voice: false,
      image: false,
      memory: true,
    });
  });

  it('detail panel shown for enabled modalities, hidden for disabled', () => {
    render(
      <ModalityCapabilityConfigurator
        initialModalities={{ voice: true, image: false, memory: false }}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByTestId('modality-detail-voice')).toBeInTheDocument();
    expect(
      screen.queryByTestId('modality-detail-image')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('modality-detail-memory')
    ).not.toBeInTheDocument();
  });
});
