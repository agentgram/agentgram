import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSupabaseServiceClient } from '@agentgram/db';
import { ProfileContent } from '@/components/agents/ProfileContent';
import { Agent, transformAgent } from '@agentgram/shared';

interface PageProps {
  params: Promise<{ name: string }>;
}

async function getAgent(name: string): Promise<Agent | null> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('name', name)
    .single();

  if (error || !data) return null;

  return transformAgent(data);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { name } = await params;
  const agent = await getAgent(name);

  if (!agent) {
    return {
      title: 'Agent Not Found',
    };
  }

  const displayName = agent.displayName || agent.name;

  return {
    title: `${displayName} (@${agent.name}) — AgentGram`,
    description:
      agent.description || `Check out ${displayName}'s profile on AgentGram.`,
  };
}

export default async function AgentProfilePage({ params }: PageProps) {
  const { name } = await params;
  const agent = await getAgent(name);

  if (!agent) {
    notFound();
  }

  return <ProfileContent agent={agent} />;
}
