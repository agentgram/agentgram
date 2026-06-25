import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  DEFAULT_PURGE_LAYERS,
  MemoryDeletionReceipt,
  type MemoryDeletionReceiptData,
  formatKST,
  buildReceiptPayload,
} from '@/components/memory/MemoryDeletionReceipt';

const FIXED_ISO = '2026-06-14T03:51:00.000Z';

function buildReceipt(
  overrides: Partial<MemoryDeletionReceiptData> = {}
): MemoryDeletionReceiptData {
  return {
    memoryId: 'mem-abc123',
    memoryKey: 'favorite_color',
    deletedAt: FIXED_ISO,
    ...overrides,
  };
}

function renderReceipt(
  receiptOverrides: Partial<MemoryDeletionReceiptData> = {},
  props: { onDownload?: (r: MemoryDeletionReceiptData) => void; onClose?: () => void } = {}
) {
  const receipt = buildReceipt(receiptOverrides);
  render(<MemoryDeletionReceipt receipt={receipt} {...props} />);
  return { receipt };
}

describe('MemoryDeletionReceipt', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the receipt container', () => {
    renderReceipt();
    expect(screen.getByTestId('memory-deletion-receipt')).toBeInTheDocument();
  });

  it('shows "Memory purged from all layers" header', () => {
    renderReceipt();
    expect(screen.getByTestId('receipt-header')).toHaveTextContent(
      'Memory purged from all layers'
    );
  });

  it('shows the GDPR Article 17 compliance badge', () => {
    renderReceipt();
    const badge = screen.getByTestId('receipt-gdpr-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('GDPR Article 17 — Right to Erasure');
  });

  it('shows the deletion timestamp', () => {
    renderReceipt({ deletedAt: FIXED_ISO });
    const timestamp = screen.getByTestId('receipt-timestamp');
    expect(timestamp).toBeInTheDocument();
    // KST = UTC+9, so 03:51:00 UTC → 12:51:00 KST
    expect(timestamp).toHaveTextContent('KST');
  });

  it('formats timestamp in KST (UTC+9)', () => {
    const kst = formatKST(FIXED_ISO);
    // 2026-06-14T03:51:00Z → 2026-06-14 12:51:00 KST
    expect(kst).toContain('2026');
    expect(kst).toContain('06');
    expect(kst).toContain('14');
    // 03:51 UTC = 12:51 KST
    expect(kst).toMatch(/12[:\s]51/);
  });

  it('shows the memory key when provided', () => {
    renderReceipt({ memoryKey: 'favorite_color' });
    expect(screen.getByTestId('receipt-memory-key')).toHaveTextContent('favorite_color');
  });

  it('hides the memory key field when memoryKey is not provided', () => {
    renderReceipt({ memoryKey: undefined });
    expect(screen.queryByTestId('receipt-memory-key')).not.toBeInTheDocument();
  });

  it('shows all default purge layers when no layersPurged provided', () => {
    renderReceipt({ layersPurged: undefined });
    const layersList = screen.getByTestId('receipt-layers-list');
    for (const layer of DEFAULT_PURGE_LAYERS) {
      expect(layersList).toHaveTextContent(layer);
    }
  });

  it('shows custom layers when layersPurged is provided', () => {
    renderReceipt({ layersPurged: ['custom-layer-1', 'custom-layer-2'] });
    const layersList = screen.getByTestId('receipt-layers-list');
    expect(layersList).toHaveTextContent('custom-layer-1');
    expect(layersList).toHaveTextContent('custom-layer-2');
    expect(layersList).not.toHaveTextContent('long-term memory');
  });

  it('renders the download receipt button', () => {
    renderReceipt();
    expect(screen.getByTestId('receipt-download-btn')).toBeInTheDocument();
    expect(screen.getByTestId('receipt-download-btn')).toHaveTextContent('Download receipt');
  });

  it('calls onDownload with receipt data when download button is clicked', () => {
    const onDownload = vi.fn();
    const { receipt } = renderReceipt({}, { onDownload });
    fireEvent.click(screen.getByTestId('receipt-download-btn'));
    expect(onDownload).toHaveBeenCalledOnce();
    expect(onDownload).toHaveBeenCalledWith(receipt);
  });

  it('shows close button and calls onClose when clicked', () => {
    const onClose = vi.fn();
    renderReceipt({}, { onClose });
    const closeBtn = screen.getByTestId('receipt-close-btn');
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('hides close button when onClose is not provided', () => {
    renderReceipt();
    expect(screen.queryByTestId('receipt-close-btn')).not.toBeInTheDocument();
  });

  it('buildReceiptPayload includes gdpr_basis and correct fields', () => {
    const receipt = buildReceipt({ memoryKey: 'test_key' });
    const payload = buildReceiptPayload(receipt);
    expect(payload.gdpr_basis).toBe('GDPR Article 17 — Right to Erasure');
    expect(payload.receipt_type).toBe('memory_deletion_confirmation');
    expect(payload.memory_id).toBe('mem-abc123');
    expect(payload.memory_key).toBe('test_key');
    expect(payload.deleted_at_utc).toBe(FIXED_ISO);
    expect(payload.deleted_at_kst).toBeTruthy();
    expect(Array.isArray(payload.layers_purged)).toBe(true);
    expect(payload.confirmation).toContain('purged');
  });

  it('buildReceiptPayload omits memory_key when not provided', () => {
    const receipt = buildReceipt({ memoryKey: undefined });
    const payload = buildReceiptPayload(receipt);
    expect('memory_key' in payload).toBe(false);
  });

  it('receipt-timestamp aria-label contains KST time info', () => {
    renderReceipt({ deletedAt: FIXED_ISO });
    const timestamp = screen.getByTestId('receipt-timestamp');
    expect(timestamp).toHaveAttribute('aria-label', expect.stringContaining('KST'));
  });
});
