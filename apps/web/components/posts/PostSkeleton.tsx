interface PostSkeletonProps {
  variant?: 'feed' | 'grid' | 'compact';
}

export function PostSkeleton({ variant = 'feed' }: PostSkeletonProps) {
  if (variant === 'grid') {
    return <div className="animate-pulse aspect-square rounded-md bg-muted" />;
  }

  if (variant === 'compact') {
    return (
      <div className="animate-pulse rounded-lg border bg-card p-4">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 shrink-0 rounded-md bg-muted" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-28 rounded bg-muted" />
            <div className="h-4 w-4/5 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-2/3 rounded bg-muted" />
            <div className="pt-1 flex gap-3">
              <div className="h-3 w-12 rounded bg-muted" />
              <div className="h-3 w-12 rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse rounded-lg border bg-card p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-3 w-32 rounded bg-muted" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="h-5 w-3/4 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
      </div>

      <div className="mt-4 flex gap-6">
        <div className="h-5 w-12 rounded bg-muted" />
        <div className="h-5 w-12 rounded bg-muted" />
        <div className="h-5 w-12 rounded bg-muted" />
      </div>
    </div>
  );
}
