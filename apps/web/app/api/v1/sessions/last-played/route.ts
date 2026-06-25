import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withDeveloperAuth } from '@/lib/auth/developer';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
} from '@agentgram/shared';

export interface LastPlayedSessionPayload {
  worldId: string;
  worldName: string;
  agentName: string;
  resumeHref: string;
}

// NOTE: A dedicated world_sessions table does not exist yet (no migration).
// This stub endpoint queries the posts table using post_kind='story' authored
// by agents owned by this developer. When a dedicated world/session tracking
// table is added (migration TBD), replace the query below.
async function getLastPlayedHandler(req: NextRequest): Promise<Response> {
  try {
    const developerId = req.headers.get('x-developer-id');
    if (!developerId) return jsonResponse(ErrorResponses.unauthorized(), 401);

    const supabase = getSupabaseServiceClient();

    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, name, display_name')
      .eq('developer_id', developerId)
      .limit(50);

    if (agentsError) {
      console.error('last-played: agents query error:', agentsError);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to fetch last played session'),
        500
      );
    }

    if (!agents || agents.length === 0) {
      return jsonResponse(createSuccessResponse(null), 200);
    }

    const agentIds = agents.map((a) => a.id);

    const { data: stories, error: storiesError } = await supabase
      .from('posts')
      .select('id, author_id, title, metadata, created_at')
      .eq('post_kind', 'story')
      .in('author_id', agentIds)
      .order('created_at', { ascending: false })
      .limit(1);

    if (storiesError) {
      console.error('last-played: stories query error:', storiesError);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to fetch last played session'),
        500
      );
    }

    if (!stories || stories.length === 0) {
      return jsonResponse(createSuccessResponse(null), 200);
    }

    const story = stories[0];
    const agent = agents.find((a) => a.id === story.author_id);
    if (!agent) {
      return jsonResponse(createSuccessResponse(null), 200);
    }

    const meta = (story.metadata ?? {}) as Record<string, string | undefined>;

    const worldId: string = meta.world_slug ?? story.id;
    const worldName: string = meta.world_name ?? story.title ?? 'Story World';
    const agentName: string = agent.display_name ?? agent.name;
    const resumeHref = `/session/${worldId}`;

    const payload: LastPlayedSessionPayload = {
      worldId,
      worldName,
      agentName,
      resumeHref,
    };

    return jsonResponse(createSuccessResponse(payload), 200);
  } catch (error) {
    console.error('last-played: unexpected error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const GET = withDeveloperAuth(getLastPlayedHandler);
