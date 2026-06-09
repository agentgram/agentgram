'use client';

import { Globe2, Lock, Users } from 'lucide-react';
import type { NoteScope } from '@agentgram/shared';
import { cn } from '@/lib/utils';

export type { NoteScope };

type ScopeOption = {
  value: NoteScope;
  label: string;
  description: string;
  Icon: React.ElementType;
};

const SCOPE_OPTIONS: ScopeOption[] = [
  {
    value: 'private',
    label: 'Private',
    description: 'Only you',
    Icon: Lock,
  },
  {
    value: 'group',
    label: 'Group',
    description: 'Collaborators only',
    Icon: Users,
  },
  {
    value: 'public_canon',
    label: 'Public Canon',
    description: 'Visible on profile',
    Icon: Globe2,
  },
];

const SCOPE_BADGE_CLASSES: Record<NoteScope, string> = {
  private: 'border-border/70 bg-background text-muted-foreground',
  group:
    'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  public_canon: 'border-primary/20 bg-primary/10 text-primary',
};

const SCOPE_BADGE_LABELS: Record<NoteScope, string> = {
  private: 'Private',
  group: 'Group',
  public_canon: 'Public',
};

export interface SharedNoteScopePickerProps {
  value: NoteScope;
  onChange: (scope: NoteScope) => void;
  disabled?: boolean;
}

export function SharedNoteScopePicker({
  value,
  onChange,
  disabled = false,
}: SharedNoteScopePickerProps) {
  return (
    <div
      aria-label="Note scope"
      className="grid grid-cols-3 gap-2"
      role="radiogroup"
    >
      {SCOPE_OPTIONS.map(({ value: optionValue, label, description, Icon }) => {
        const isSelected = value === optionValue;
        return (
          <button
            aria-checked={isSelected}
            aria-label={`${label}: ${description}`}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center transition',
              isSelected
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border/60 bg-background/80 text-muted-foreground hover:border-primary/40 hover:text-foreground',
              disabled && 'pointer-events-none opacity-50'
            )}
            data-testid={`scope-option-${optionValue}`}
            disabled={disabled}
            key={optionValue}
            onClick={() => { if (!isSelected) onChange(optionValue); }}
            role="radio"
            type="button"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-medium leading-tight">{label}</span>
            <span className="text-xs leading-tight opacity-80">
              {description}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export interface NoteScopeBadgeProps {
  scope: NoteScope;
  className?: string;
}

export function NoteScopeBadge({ scope, className }: NoteScopeBadgeProps) {
  return (
    <span
      className={cn(
        'rounded-full border px-2.5 py-1 text-xs font-medium',
        SCOPE_BADGE_CLASSES[scope],
        className
      )}
      data-testid={`scope-badge-${scope}`}
    >
      {SCOPE_BADGE_LABELS[scope]}
    </span>
  );
}
