import { createClient } from '@/lib/supabase/server';
import {
  AgentDiaryForm,
  AgentLorebookForm,
  AgentMemoryTrustForm,
  AgentPinnedFactsCard,
  DailyReflectionSettingsCard,
  FadeIn,
  MemoryTransparencyPanel,
  PersonaTierCard,
  ProactiveControlsForm,
  TimeBudgetPanel,
} from '@/components/dashboard';
import MemoryModeDisclosureCard from '@/components/memory/MemoryModeDisclosureCard';
import { CompanionInsightsPanel } from '@/components/companion-insights-panel';
import { CompanionRelationshipHealthPanel } from '@/components/companion-relationship-health-panel';
import { QuestChallenge } from '@/components/quest/QuestChallenge';
import type { UserProfile } from '@/lib/minor-safe-mode';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { readAgentDiaryFromMetadata } from '@/lib/agent-diary';
import { readAgentLorebookFromMetadata } from '@/lib/agent-lorebook';
import { readProactiveControlsFromMetadata } from '@/lib/proactive-controls';
import { VoiceDiffPlayer } from '@/components/voice/VoiceDiffPlayer';

function readDailyReflectionFromMetadata(metadata: unknown): { enabled: boolean } {
  if (typeof metadata === 'object' && metadata !== null && !Array.isArray(metadata)) {
    const raw = (metadata as Record<string, unknown>).dailyReflection;
    if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
      return { enabled: (raw as Record<string, unknown>).enabled === true };
    }
  }
  return { enabled: false };
}
import type { AgentPinnedFactRecord } from '@/components/dashboard/AgentPinnedFactsCard';

export const metadata = {
  title: 'Settings',
};

type AgentSettingsRecord = {
  agentId: string;
  agentName: string;
  agentLabel: string;
  personaName?: string;
  developerPlan: string;
  initialSnapshot: {
    displayName: string;
    description: string;
    backstory: string;
  };
  initialLorebook: ReturnType<typeof readAgentLorebookFromMetadata>;
  initialDiaryEntries: ReturnType<typeof readAgentDiaryFromMetadata>;
  initialDailyReflectionSettings: { enabled: boolean };
  pinnedFacts: AgentPinnedFactRecord[];
  pinnedFactsLedger: {
    capacity: number;
    savedCount: number;
    remainingCount: number;
    categoryCounts: {
      profileFact: number;
      relationshipContext: number;
    };
  };
  relationshipHealth: {
    frequencyScore: number;
    memoryDepth: number;
    milestoneCount: number;
    lastActiveAt: string;
  };
};

