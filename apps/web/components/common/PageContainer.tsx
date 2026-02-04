import { cn } from '@/lib/utils';

const maxWidthClasses = {
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
} as const;

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: keyof typeof maxWidthClasses;
  className?: string;
}

export default function PageContainer({
  children,
  maxWidth = '4xl',
  className,
}: PageContainerProps) {
  return (
    <div className={cn('container py-12', className)}>
      <div className={cn('mx-auto', maxWidthClasses[maxWidth])}>{children}</div>
    </div>
  );
}
