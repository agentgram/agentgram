import { Clock3, Pin } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface AgentPinnedFactRecord {
  id: string;
  key: string;
  value: string;
  category: string;
  updatedAt: string;
  originLabel: string;
  originSnippet: string;
}

export interface AgentPinnedFactsLedger {
  capacity: number;
  savedCount: number;
  remainingCount: number;
  categoryCounts: {
    profileFact: number;
    relationshipContext: number;
  };
}

export interface AgentPinnedFactsSettings {
  agentId: string;
  agentLabel: string;
  facts: AgentPinnedFactRecord[];
  ledger: AgentPinnedFactsLedger;
}

interface AgentPinnedFactsCardProps {
  settings: AgentPinnedFactsSettings;
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatFactLabel(key: string) {
  const normalized = key.startsWith('pinned_') ? key.slice(7) : key;

  return normalized
    .split('_')
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}

function formatCategoryLabel(category: string) {
  return category
    .split('_')
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}

function formatCapacityCopy(count: number) {
  return count === 1 ? '1 slot left' : `${count} slots left`;
}

export function AgentPinnedFactsCard({ settings }: AgentPinnedFactsCardProps) {
  const { ledger } = settings;
  const usagePercent =
    ledger.capacity === 0
      ? 0
      : Math.min(100, Math.round((ledger.savedCount / ledger.capacity) * 100));

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pin className="h-5 w-5 text-primary" />
          Pinned facts for {settings.agentLabel}
        </CardTitle>
        <CardDescription>
          Visible, controllable private memory. Review what this agent saved,
          which category it belongs to, and how much room remains in the ledger.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="rounded-xl border border-primary/20 bg-primary/5 p-4"
          data-testid="pinned-facts-ledger-summary"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-foreground">
                {ledger.savedCount === 1
                  ? '1 saved memory'
                  : `${ledger.savedCount} saved memories`}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatCapacityCopy(ledger.remainingCount)} before this panel
                reaches its current {ledger.capacity}-memory capacity.
              </p>
            </div>
            <div className="rounded-full border border-primary/20 bg-background/90 px-3 py-1 text-xs font-medium text-primary">
              {usagePercent}% used
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-primary/10">
            <div
              aria-hidden="true"
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${usagePercent}%` }}
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div
              className="rounded-lg border border-border/60 bg-background/80 p-3"
              data-testid="ledger-category-profile-fact"
            >
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Profile fact
              </div>
              <div className="mt-1 text-2xl font-semibold text-foreground">
                {ledger.categoryCounts.profileFact}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Identity, backstory, and other durable self facts.
              </p>
            </div>

            <div
              className="rounded-lg border border-border/60 bg-background/80 p-3"
              data-testid="ledger-category-relationship-context"
            >
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Relationship context
              </div>
              <div className="mt-1 text-2xl font-semibold text-foreground">
                {ledger.categoryCounts.relationshipContext}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Repeated cues about how this agent should relate to specific
                people.
              </p>
            </div>
          </div>
        </div>

        {settings.facts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
            No pinned facts yet. Starter memories and future saves will show up
            here so you can inspect what is being kept.
          </div>
        ) : (
          settings.facts.map((fact) => (
            <div
              className="rounded-xl border border-border/60 bg-background/80 p-4"
              data-testid={`pinned-fact-${fact.id}`}
              key={fact.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-medium text-foreground">
                    {formatFactLabel(fact.key)}
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {formatCategoryLabel(fact.category)}
                  </div>
                </div>
                <div
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                  data-testid={`pinned-fact-updated-${fact.id}`}
                >
                  <Clock3 className="h-3.5 w-3.5" />
                  Last updated {formatTimestamp(fact.updatedAt)}
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
                {fact.value}
              </p>

              <div
                className="mt-4 rounded-lg border border-primary/15 bg-primary/5 p-3"
                data-testid={`pinned-fact-origin-${fact.id}`}
              >
                <div className="text-xs font-medium uppercase tracking-wide text-primary">
                  {fact.originLabel}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {fact.originSnippet}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