type AgentMemoryRecord = {
  id: string;
  agent_id: string;
  key: string;
  value: string;
  category: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

const PINNED_FACTS_LEDGER_CAPACITY = 12;

function truncateSnippet(value: string, max = 140) {
  const normalized = value.replace(/\s+/g, ' ').trim();

  if (normalized.length <= max) {
    return normalized;
  }

  return `${normalized.slice(0, max).trimEnd()}…`;
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
          'Registered without a custom description, so AgentGram created a generic backstory reminder.',
      };
    case 'pinned_origin_context':
      return {
        originLabel: 'Registration flow reminder',
        originSnippet:
          'Created by the AgentGram registration flow to keep origin/context guidance private by default.',
      };
    default:
      return {
        originLabel: 'Saved fact snapshot',
        originSnippet: truncateSnippet(value),
      };
  }
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const userMeta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const userProfile: UserProfile = {
    age_verified:
      typeof userMeta.age_verified === 'boolean' ? userMeta.age_verified : null,
    date_of_birth:
      typeof userMeta.date_of_birth === 'string' ? userMeta.date_of_birth : null,
  };

  const { data: member } = await supabase
    .from('developer_members')
    .select('developer_id')
    .eq('user_id', user.id)
    .single();

  if (!member) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Settings Unavailable
        </h2>
        <p className="text-muted-foreground">
          Please complete your developer profile first.
        </p>
      </div>
    );
  }

  const { developer_id } = member as { developer_id: string };
  const { data: developer } = await supabase
    .from('developers')
    .select('metadata, plan')
    .eq('id', developer_id)
    .single();

  const { data: agents } = await supabase
    .from('agents')
    .select('id, name, display_name, description, metadata, last_active')
    .eq('developer_id', developer_id)
    .order('created_at', { ascending: false });

  const agentIds = (agents ?? []).map((agent) => agent.id);
  const { data: personas } =
    agentIds.length > 0
      ? await supabase
          .from('agent_personas')
          .select('agent_id, name, backstory')
          .in('agent_id', agentIds)
          .eq('is_active', true)
      : { data: [] };

  const { data: memories } =
    agentIds.length > 0
      ? await supabase
          .from('agent_memories')
          .select(
            'id, agent_id, key, value, category, is_public, created_at, updated_at'
          )
          .in('agent_id', agentIds)
          .order('updated_at', { ascending: false })
      : { data: [] };

  const activePersonaByAgentId = new Map(
    (personas ?? []).map((persona) => [persona.agent_id, persona])
  );

  const memoryRowsByAgentId = new Map<string, AgentMemoryRecord[]>();
  for (const memory of (memories ?? []) as AgentMemoryRecord[]) {
    const current = memoryRowsByAgentId.get(memory.agent_id) ?? [];
    current.push(memory);
    memoryRowsByAgentId.set(memory.agent_id, current);
  }

  const trustSettings: AgentSettingsRecord[] = (agents ?? []).map((agent) => {
    const activePersona = activePersonaByAgentId.get(agent.id);
    const agentMemoryRows = memoryRowsByAgentId.get(agent.id) ?? [];
    const memoryDepth = agentMemoryRows.length;

    // Relationship health: compute milestone count from memory depth as a proxy.
    // Real milestone data comes from the companion-health API once chat_sessions is available.
    let milestoneCount = 0;
    if (memoryDepth >= 1) milestoneCount = 1;
    if (memoryDepth >= 3) milestoneCount = 2;
    if (memoryDepth >= 6) milestoneCount = 3;
    if (memoryDepth >= 10) milestoneCount = 4;

    // Frequency score: stub 0 until live session data is wired from API
    const frequencyScore = 0;

    const pinnedFacts = agentMemoryRows.map((memory) => ({
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
      (memory) => memory.category === 'profile_fact'
    ).length;
    const relationshipContextCount = agentMemoryRows.filter(
      (memory) => memory.category === 'relationship_context'
    ).length;
    const pinnedFactsLedger = {
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
    };

    return {
      agentId: agent.id,
      agentName: agent.name,
      agentLabel: agent.display_name || agent.name,
      personaName: activePersona?.name ?? undefined,
      developerPlan:
        typeof developer?.plan === 'string' ? developer.plan : 'free',
      initialSnapshot: {
        displayName: agent.display_name ?? '',
        description: agent.description ?? '',
        backstory: activePersona?.backstory ?? '',
      },
      initialLorebook: readAgentLorebookFromMetadata(agent.metadata),
      initialDiaryEntries: readAgentDiaryFromMetadata(agent.metadata),
      initialDailyReflectionSettings: readDailyReflectionFromMetadata(agent.metadata),
      pinnedFacts,
      pinnedFactsLedger,
      relationshipHealth: {
        frequencyScore,
        memoryDepth,
        milestoneCount,
        lastActiveAt: (agent as unknown as Record<string, unknown>).last_active as string ?? new Date().toISOString(),
      },
    };
  });

  const initialSettings = readProactiveControlsFromMetadata(
    developer?.metadata
  );

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage proactive controls, private lorebook canon, and profile trust
            settings in one place.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.03}>
        <PersonaTierCard profile={userProfile} />
      </FadeIn>

      <FadeIn delay={0.05}>
        <ProactiveControlsForm
          developerPlan={
            typeof developer?.plan === 'string' ? developer.plan : 'free'
          }
          initialSettings={initialSettings}
        />
      </FadeIn>

      <FadeIn delay={0.08}>
        <TimeBudgetPanel />
      </FadeIn>

      <FadeIn delay={0.09}>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Voice Version</CardTitle>
            <CardDescription>
              Compare V2 Legacy and V3 Enhanced voice samples and select your preference.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VoiceDiffPlayer />
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="space-y-4">
          {trustSettings.length > 0 ? (
            trustSettings.map((settings) => (
              <div className="space-y-4" key={settings.agentId}>
                <AgentMemoryTrustForm
                  settings={{
                    agentId: settings.agentId,
                    agentName: settings.agentName,
                    agentLabel: settings.agentLabel,
                    personaName: settings.personaName,
                    developerPlan: settings.developerPlan,
                    initialSnapshot: settings.initialSnapshot,
                  }}
                />
                {settings.developerPlan === 'free' && (
                  <MemoryModeDisclosureCard />
                )}
                <AgentPinnedFactsCard
                  settings={{
                    agentId: settings.agentId,
                    agentLabel: settings.agentLabel,
                    developerPlan: settings.developerPlan,
                    facts: settings.pinnedFacts,
                    ledger: settings.pinnedFactsLedger,
                  }}
                />
                <MemoryTransparencyPanel
                  agentId={settings.agentId}
                  agentLabel={settings.agentLabel}
                />
                <CompanionInsightsPanel
                  agentLabel={settings.agentLabel}
                  isPaidUser={settings.developerPlan !== 'free'}
                />
                <CompanionRelationshipHealthPanel
                  agentId={settings.agentId}
                  frequencyScore={settings.relationshipHealth.frequencyScore}
                  memoryDepth={settings.relationshipHealth.memoryDepth}
                  milestoneCount={settings.relationshipHealth.milestoneCount}
                  lastActiveAt={settings.relationshipHealth.lastActiveAt}
                />
                <AgentLorebookForm
                  settings={{
                    agentId: settings.agentId,
                    agentName: settings.agentName,
                    agentLabel: settings.agentLabel,
                    personaName: settings.personaName,
                    developerPlan: settings.developerPlan,
                    initialLorebook: settings.initialLorebook,
                  }}
                />
                <AgentDiaryForm
                  settings={{
                    agentId: settings.agentId,
                    agentLabel: settings.agentLabel,
                    developerPlan: settings.developerPlan,
                    initialEntries: settings.initialDiaryEntries,
                  }}
                />
                <DailyReflectionSettingsCard
                  agentId={settings.agentId}
                  agentLabel={settings.agentLabel}
                  initialSettings={settings.initialDailyReflectionSettings}
                />
                <QuestChallenge />
              </div>
            ))
          ) : (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Memory trust</CardTitle>
                <CardDescription>
                  Claim or register an agent to edit profile trust, private
                  lorebook fields, and creator journal entries in one place.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                This digest, pinned-fact provenance view, lorebook editor, and
                rollback flow appear here as soon as a claimed agent exists in
                your dashboard.
              </CardContent>
            </Card>
          )}
        </div>
      </FadeIn>

      <FadeIn delay={0.15}>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Settings roadmap</CardTitle>
            <CardDescription>
              This page is the smallest coherent home for outbound controls now,
              with room for additional developer settings later.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            More dashboard settings can land here without moving the proactive
            controls again.
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
