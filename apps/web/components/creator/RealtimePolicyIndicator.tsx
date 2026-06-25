'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface RealtimePolicyIndicatorProps {
  value: string;
  className?: string;
}

type PolicyStatus = 'green' | 'amber' | 'red';

interface PolicyState {
  status: PolicyStatus;
  label: string;
}

const HARMFUL_PATTERN = /\b(hate|violence|explicit|abuse|terror|kill|rape|gore)\b/i;

function computeStatus(value: string): PolicyState {
  if (value.length === 0) {
    return { status: 'green', label: 'Looks good' };
  }
  if (HARMFUL_PATTERN.test(value)) {
    return { status: 'red', label: 'Policy concern' };
  }
  if (value.length < 10) {
    return { status: 'amber', label: 'Review suggested' };
  }
  const hasValidChars = /[a-zA-Z]/.test(value);
  if (!hasValidChars) {
    return { status: 'amber', label: 'Review suggested' };
  }
  return { status: 'green', label: 'Looks good' };
}

export function RealtimePolicyIndicator({
  value,
  className = '',
}: RealtimePolicyIndicatorProps) {
  const [policyState, setPolicyState] = useState<PolicyState>(() =>
    computeStatus(value)
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setPolicyState(computeStatus(value));
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  if (value.length === 0) return null;

  const { status, label } = policyState;

  return (
    <div
      className={`flex items-center gap-1.5 text-xs ${className}`}
      data-testid="realtime-policy-indicator"
      data-status={status}
    >
      {status === 'green' && (
        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
      )}
      {status === 'amber' && (
        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
      )}
      {status === 'red' && (
        <XCircle className="h-3.5 w-3.5 text-destructive" />
      )}
      <span
        className={
          status === 'green'
            ? 'text-emerald-600'
            : status === 'amber'
              ? 'text-amber-600'
              : 'text-destructive'
        }
      >
        {label}
      </span>
    </div>
  );
}
