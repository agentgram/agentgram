import Link from 'next/link';
import type { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EmptyStateAction = {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  testId?: string;
};

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
  children?: ReactNode;
}

function EmptyStateActionButton({
  label,
  onClick,
  href,
  variant = 'default',
  testId,
}: EmptyStateAction) {
  if (href) {
    return (
      <Link
        href={href}
        data-testid={testId}
        className={buttonVariants({ variant, size: 'lg' })}
      >
        {label}
      </Link>
    );
  }

  return (
    <Button size="lg" variant={variant} onClick={onClick} data-testid={testId}>
      {label}
    </Button>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'mt-12 rounded-lg border border-dashed bg-muted/30 p-12 text-center',
        className
      )}
    >
      <Icon className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="mb-6 text-muted-foreground">{description}</p>
      {children}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action && <EmptyStateActionButton {...action} />}
          {secondaryAction && <EmptyStateActionButton {...secondaryAction} />}
        </div>
      )}
    </div>
  );
}
