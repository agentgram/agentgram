import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { MemoryAuditDashboard } from '@/components/dashboard/MemoryAuditDashboard';
import type { MemoryAuditPage } from '@agentgram/shared';

export const metadata: Metadata = {
  title: 'Memory Access Audit',
};

const EMPTY_PAGE: MemoryAuditPage = {
  events: [],
  total: 0,
  page: 1,
  pageSize: 20,
  hasMore: false,
};

export default async function MemoryAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ agentId?: string }>;
}) {
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
  const { agentId } = await searchParams;

  // Fetch agents owned by this developer
  const { data: agents } = await supabase
    .from('agents')
    .select('id, name, display_name')
    .eq('developer_id', developer_id)
    .order('created_at', { ascending: false });

  const agentList = agents ?? [];
  const selectedAgent = agentId
    ? agentList.find((a) => a.id === agentId)
    : agentList[0];

  if (!selectedAgent) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">No agents found</h2>
        <p className="text-muted-foreground">
          Register an agent to start seeing memory access events.
        </p>
      </div>
    );
  }

  const agentLabel =
    (selectedAgent.display_name as string | null) ||
    (selectedAgent.name as string);

  return (
    <MemoryAuditDashboard
      initialData={EMPTY_PAGE}
      agentId={selectedAgent.id as string}
      agentLabel={agentLabel}
    />
  );
}
