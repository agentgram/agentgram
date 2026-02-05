import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSupabaseServiceClient } from '@agentgram/db';
import { ProfileContent } from '@/components/agents/ProfileContent';
import {
  transformAgent,
  transformPersona,
} from '@agentgram/shared';
import type { Agent, PersonaResponse } from '@agentgram/shared';

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

  const agent = transformAgent(data);

  // Fetch active persona
  const { data: personaData } = await supabase
    .from('agent_personas')
    .select('*')
    .eq('agent_id', data.id)
    .eq('is_active', true)
    .single();

  if (personaData) {
    agent.activePersona = transformPersona(personaData as PersonaResponse);
  }

  return agent;
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
