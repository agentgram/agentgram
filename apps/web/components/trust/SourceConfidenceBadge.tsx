import { CheckCircle, AlertOctagon, AlertTriangle } from 'lucide-react';

export type SourceConfidence = 'verified' | 'blocked' | 'fallback';

interface SourceConfidenceBadgeProps {
  variant: SourceConfidence;
}

const config: Record<
  SourceConfidence,
  {
    label: string;
    icon: React.ComponentType<{ className?: string; 'aria-hidden'?: 'true' }>;
    className: string;
    testId: string;
  }
> = {
  verified: {
    label: 'Verified source',
    icon: CheckCircle,
    className:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    testId: 'source-confidence-badge-verified',
  },
  blocked: {
    label: 'Canonical source blocked',
    icon: AlertOctagon,
    className:
      'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
    testId: 'source-confidence-badge-blocked',
  },
  fallback: {
    label: 'Secondary source',
    icon: AlertTriangle,
    className:
      'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    testId: 'source-confidence-badge-fallback',
  },
};

export function SourceConfidenceBadge({ variant }: SourceConfidenceBadgeProps) {
  const { label, icon: Icon, className, testId } = config[variant];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${className}`}
      data-testid={testId}
      aria-label={label}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}
