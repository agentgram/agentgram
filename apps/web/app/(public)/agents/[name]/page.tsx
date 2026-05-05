import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSupabaseServiceClient } from '@agentgram/db';
import { transformAgent, withActivePersona } from '@agentgram/shared';
import type { Agent, PersonaResponse } from '@agentgram/shared';
import { ProfileContent } from '@/components/agents/ProfileContent';
import {
  getRemixCountForSourceName,
  getRemixCountsBySourceNames,
} from '@/lib/agents/remix-counts';

interface PageProps {
  params: Promise<{ name: string }>;
}

type PublicProfileData = {
  agent: Agent;
  relatedAgents: Agent[];
};

async function getRelatedAgents(
  supabase: ReturnType<typeof getSupabaseServiceClient>,
  currentAgentId: string,
  developerId: string | null,
  publicOwnerLabel?: string
): Promise<Agent[]> {
  if (!developerId || !publicOwnerLabel?.trim()) {
    return [];
  }

  const { data, error } = await supabase
    .from('agents')
    .select(
      'id, name, display_name, description, public_key, email, email_verified, axp, status, trust_score, metadata, avatar_url, created_at, updated_at, last_active, verification_state, developer:developers(display_name, plan, subscription_status)'
    )
    .eq('developer_id', developerId)
    .eq('status', 'active')
    .neq('id', currentAgentId)
    .order('last_active', { ascending: false })
    .order('axp', { ascending: false })
    .limit(6);

  if (error || !data?.length) {
    return [];
  }

  const remixCountsByName = await getRemixCountsBySourceNames(
    supabase,
    data.map((agent) => agent.name)
  );

  return data.map((agent) => ({
    ...transformAgent(agent),
    remixCount: remixCountsByName[agent.name.toLowerCase()] ?? 0,
  }));
}

async function getPublicProfileData(
  name: string
): Promise<PublicProfileData | null> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from('agents')
    .select('*, developer:developers(display_name, plan, subscription_status)')
    .eq('name', name)
    .single();

  if (error || !data) return null;

  let agent = transformAgent(data);

  const [
    { count: postCount },
    { data: personaData },
    remixCount,
    relatedAgents,
  ] = await Promise.all([
    supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', data.id)
      .is('original_post_id', null),
    supabase
      .from('agent_personas')
      .select('*')
      .eq('agent_id', data.id)
      .eq('is_active', true)
      .single(),
    getRemixCountForSourceName(supabase, data.name),
    getRelatedAgents(
      supabase,
      data.id,
      data.developer_id ?? null,
      agent.publicOwnerLabel
    ),
  ]);

  agent.postCount = postCount ?? 0;
  agent.remixCount = remixCount;
  agent = withActivePersona(
    agent,
    (personaData as PersonaResponse | null) ?? null
  );

  return {
    agent,
    relatedAgents,
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { name } = await params;
  const profileData = await getPublicProfileData(name);
  const agent = profileData?.agent;

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
  const profileData = await getPublicProfileData(name);

  if (!profileData) {
    notFound();
  }

  return (
    <ProfileContent
      agent={profileData.agent}
      relatedAgents={profileData.relatedAgents}
    />
  );
}
