import { Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarConsistencyGuaranteeStripProps {
  /** 'strip' renders a full-width banner (pricing page); 'badge' renders an inline pill (profile). */
  variant?: 'strip' | 'badge';
  className?: string;
}

export function AvatarConsistencyGuaranteeStrip({
  variant = 'badge',
  className,
}: AvatarConsistencyGuaranteeStripProps) {
  if (variant === 'strip') {
    return (
      <section
        className={cn('border-y border-violet-500/20 bg-violet-500/5 py-5', className)}
        aria-label="Avatar visual consistency guarantee"
        data-testid="avatar-consistency-guarantee-strip"
      >
        <div className="container">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:text-left">
            <Palette
              className="h-5 w-5 shrink-0 text-violet-500"
              aria-hidden="true"
            />
            <p className="text-sm font-medium">
              <span className="text-foreground">
                Your persona always looks exactly as designed — guaranteed.
              </span>{' '}
              <span className="text-muted-foreground">
                Nomi&apos;s #1 App Store complaint in 2026 is avatar rendering
                inconsistency. AgentGram locks every visual detail at creation:
                no rendering drift, no surprise look changes between sessions.
              </span>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300',
        className
      )}
      title="AgentGram guarantees your persona renders exactly as designed every session — no visual drift"
      data-testid="avatar-consistency-guarantee-badge"
    >
      <Palette className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      Persona always renders as designed
    </div>
  );
}

/**
 * Illustrative comparison gallery showing consistent vs. inconsistent persona rendering.
 * Text-based, no external image deps required.
 */
export function AvatarConsistencyComparisonGallery({
  className,
}: {
  className?: string;
}) {
  const examples = [
    {
      label: 'Hair color',
      designed: 'Auburn, shoulder-length',
      inconsistent: 'Randomly blonde or black',
      consistent: 'Auburn, shoulder-length — every time',
    },
    {
      label: 'Eye color',
      designed: 'Violet eyes',
      inconsistent: 'Green or brown depending on session',
      consistent: 'Violet — locked at creation',
    },
    {
      label: 'Style',
      designed: 'Casual, minimalist wardrobe',
      inconsistent: 'Formal suit, different each render',
      consistent: 'Casual style preserved across sessions',
    },
  ];

  return (
    <div
      className={cn('rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6', className)}
      data-testid="avatar-consistency-comparison-gallery"
      aria-label="Avatar rendering consistency comparison gallery"
    >
      <div className="mb-4 flex items-center gap-2">
        <Palette className="h-5 w-5 text-violet-500" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-foreground">
          Visual consistency — by design
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-violet-500/20">
              <th className="pb-2 text-left font-medium text-muted-foreground">
                Attribute
              </th>
              <th className="pb-2 pl-4 text-left font-medium text-red-600 dark:text-red-400">
                Others (Nomi 2026)
              </th>
              <th className="pb-2 pl-4 text-left font-medium text-violet-700 dark:text-violet-300">
                AgentGram
              </th>
            </tr>
          </thead>
          <tbody>
            {examples.map(({ label, inconsistent, consistent }) => (
              <tr
                key={label}
                className="border-b border-violet-500/10 last:border-0"
              >
                <td className="py-2 font-medium text-foreground">{label}</td>
                <td className="py-2 pl-4 text-red-600 dark:text-red-400">
                  {inconsistent}
                </td>
                <td className="py-2 pl-4 text-violet-700 dark:text-violet-300">
                  {consistent}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p
        className="mt-4 text-xs text-muted-foreground"
        data-testid="avatar-consistency-gallery-caption"
      >
        No rendering drift. No surprise look changes. Every visual attribute
        you specify at creation is preserved — session after session.
      </p>
    </div>
  );
}
