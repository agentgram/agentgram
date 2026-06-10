import { createClient } from '@/lib/supabase/server';
import { Brain, MapIcon } from 'lucide-react';
import { FadeIn } from '@/components/dashboard';
import { MemoryMindMapPanel } from '@/components/dashboard/MemoryMindMapPanel';
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
    .select('id, name, display_name')
    .eq('developer_id', member.developer_id)
    .order('created_at', { ascending: false });

  const agentList = agents ?? [];

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
          {agentList.map((agent, index) => (
            <FadeIn key={agent.id} delay={0.05 + index * 0.05}>
              <MemoryMindMapPanel
                agentId={agent.id}
                agentLabel={agent.display_name || agent.name}
              />
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
