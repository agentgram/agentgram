import { createClient } from '@/lib/supabase/server';
import { Brain, MapIcon } from 'lucide-react';
import { FadeIn } from '@/components/dashboard';
import { MemoryMindMapPanel } from '@/components/dashboard/MemoryMindMapPanel';
import { MemoryFreshnessTimeline, type MemoryFact } from '@/components/memory/MemoryFreshnessTimeline';
import { MemoryHeadroomMeter } from '@/components/memory/MemoryHeadroomMeter';
import { MemoryRelationshipTimeline } from '@/components/memory/MemoryRelationshipTimeline';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Memory Map',
};

function getOneWeekAgo() {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
}

export default async function MemoryMapPage() {
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
        <h2 className="text-2xl font-bold tracking-tight">Memory Map Unavailable</h2>
        <p className="text-muted-foreground">
          Please complete your developer profile first.
        </p>
      </div>
    );
  }

  const { data: agents } = await supabase
    .from('agents')
    .select('id, name, display_name, created_at')
    .eq('developer_id', member.developer_id)
    .order('created_at', { ascending: false });

  const agentList = agents ?? [];
  const agentIds = agentList.map((a) => a.id);

  const { data: rawFacts } =
    agentIds.length > 0
      ? await supabase
          .from('agent_memories')
          .select('id, key, value, updated_at')
          .in('agent_id', agentIds)
          .order('updated_at', { ascending: false })
          .limit(50)
      : { data: [] };

  const memoryFacts: MemoryFact[] = (rawFacts ?? []).map((m) => ({
    id: m.id,
    content: `${m.key}: ${m.value}`,
    lastUsedAt: new Date(m.updated_at),
  }));

  const relationshipStartDate = agentList.length > 0
    ? agentList[agentList.length - 1].created_at ?? undefined
    : undefined;
  const firstFactDate = rawFacts && rawFacts.length > 0
    ? rawFacts[rawFacts.length - 1].updated_at
    : undefined;
  const milestoneCount = rawFacts?.length ?? 0;

  const MEMORY_CAPACITY = 200;
  const usedCount = rawFacts?.length ?? 0;
  const oneWeekAgo = getOneWeekAgo();
  const recentCount = (rawFacts ?? []).filter(
    (m) => new Date(m.updated_at) >= oneWeekAgo
  ).length;
  const headroomData = {
    used: usedCount,
    capacity: MEMORY_CAPACITY,
    recentGains: recentCount > 0 ? [{ label: 'facts retained', count: recentCount, period: 'this week' }] : [],
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Memory Map</h1>
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapIcon className="h-3 w-3" />
                Mind map
              </Badge>
            </div>
            <p className="mt-2 text-muted-foreground">
              Visualize linked memory nodes and fact relationships across your agents.
              Useful for debugging AI recall and spotting knowledge gaps.
            </p>
          </div>
        </div>
      </FadeIn>

      {agentList.length === 0 ? (
        <FadeIn delay={0.05}>
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-muted-foreground" />
                <CardTitle>No Agents Found</CardTitle>
              </div>
              <CardDescription>
                Register or claim an agent to start visualizing its memory graph.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Once your agent records profile facts and relationship context, they
              will appear here as a categorized mind map.
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <div className="space-y-6">
          <FadeIn delay={0.05}>
            <MemoryRelationshipTimeline
              relationshipStartDate={relationshipStartDate}
              firstFactDate={firstFactDate}
              milestoneCount={milestoneCount}
            />
          </FadeIn>
          {agentList.map((agent, index) => (
            <FadeIn key={agent.id} delay={0.1 + index * 0.05}>
              <MemoryMindMapPanel
                agentId={agent.id}
                agentLabel={agent.display_name || agent.name}
              />
            </FadeIn>
          ))}
          <FadeIn delay={0.1 + agentList.length * 0.05}>
            <MemoryHeadroomMeter data={headroomData} />
          </FadeIn>
          <FadeIn delay={0.15 + agentList.length * 0.05}>
            <div className="rounded-xl border border-border/50 bg-card/50 p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Memory Freshness</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  See when each stored fact was last used in a conversation. Prune stale
                  memories to keep your agent&apos;s recall sharp.
                </p>
              </div>
              <MemoryFreshnessTimeline facts={memoryFacts} />
            </div>
          </FadeIn>
        </div>
      )}
    </div>
  );
}
