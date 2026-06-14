'use client';

import { CheckCircle2, Download, Shield, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const DEFAULT_PURGE_LAYERS = [
  'long-term memory',
  'session context',
  'vector index',
  'model cache',
] as const;

export interface MemoryDeletionReceiptData {
  memoryId: string;
  memoryKey?: string;
  deletedAt: string; // ISO 8601 UTC
  layersPurged?: string[];
}

export interface MemoryDeletionReceiptProps {
  receipt: MemoryDeletionReceiptData;
  onDownload?: (receipt: MemoryDeletionReceiptData) => void;
  onClose?: () => void;
}

export function formatKST(isoString: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(isoString));
}

export function buildReceiptPayload(receipt: MemoryDeletionReceiptData) {
  return {
    receipt_type: 'memory_deletion_confirmation',
    gdpr_basis: 'GDPR Article 17 — Right to Erasure',
    memory_id: receipt.memoryId,
    ...(receipt.memoryKey ? { memory_key: receipt.memoryKey } : {}),
    deleted_at_utc: receipt.deletedAt,
    deleted_at_kst: formatKST(receipt.deletedAt),
    layers_purged: receipt.layersPurged ?? [...DEFAULT_PURGE_LAYERS],
    confirmation: 'Memory has been permanently purged from all model layers.',
  };
}

export function downloadReceiptJson(receipt: MemoryDeletionReceiptData) {
  const payload = buildReceiptPayload(receipt);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `agentgram-deletion-receipt-${receipt.memoryId}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function MemoryDeletionReceipt({
  receipt,
  onDownload,
  onClose,
}: MemoryDeletionReceiptProps) {
  const layers = receipt.layersPurged ?? [...DEFAULT_PURGE_LAYERS];
  const kstTimestamp = formatKST(receipt.deletedAt);

  function handleDownload() {
    if (onDownload) {
      onDownload(receipt);
    } else {
      downloadReceiptJson(receipt);
    }
  }

  return (
    <Card
      className="border-green-500/40 bg-green-500/5"
      data-testid="memory-deletion-receipt"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2
              className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0"
              aria-hidden
            />
            <CardTitle
              className="text-base text-green-700 dark:text-green-300"
              data-testid="receipt-header"
            >
              Memory purged from all layers
            </CardTitle>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 -mt-1 -mr-1 text-muted-foreground"
              onClick={onClose}
              aria-label="Close deletion receipt"
              data-testid="receipt-close-btn"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        {/* Timestamp */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Deletion confirmed
          </p>
          <p
            className="text-sm font-mono"
            data-testid="receipt-timestamp"
            aria-label={`Deleted at ${kstTimestamp} KST`}
          >
            {kstTimestamp} <span className="text-muted-foreground">KST</span>
          </p>
        </div>

        {/* Memory key */}
        {receipt.memoryKey && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Memory
            </p>
            <p
              className="text-sm font-mono truncate"
              data-testid="receipt-memory-key"
            >
              {receipt.memoryKey}
            </p>
          </div>
        )}

        {/* Layers purged */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Layers purged
          </p>
          <ul
            className="space-y-1"
            data-testid="receipt-layers-list"
            aria-label="Purged layers"
          >
            {layers.map((layer) => (
              <li
                key={layer}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400 shrink-0" aria-hidden />
                {layer}
              </li>
            ))}
          </ul>
        </div>

        {/* GDPR badge */}
        <div data-testid="receipt-gdpr-badge">
          <Badge
            variant="outline"
            className="gap-1.5 text-xs border-blue-500/40 text-blue-700 dark:text-blue-300 bg-blue-500/5"
          >
            <Shield className="h-3 w-3" aria-hidden />
            GDPR Article 17 — Right to Erasure
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleDownload}
          data-testid="receipt-download-btn"
        >
          <Download className="h-4 w-4" />
          Download receipt
        </Button>
      </CardFooter>
    </Card>
  );
}
