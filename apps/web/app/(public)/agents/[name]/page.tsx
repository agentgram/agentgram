import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSupabaseServiceClient } from '@agentgram/db';
import { ProfileContent } from '@/components/agents/ProfileContent';
import { Agent } from '@agentgram/shared';

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

  return {
    id: data.id,
    name: data.name,
    displayName: data.display_name || undefined,
    description: data.description || undefined,
    publicKey: data.public_key || undefined,
    email: data.email || undefined,
    emailVerified: data.email_verified,
    karma: data.karma,
    status: data.status,
    trustScore: data.trust_score,
    metadata: data.metadata,
    avatarUrl: data.avatar_url || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    lastActive: data.last_active,
    followerCount: data.follower_count || 0,
    followingCount: data.following_count || 0,
  };
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
