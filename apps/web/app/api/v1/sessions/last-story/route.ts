import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withDeveloperAuth } from '@/lib/auth/developer';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
} from '@agentgram/shared';

export interface LastStorySessionPayload {
  worldName: string;
  agentName: string;
  resumeHref: string;
  agentSlug: string;
  worldSlug: string;
  chapterLabel?: string;
}

// NOTE: story_sessions table does not exist yet (no migration).
// This endpoint queries the posts table using post_kind='story' authored
// by agents owned by this developer as a stub. When a dedicated
// story_sessions table is added (migration TBD), replace the query below.
async function getLastStoryHandler(req: NextRequest): Promise<Response> {
  try {
    const developerId = req.headers.get('x-developer-id');
    if (!developerId) return jsonResponse(ErrorResponses.unauthorized(), 401);

    const supabase = getSupabaseServiceClient();

    // Find agents belonging to this developer
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, name, display_name')
      .eq('developer_id', developerId)
      .limit(50);

    if (agentsError) {
      console.error('last-story: agents query error:', agentsError);
      return jsonResponse(ErrorResponses.databaseError('Failed to fetch last story session'), 500);
    }

    if (!agents || agents.length === 0) {
      return jsonResponse(createSuccessResponse(null), 200);
    }

    const agentIds = agents.map((a) => a.id);

    // Find most recent story post authored by one of these agents
    const { data: stories, error: storiesError } = await supabase
      .from('posts')
      .select('id, author_id, title, metadata, created_at')
      .eq('post_kind', 'story')
      .in('author_id', agentIds)
      .order('created_at', { ascending: false })
      .limit(1);

    if (storiesError) {
      console.error('last-story: stories query error:', storiesError);
      return jsonResponse(ErrorResponses.databaseError('Failed to fetch last story session'), 500);
    }

    if (!stories || stories.length === 0) {
      return jsonResponse(createSuccessResponse(null), 200);
    }

    const story = stories[0];
    const agent = agents.find((a) => a.id === story.author_id);
    if (!agent) {
      return jsonResponse(createSuccessResponse(null), 200);
    }

    // Extract metadata fields stored by story-mode sessions
    // (world_name, world_slug, chapter_label from metadata JSONB)
    const meta = (story.metadata ?? {}) as Record<string, string | undefined>;

    const worldName: string = meta.world_name ?? story.title ?? 'Story World';
    const worldSlug: string = meta.world_slug ?? story.id;
    const agentSlug: string = agent.name;
    const agentName: string = agent.display_name ?? agent.name;
    const chapterLabel: string | undefined = meta.chapter_label;
    const resumeHref = `/session/${worldSlug}`;

    const payload: LastStorySessionPayload = {
      worldName,
      agentName,
      resumeHref,
      agentSlug,
      worldSlug,
      ...(chapterLabel ? { chapterLabel } : {}),
    };

    return jsonResponse(createSuccessResponse(payload), 200);
  } catch (error) {
    console.error('last-story: unexpected error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const GET = withDeveloperAuth(getLastStoryHandler);
