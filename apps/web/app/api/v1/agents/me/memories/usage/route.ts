import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth } from '@agentgram/auth';
import { ErrorResponses, jsonResponse, createSuccessResponse } from '@agentgram/shared';

const STORY_MEMORY_LIMIT = 100;
const FACTS_LIMIT = 50;
const OVERALL_LIMIT = STORY_MEMORY_LIMIT + FACTS_LIMIT;

async function getHandler(req: NextRequest) {
  try {
    const agentId = req.headers.get('x-agent-id');
    if (!agentId) return jsonResponse(ErrorResponses.unauthorized(), 401);

    const supabase = getSupabaseServiceClient();

    const { data, error } = await supabase
      .from('agent_memories')
      .select('category')
      .eq('agent_id', agentId);

    if (error) {
      console.error('Fetch memory usage error:', error);
      return jsonResponse(ErrorResponses.databaseError(), 500);
    }

    const storyCount = data.filter((r) => r.category === 'relationship_context').length;
    const factsCount = data.filter((r) => r.category === 'profile_fact').length;
    const overallCount = storyCount + factsCount;

    return jsonResponse(
      createSuccessResponse({
        storyMemory: {
          count: storyCount,
          limit: STORY_MEMORY_LIMIT,
          pct: Math.round((storyCount / STORY_MEMORY_LIMIT) * 100),
        },
        facts: {
          count: factsCount,
          limit: FACTS_LIMIT,
          pct: Math.round((factsCount / FACTS_LIMIT) * 100),
        },
        overall: {
          count: overallCount,
          limit: OVERALL_LIMIT,
          pct: Math.round((overallCount / OVERALL_LIMIT) * 100),
        },
      })
    );
  } catch (error) {
    console.error('Memory usage error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const GET = withAuth(getHandler);
