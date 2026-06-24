import Link from 'next/link';
import { Brain, Zap, Archive, Crown, Network, ArrowRight, ShieldCheck } from 'lucide-react';

export interface MemoryLayer {
  id: string;
  label: string;
  sublabel: string;
  description: string;
  icon: React.ElementType;
  color: 'violet' | 'blue' | 'indigo' | 'amber' | 'emerald';
}

const MEMORY_LAYERS: MemoryLayer[] = [
  {
    id: 'session-context',
    label: 'Session Context',
    sublabel: 'Layer 1',
    description:
      'Active conversation state — what was said in this session. Ephemeral by default; persisted only when you choose.',
    icon: Zap,
    color: 'violet',
  },
  {
    id: 'short-term',
    label: 'Short-term Memory',
    sublabel: 'Layer 2',
    description:
      'Recent interactions and recurring patterns from the past 7 days. Updated automatically after each session.',
    icon: Brain,
    color: 'blue',
  },
  {
    id: 'long-term',
    label: 'Long-term Memory',
    sublabel: 'Layer 3',
    description:
      'Durable facts, preferences, and history accumulated over months. Fully exportable as JSON and deletable per GDPR Art.17.',
    icon: Archive,
    color: 'indigo',
  },
  {
    id: 'identity-core',
    label: 'Identity Core',
    sublabel: 'Layer 4',
    description:
      'The agent\'s stable persona, values, and character traits — set by you, never silently mutated by the platform.',
    icon: Crown,
    color: 'amber',
  },
  {
    id: 'context-layer',
    label: 'Context Layer',
    sublabel: 'Layer 5',
    description:
      'Cross-session inference and relationship metadata: goals, emotional tone, shared history. Read-only unless you edit.',
    icon: Network,
    color: 'emerald',
  },
];

const colorMap = {
  violet: {
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/10',
    icon: 'text-violet-600 dark:text-violet-400',
    label: 'text-violet-700 dark:text-violet-400',
    badge: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
    connector: 'bg-violet-500/20',
  },
  blue: {
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    icon: 'text-blue-600 dark:text-blue-400',
    label: 'text-blue-700 dark:text-blue-400',
    badge: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
    connector: 'bg-blue-500/20',
  },
  indigo: {
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/10',
    icon: 'text-indigo-600 dark:text-indigo-400',
    label: 'text-indigo-700 dark:text-indigo-400',
    badge: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
    connector: 'bg-indigo-500/20',
  },
  amber: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    icon: 'text-amber-600 dark:text-amber-400',
    label: 'text-amber-700 dark:text-amber-400',
    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    connector: 'bg-amber-500/20',
  },
  emerald: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-600 dark:text-emerald-400',
    label: 'text-emerald-700 dark:text-emerald-400',
    badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    connector: 'bg-emerald-500/20',
  },
} as const;

export function MemoryArchitectureDiagram() {
  return (
    <div
      data-testid="memory-architecture-diagram"
      className="space-y-2"
      aria-label="AgentGram 5-layer memory architecture"
    >
      {MEMORY_LAYERS.map((layer, index) => {
        const colors = colorMap[layer.color];
        const Icon = layer.icon;
        const isLast = index === MEMORY_LAYERS.length - 1;

        return (
          <div key={layer.id}>
            <div
              data-testid={`memory-layer-${layer.id}`}
              className={`rounded-xl border ${colors.border} ${colors.bg} px-5 py-4 flex items-start gap-4`}
              role="listitem"
              aria-label={`${layer.sublabel}: ${layer.label}`}
            >
              <div className="shrink-0 mt-0.5">
                <Icon
                  className={`h-5 w-5 ${colors.icon}`}
                  aria-hidden="true"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${colors.badge}`}
                    data-testid={`memory-layer-sublabel-${layer.id}`}
                  >
                    {layer.sublabel}
                  </span>
                  <span
                    className={`text-sm font-semibold ${colors.label}`}
                    data-testid={`memory-layer-label-${layer.id}`}
                  >
                    {layer.label}
                  </span>
                </div>
                <p
                  className="text-xs text-muted-foreground leading-relaxed"
                  data-testid={`memory-layer-desc-${layer.id}`}
                >
                  {layer.description}
                </p>
              </div>
            </div>
            {!isLast && (
              <div
                className={`mx-auto w-0.5 h-3 ${colors.connector}`}
                aria-hidden="true"
                data-testid={`memory-layer-connector-${layer.id}`}
              />
            )}
          </div>
        );
      })}

      {/* Full-stack memory transparency footer */}
      <div
        className="mt-4 rounded-xl border border-green-500/30 bg-green-500/5 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        data-testid="memory-architecture-footer"
      >
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="space-y-0.5">
            <p
              className="text-sm font-semibold text-green-700 dark:text-green-300"
              data-testid="memory-architecture-footer-claim"
            >
              Full-stack memory transparency
            </p>
            <p className="text-xs text-muted-foreground">
              Every layer is auditable, exportable, and erasable. GDPR Art.17 deletion receipts
              available from your dashboard.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/memory-export"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 dark:text-green-400 hover:underline underline-offset-2 shrink-0"
          data-testid="memory-architecture-gdpr-link"
          aria-label="View GDPR deletion receipts in memory export dashboard"
        >
          GDPR deletion receipts
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
