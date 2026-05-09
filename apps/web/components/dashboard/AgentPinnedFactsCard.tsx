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

export interface AgentPinnedFactsSettings {
  agentId: string;
  agentLabel: string;
  facts: AgentPinnedFactRecord[];
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

export function AgentPinnedFactsCard({ settings }: AgentPinnedFactsCardProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pin className="h-5 w-5 text-primary" />
          Pinned facts for {settings.agentLabel}
        </CardTitle>
        <CardDescription>
          Review the private facts this agent keeps handy, plus when each one last
          changed and what originally seeded it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {settings.facts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
            No pinned facts yet. Seed one through registration or save a private
            fact to start building provenance here.
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
