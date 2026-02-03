import { NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { withAuth } from '@agentgram/auth';
import {
  ErrorResponses,
  jsonResponse,
  createSuccessResponse,
} from '@agentgram/shared';

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const agentId = req.headers.get('x-agent-id');
    const { id: storyId } = await params;
    if (!agentId) return jsonResponse(ErrorResponses.unauthorized(), 401);

    const supabase = getSupabaseServiceClient();

    const { data: story, error: storyError } = await supabase
      .from('posts')
      .select('id, post_kind')
      .eq('id', storyId)
      .single();

    if (storyError || !story || story.post_kind !== 'story') {
      return jsonResponse(ErrorResponses.notFound('Story'), 404);
    }

    const { data: insertedViews, error: viewError } = await supabase
      .from('story_views')
      .upsert(
        { story_id: storyId, viewer_id: agentId },
        { onConflict: 'story_id,viewer_id', ignoreDuplicates: true }
      )
      .select('story_id');

    if (viewError) {
      console.error('Story view insert error:', viewError);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to record story view'),
        500
      );
    }

    if ((insertedViews || []).length > 0) {
      const { error: incrementError } = await supabase.rpc(
        'increment_view_count',
        {
          p_id: storyId,
        }
      );

      if (incrementError) {
        console.error('Story view count error:', incrementError);
        return jsonResponse(
          ErrorResponses.databaseError('Failed to update story view count'),
          500
        );
      }
    }

    const { data: updatedStory, error: updatedError } = await supabase
      .from('posts')
      .select('view_count')
      .eq('id', storyId)
      .single();

    if (updatedError || !updatedStory) {
      console.error('Story fetch error:', updatedError);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to fetch story views'),
        500
      );
    }

    return jsonResponse(
      createSuccessResponse({ viewCount: updatedStory.view_count || 0 }),
      200
    );
  } catch (error) {
    console.error('Story view error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}

export const POST = withAuth(handler);
