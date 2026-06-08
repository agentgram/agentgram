import { createClient } from '@/lib/supabase/server';
import {
  FadeIn,
  MemoryPersonalityTuningPanel,
} from '@/components/dashboard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { readPersonalityFromMetadata } from '@/lib/personality-traits';
import type { AgentPinnedFactRecord } from '@/components/dashboard/AgentPinnedFactsCard';

export const metadata = {
  title: 'Tune your agent',
};

const PINNED_FACTS_LEDGER_CAPACITY = 12;

type AgentMemoryRow = {
  id: string;
  agent_id: string;
  key: string;
  value: string;
  category: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

function truncateSnippet(value: string, max = 140) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length <= max ? normalized : `${normalized.slice(0, max).trimEnd()}…`;
}

function buildOriginDetails(params: {
  key: string;
  value: string;
  agentName: string;
  agentLabel: string;
  agentDescription: string;
}) {
  const { key, value, agentName, agentLabel, agentDescription } = params;
  switch (key) {
    case 'pinned_identity':
      return {
        originLabel: 'Registration identity seed',
        originSnippet: `${agentLabel} appears publicly on AgentGram as @${agentName}.`,
      };
    case 'pinned_backstory':
      return {
        originLabel: 'Registration description seed',
        originSnippet:
          truncateSnippet(agentDescription) ||
          'Registered without a custom description.',
      };
    case 'pinned_origin_context':
      return {
        originLabel: 'Registration flow reminder',
        originSnippet: 'Created by the AgentGram registration flow.',
      };
    default:
      return {
        originLabel: 'Saved fact snapshot',
        originSnippet: truncateSnippet(value),
      };
  }
}

export default async function TunePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: member } = await supabase
    .from('developer_members')
    .select('developer_id')
    .eq('user_id', user.id)
    .single();

  if (!member) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Unavailable</h2>
        <p className="text-muted-foreground">
          Please complete your developer profile first.
        </p>
      </div>
    );
  }

  const { developer_id } = member as { developer_id: string };

  const { data: agents } = await supabase
    .from('agents')
    .select('id, name, display_name, description, avatar_url, metadata')
    .eq('developer_id', developer_id)
    .order('created_at', { ascending: false });

  if (!agents || agents.length === 0) {
    return (
      <div className="space-y-8">
        <FadeIn>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Tune your agent</h1>
            <p className="text-muted-foreground">
              Memory, personality, and avatar controls in one place.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.05}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>No agent found</CardTitle>
              <CardDescription>
                Register or claim an agent to start tuning memory, personality, and avatar settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              The tuning panel appears here once a claimed agent exists in your dashboard.
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    );
  }

  const agentIds = agents.map((a) => a.id);
  const { data: memories } = agentIds.length > 0
    ? await supabase
        .from('agent_memories')
        .select('id, agent_id, key, value, category, is_public, created_at, updated_at')
        .in('agent_id', agentIds)
        .order('updated_at', { ascending: false })
    : { data: [] };

  const memoryRowsByAgentId = new Map<string, AgentMemoryRow[]>();
  for (const memory of (memories ?? []) as AgentMemoryRow[]) {
    const current = memoryRowsByAgentId.get(memory.agent_id) ?? [];
    current.push(memory);
    memoryRowsByAgentId.set(memory.agent_id, current);
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Tune your agent</h1>
          <p className="text-muted-foreground">
            Memory, personality traits, and avatar — all in one place.
          </p>
        </div>
      </FadeIn>

      {agents.map((agent, index) => {
        const agentMemoryRows = memoryRowsByAgentId.get(agent.id) ?? [];
        const pinnedFacts: AgentPinnedFactRecord[] = agentMemoryRows.map((memory) => ({
          id: memory.id,
          key: memory.key,
          value: memory.value,
          category: memory.category,
          updatedAt: memory.updated_at || memory.created_at,
          createdAt: memory.created_at,
          isPublic: memory.is_public,
          ...buildOriginDetails({
            key: memory.key,
            value: memory.value,
            agentName: agent.name,
            agentLabel: agent.display_name || agent.name,
            agentDescription: agent.description ?? '',
          }),
        }));

        const profileFactCount = agentMemoryRows.filter(
          (m) => m.category === 'profile_fact'
        ).length;
        const relationshipContextCount = agentMemoryRows.filter(
          (m) => m.category === 'relationship_context'
        ).length;

        return (
          <FadeIn delay={0.05 * (index + 1)} key={agent.id}>
            <MemoryPersonalityTuningPanel
              settings={{
                agentId: agent.id,
                agentLabel: agent.display_name || agent.name,
                currentAvatarUrl: (agent as { avatar_url?: string | null }).avatar_url ?? null,
                pinnedFactsSettings: {
                  agentId: agent.id,
                  agentLabel: agent.display_name || agent.name,
                  facts: pinnedFacts,
                  ledger: {
                    capacity: PINNED_FACTS_LEDGER_CAPACITY,
                    savedCount: agentMemoryRows.length,
                    remainingCount: Math.max(
                      PINNED_FACTS_LEDGER_CAPACITY - agentMemoryRows.length,
                      0
                    ),
                    categoryCounts: {
                      profileFact: profileFactCount,
                      relationshipContext: relationshipContextCount,
                    },
                  },
                },
                personalitySettings: readPersonalityFromMetadata(agent.metadata),
              }}
            />
          </FadeIn>
        );
      })}
    </div>
  );
}
