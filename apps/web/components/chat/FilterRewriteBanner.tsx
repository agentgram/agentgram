'use client';

const FILTER_RISK_PATTERNS = [
  /\b(kill|murder)\b/i,
  /\b(explicit|nsfw|sexual|nude)\b/i,
  /[A-Z]{5,}/,
  /(.)\1{4,}/,
];

export function estimateFilterRisk(msg: string): boolean {
  return FILTER_RISK_PATTERNS.some((p) => p.test(msg));
}

export function suggestRewrite(msg: string): string {
  return msg
    .replace(/\b(kill|murder)\b/gi, 'stop')
    .replace(/\b(explicit|nsfw|sexual|nude)\b/gi, 'mature')
    .replace(/[A-Z]{5,}/g, (m) => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase())
    .replace(/(.)\1{4,}/g, '$1$1');
}

interface FilterRewriteBannerProps {
  message: string;
  onAcceptRewrite: (rewrite: string) => void;
  onDismiss: () => void;
}

export function FilterRewriteBanner({
  message,
  onAcceptRewrite,
  onDismiss,
}: FilterRewriteBannerProps) {
  if (!message || !estimateFilterRisk(message)) return null;

  const rewrite = suggestRewrite(message);

  return (
    <div
      role="alert"
      data-testid="filter-rewrite-banner"
      className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm dark:border-amber-700 dark:bg-amber-950/30"
    >
      <p className="font-medium text-amber-800 dark:text-amber-300">
        This message might be filtered. Try this safer version:
      </p>
      <p
        className="mt-1 text-amber-700 dark:text-amber-400"
        data-testid="filter-rewrite-suggestion"
      >
        {rewrite}
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          data-testid="filter-rewrite-accept"
          onClick={() => onAcceptRewrite(rewrite)}
          className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          Use this rewrite
        </button>
        <button
          type="button"
          data-testid="filter-rewrite-dismiss"
          onClick={onDismiss}
          className="rounded-md border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/30"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
