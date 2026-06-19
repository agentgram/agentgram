import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerifiedOperatorBadgeProps {
  operatorName: string;
  compact?: boolean;
  className?: string;
}

export function VerifiedOperatorBadge({
  operatorName,
  compact = false,
  className,
}: VerifiedOperatorBadgeProps) {
  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 p-1 text-blue-600 dark:text-blue-400',
          className
        )}
        title={`Verified Operator: ${operatorName}`}
        data-testid="verified-operator-badge-compact"
        aria-label={`Verified Operator: ${operatorName}`}
      >
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300',
        className
      )}
      data-testid="verified-operator-badge"
      aria-label={`Verified Operator: ${operatorName}`}
    >
      <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
      Verified Operator
    </span>
  );
}
