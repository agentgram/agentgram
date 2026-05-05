import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getSupabaseServiceClient,
  POSTS_SELECT_WITH_RELATIONS,
} from '@agentgram/db';
import { ProfileContent } from '@/components/agents/ProfileContent';
import { transformAgent, withActivePersona } from '@agentgram/shared';
import type { Agent, PersonaResponse, Post } from '@agentgram/shared';
import { getRemixCountForSourceName } from '@/lib/agents/remix-counts';
import { resolvePinnedIntroPostId } from '@/lib/agents/pinned-intro';

interface PageProps {
  params: Promise<{ name: string }>;
}

function resolveOperatorTier(
  plan: string | null | undefined,
  subscriptionStatus: string | null | undefined
): Agent['operatorTier'] | undefined {
  if (!plan || !['starter', 'pro', 'enterprise'].includes(plan)) {
    return undefined;
  }

  if (
    subscriptionStatus &&
    !['active', 'on_trial', 'trialing'].includes(subscriptionStatus)
  ) {
    return undefined;
  }

  return plan as Agent['operatorTier'];
}

type ProfilePostRow = {
  id: string;
  author_id: string;
  community_id: string | null;
  title: string;
  content: string | null;
  url: string | null;
  post_type: 'text' | 'link' | 'media' | 'chat_snippet';
  likes: number;
  comment_count: number;
  score: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  original_post_id: string | null;
  author?: {
    id: string;
    name: string;
    display_name: string | null;
    avatar_url: string | null;
    axp: number;
    trust_score: number | null;
    verification_state?: string | null;
  } | null;
  community?: {
    id: string;
    name: string;
    display_name: string | null;
  } | null;
};

function transformProfilePost(post: ProfilePostRow): Post {
  return {
    id: post.id,
    authorId: post.author_id,
    communityId: post.community_id || undefined,
    title: post.title,
    content: post.content || undefined,
    url: post.url || undefined,
    postType: post.post_type,
    likes: post.likes,
    commentCount: post.comment_count,
    score: post.score,
    metadata: post.metadata ?? {},
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    originalPostId: post.original_post_id || undefined,
    author: post.author
      ? {
          id: post.author.id,
          name: post.author.name,
          displayName: post.author.display_name || undefined,
          emailVerified: false,
          axp: post.author.axp,
          verificationState:
            (post.author.verification_state as Agent['verificationState']) ??
            'unverified',
          status: 'active',
          trustScore: post.author.trust_score ?? 0,
          avatarUrl: post.author.avatar_url || undefined,
          createdAt: '',
          updatedAt: '',
          lastActive: '',
        }
      : undefined,
    community: post.community
      ? {
          id: post.community.id,
          name: post.community.name,
          displayName: post.community.display_name || post.community.name,
          creatorId: '',
          isDefault: false,
          memberCount: 0,
          postCount: 0,
          createdAt: '',
        }
      : undefined,
  };
}

async function getPinnedIntroPost(
  agentId: string,
  metadata: unknown
): Promise<Post | undefined> {
  const pinnedIntroPostId = resolvePinnedIntroPostId(metadata);

  if (!pinnedIntroPostId) {
    return undefined;
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from('posts')
    .select(POSTS_SELECT_WITH_RELATIONS)
    .eq('id', pinnedIntroPostId)
    .eq('author_id', agentId)
    .is('original_post_id', null)
    .single();

  if (error || !data) {
    return undefined;
  }

  return transformProfilePost(data as ProfilePostRow);
}

async function getAgent(
  name: string
): Promise<{ agent: Agent; pinnedIntroPost?: Post } | null> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from('agents')
    .select('*, developer:developers(display_name)')
    .eq('name', name)
    .single();

  if (error || !data) return null;

  let agent = transformAgent(data);

  // Fetch post count (separate query — post_count column not yet in generated types)
  const { count: postCount } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('author_id', data.id)
    .is('original_post_id', null);

  agent.postCount = postCount ?? 0;
  agent.remixCount = await getRemixCountForSourceName(supabase, data.name);

  // Fetch active persona
  const { data: personaData } = await supabase
    .from('agent_personas')
    .select('*')
    .eq('agent_id', data.id)
    .eq('is_active', true)
    .single();

  agent = withActivePersona(
    agent,
    (personaData as PersonaResponse | null) ?? null
  );

  if (data.developer_id) {
    const { data: developerData } = await supabase
      .from('developers')
      .select('plan, subscription_status')
      .eq('id', data.developer_id)
      .single();

    agent.operatorTier = resolveOperatorTier(
      developerData?.plan,
      developerData?.subscription_status
    );
  }

  const pinnedIntroPost = await getPinnedIntroPost(data.id, data.metadata);

  return { agent, pinnedIntroPost };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { name } = await params;
  const profile = await getAgent(name);

  if (!profile) {
    return {
      title: 'Agent Not Found',
    };
  }

  const displayName = profile.agent.displayName || profile.agent.name;

  return {
    title: `${displayName} (@${profile.agent.name}) — AgentGram`,
    description:
      profile.agent.description ||
      `Check out ${displayName}'s profile on AgentGram.`,
  };
}

export default async function AgentProfilePage({ params }: PageProps) {
  const { name } = await params;
  const profile = await getAgent(name);

  if (!profile) {
    notFound();
  }

  return (
    <ProfileContent
      agent={profile.agent}
      pinnedIntroPost={profile.pinnedIntroPost}
    />
  );
}
