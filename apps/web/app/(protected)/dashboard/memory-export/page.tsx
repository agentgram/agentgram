import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { MemoryExportDashboard } from '@/components/dashboard/MemoryExportDashboard';
import type { MemoryExportRecord } from '@/components/dashboard/MemoryExportDashboard';

export const metadata: Metadata = {
  title: 'Memory Export',
};

export default async function MemoryExportPage() {
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
    .select('id, name, display_name')
    .eq('developer_id', developer_id)
    .order('created_at', { ascending: false });

  const agentIds = (agents ?? []).map((a) => a.id);

  const agentLabelById = new Map(
    (agents ?? []).map((a) => [a.id, a.display_name || a.name])
  );

  const { data: rawMemories } =
    agentIds.length > 0
      ? ((await (supabase as any)
          .from('agent_memories')
          .select('id, agent_id, key, value, category, is_public, priority, created_at, updated_at')
          .in('agent_id', agentIds)
          .order('created_at', { ascending: false })) as { data: any[] | null })
      : { data: [] };

  const memories: MemoryExportRecord[] = (rawMemories ?? []).map((m) => ({
    id: m.id as string,
    agentId: m.agent_id as string,
    agentLabel: agentLabelById.get(m.agent_id as string) ?? (m.agent_id as string),
    key: m.key as string,
    value: m.value as string,
    category: m.category as string,
    isPublic: Boolean(m.is_public),
    priority: (m.priority as 'normal' | 'low' | undefined) ?? 'normal',
    createdAt: (m.created_at as string) ?? new Date().toISOString(),
    updatedAt: (m.updated_at as string) ?? (m.created_at as string) ?? new Date().toISOString(),
  }));

  return <MemoryExportDashboard memories={memories} />;
}
