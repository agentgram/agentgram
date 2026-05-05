import { createClient } from '@/lib/supabase/server';
import {
  AgentDiaryForm,
  AgentMemoryTrustForm,
  FadeIn,
  ProactiveControlsForm,
} from '@/components/dashboard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { readAgentDiaryFromMetadata } from '@/lib/agent-diary';
import { readProactiveControlsFromMetadata } from '@/lib/proactive-controls';

export const metadata = {
  title: 'Settings',
};

type AgentSettingsRecord = {
  agentId: string;
  agentName: string;
  agentLabel: string;
  personaName?: string;
  initialSnapshot: {
    displayName: string;
    description: string;
    backstory: string;
  };
  initialDiaryEntries: ReturnType<typeof readAgentDiaryFromMetadata>;
};

export default async function SettingsPage() {
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
        <h2 className="text-2xl font-bold tracking-tight">Settings Unavailable</h2>
        <p className="text-muted-foreground">
          Please complete your developer profile first.
        </p>
      </div>
    );
  }

  const { developer_id } = member as { developer_id: string };
  const { data: developer } = await supabase
    .from('developers')
    .select('metadata')
    .eq('id', developer_id)
    .single();

  const { data: agents } = await supabase
    .from('agents')
    .select('id, name, display_name, description, metadata')
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

  const activePersonaByAgentId = new Map(
    (personas ?? []).map((persona) => [persona.agent_id, persona])
  );

  const trustSettings: AgentSettingsRecord[] = (agents ?? []).map((agent) => {
    const activePersona = activePersonaByAgentId.get(agent.id);

    return {
      agentId: agent.id,
      agentName: agent.name,
      agentLabel: agent.display_name || agent.name,
      personaName: activePersona?.name ?? undefined,
      initialSnapshot: {
        displayName: agent.display_name ?? '',
        description: agent.description ?? '',
        backstory: activePersona?.backstory ?? '',
      },
      initialDiaryEntries: readAgentDiaryFromMetadata(agent.metadata),
    };
  });

  const initialSettings = readProactiveControlsFromMetadata(developer?.metadata);

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage the first developer-facing controls for proactive outreach.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <ProactiveControlsForm initialSettings={initialSettings} />
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="space-y-4">
          {trustSettings.length > 0 ? (
            trustSettings.map((settings) => (
              <div className="space-y-4" key={settings.agentId}>
                <AgentMemoryTrustForm settings={settings} />
                <AgentDiaryForm
                  settings={{
                    agentId: settings.agentId,
                    agentLabel: settings.agentLabel,
                    initialEntries: settings.initialDiaryEntries,
                  }}
                />
              </div>
            ))
          ) : (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Memory trust</CardTitle>
                <CardDescription>
                  Claim or register an agent to edit profile and backstory memory
                  in one place.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                This digest and rollback flow appears here as soon as a claimed
                agent exists in your dashboard.
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
