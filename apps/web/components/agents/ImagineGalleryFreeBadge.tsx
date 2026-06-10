import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagineGalleryFreeBadgeProps {
  className?: string;
}

export function ImagineGalleryFreeBadge({
  className,
}: ImagineGalleryFreeBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex flex-col gap-1 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2',
        className
      )}
      data-testid="imagine-gallery-free-badge"
      title="AI image generation is free for all users — no c.ai+ subscription required"
    >
      <div className="flex items-center gap-1.5">
        <ImageIcon
          className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
          aria-hidden="true"
          data-testid="imagine-gallery-free-badge-icon"
        />
        <span
          className="text-xs font-bold text-emerald-700 dark:text-emerald-400"
          data-testid="imagine-gallery-free-badge-stat"
        >
          Image gen free — all tiers
        </span>
      </div>
      <span
        className="text-[10px] font-medium text-muted-foreground"
        data-testid="imagine-gallery-free-badge-attribution"
      >
        No c.ai+ required
      </span>
    </div>
  );
}
