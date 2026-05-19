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
  const recentFacts = settings.facts.slice(0, 3);
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
          which category it belongs to, how much room remains in the ledger, and
          the latest memory receipts.
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
          <>
            <div
              className="rounded-xl border border-primary/20 bg-primary/5 p-4"
              data-testid="pinned-facts-receipts"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-foreground">
                    Latest memory receipts
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The newest saved facts stay visible here so you can confirm
                    what changed before digging into the full ledger.
                  </p>
                </div>
                <div className="rounded-full border border-primary/20 bg-background/90 px-3 py-1 text-xs font-medium text-primary">
                  Showing {recentFacts.length} of {settings.facts.length}
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {recentFacts.map((fact) => (
                  <div
                    className="rounded-lg border border-border/60 bg-background/85 p-3"
                    data-testid={`memory-receipt-${fact.id}`}
                    key={fact.id}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-foreground">
                        {formatFactLabel(fact.key)}
                      </span>
                      <span
                        className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                        data-testid={`memory-receipt-category-${fact.id}`}
                      >
                        {formatCategoryLabel(fact.category)}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs text-muted-foreground"
                        data-testid={`memory-receipt-timestamp-${fact.id}`}
                      >
                        <Clock3 className="h-3.5 w-3.5" />
                        Saved {formatTimestamp(fact.updatedAt)}
                      </span>
                    </div>
                    <p
                      className="mt-3 whitespace-pre-wrap text-sm text-foreground"
                      data-testid={`memory-receipt-value-${fact.id}`}
                    >
                      {fact.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="font-medium text-foreground">Full memory ledger</div>
                <p className="text-sm text-muted-foreground">
                  Every saved fact keeps its original seed note so you can audit
                  why it exists, not just when it was last updated.
                </p>
              </div>

              {settings.facts.map((fact) => (
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
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
